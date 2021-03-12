from flask import Blueprint, request, Response, make_response
from bson import json_util

from recommendation import Recommendation
from createbson import index_bson
from pkg import truncate, height_to_stride

import os
import requests
import datetime
import math
import pytz
import time

index_api = Blueprint('index_api', __name__)

from app import index_collection, gmaps, users_collection, scores_collection

MAX_LOCATIONS = 25
METER_TO_STEP = 1.3123
PRECISION = 4
STEPS_THRESHOLD = 0.8
TZ = pytz.timezone('America/Los_Angeles')

# add location to the index (if already exists, increment frequency by 1)
@index_api.route('/add-location', methods=['POST'])
def add_location():
    response = make_response(Response('success'), 200)
    try:
        location = request.json
        longitude = truncate(location['longitude'], PRECISION)
        latitude = truncate(location['latitude'], PRECISION)
        index_collection.update_one({'longitude': longitude, 'latitude': latitude},
                                    {'$setOnInsert': index_bson(longitude, latitude), '$inc': {'properties.frequency': 1}},
                                    upsert=True)

    except KeyError:
        response = make_response(Response('invalid client request'), 400)

    except Exception as e:
        response = make_response(Response(e), 500)

    finally:
        return response

# get location recommendations for steps
@index_api.route('/get-locations', methods=['GET'])
def get_locations():
    response = []
    try:
        # request arguments
        args = request.args.to_dict()
        longitude = truncate(float(args['longitude']), PRECISION)
        latitude = truncate(float(args['latitude']), PRECISION)
        longitude_two_dec = truncate(float(args['longitude']), 2)
        latitude_two_dec = truncate(float(args['latitude']), 2)
        steps = int(args['steps'])
        username = args['username']
        user_stride = height_to_stride(float(args['height']))

        destinations = []
        recommendations = []
        final_recommendations = []

        # get user
        user = users_collection.find_one({'username': username})
        if user is None:
            response = make_response(Response('user not found: ' + username), 401)
        else:
            wakeup_time = user['goals']['sleep']['time']
            sleep_goal = user['goals']['sleep']['goal']
            sleep_time = wakeup_time - sleep_goal
            avg_steps = 0
            avg_steps_goal = 0
            if sleep_time < 0:
                sleep_time += 24

            # get averages past 7 days of scores
            last_week_date = datetime.datetime.now() - datetime.timedelta(days=7)
            last_week_scores = scores_collection.aggregate([
                { 
                    "$match": {
                        "username": username,
                        "day": {
                            "$gte": last_week_date.day
                        },
                        "month": {
                            "$gte": last_week_date.month
                        },
                        "year": {
                            "$gte": last_week_date.year
                        }
                    }
                }, 
                {
                    "$group": {
                        "_id": "null",
                        "value": {
                            "$avg": "$subscores.steps.value"
                        },
                        "goal": {
                            "$avg": "$subscores.steps.goal"
                        }
                    }
                }
            ])
            for avg_score in last_week_scores:
                avg_steps = avg_score['value']
                avg_steps_goal = avg_score['goal']
            print("GOAL", avg_steps_goal)
            last_week_score = avg_steps/avg_steps_goal
            add_steps = 0
            if last_week_score < STEPS_THRESHOLD:
                add_steps = (avg_steps_goal * STEPS_THRESHOLD) - avg_steps
            

            # get weather forecast with OpenWeatherMap
            weather_url = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + str(latitude_two_dec) + '&lon=' + str(longitude_two_dec) + '&exclude=daily,current,minutely&appid=' + os.environ.get('OPEN_WEATHER_KEY') + '&units=imperial'
            weather_response = requests.get(weather_url)
            valid_weather_times = weather_parse(weather_response.json(), math.floor(sleep_time), math.ceil(wakeup_time))

            # get top MAX_LOCATIONS of closest locations in index
            locations = index_collection.find({'geometry': 
                                    {'$near': 
                                        {'$geometry': 
                                            {'type': 'Point',  
                                            'coordinates': [longitude, latitude] 
                                            }
                                        }
                                    }
                                }).limit(MAX_LOCATIONS)

            # add recommendations to list
            for location in locations:
                destinations.append((location['latitude'], location['longitude']))
                recommendation = Recommendation()
                recommendation.set_latitude(location['latitude'])
                recommendation.set_longitude(location['longitude'])
                recommendation.set_frequency(location['properties']['frequency'])
                recommendations.append(recommendation)
            
            # Google Maps Distance Matrix API to get routes distance to all 25 locations
            rows = gmaps.distance_matrix((latitude, longitude), destinations, mode='walking')
            # rows = {'destination_addresses': ['Unnamed Road, Brookings, OR 97415, USA', 'Unnamed Road, Smith River, CA 95567, USA', '2445 S Fred D Haight Dr, Smith River, CA 95567, USA', '6089 Lake Earl Dr, Crescent City, CA 95532, USA', '250 Dundas Rd, Crescent City, CA 95531, USA', '15035 US-199, Gasquet, CA 95543, USA', 'Unnamed Road, Gold Beach, OR 97444, USA', "NF-9938, O'Brien, OR 97534, USA", '23350 Redwood Hwy, Kerby, OR 97531, USA', '680 Hays Cut Off Rd, Cave Junction, OR 97523, USA', '95445 Mussel Creek Rd, Gold Beach, OR 97444, USA', '41.51823,-124.03075', '535 Thompson Creek Rd, Selma, OR 97538, USA', '36975 Agness Illahe Rd, Agness, OR 97406, USA', 'NF-620, Wilderville, OR 97543, USA', '10223 Redwood Hwy, Wilderville, OR 97543, USA', 'Unnamed Road, Happy Camp, CA 96039, USA', '103 Flake St, Port Orford, OR 97465, USA', '42135 Old Mill Rd, Port Orford, OR 97465, USA', 'Rock Creek Rd, Williams, OR 97544, USA', '1628-1656 Grays Creek Rd, Grants Pass, OR 97527, USA', '4880 Galice Rd, Merlin, OR 97532, USA', '96521 Co Hwy 184, Sixes, OR 97476, USA', '397 Majestic Dr, Grants Pass, OR 97527, USA', '121616 US-101, Orick, CA 95555, USA'], 'origin_addresses': ['401 Hillside Ave, Brookings, OR 97415, USA'], 'rows': [{'elements': [{'distance': {'text': '10.2 km', 'value': 10184}, 'duration': {'text': '2 hours 24 mins', 'value': 8649}, 'status': 'OK'}, {'distance': {'text': '21.9 km', 'value': 21852}, 'duration': {'text': '4 hours 55 mins', 'value': 17721}, 'status': 'OK'}, {'distance': {'text': '24.6 km', 'value': 24577}, 'duration': {'text': '4 hours 57 mins', 'value': 17808}, 'status': 'OK'}, {'distance': {'text': '30.2 km', 'value': 30240}, 'duration': {'text': '6 hours 6 mins', 'value': 21944}, 'status': 'OK'}, {'distance': {'text': '38.3 km', 'value': 38282}, 'duration': {'text': '7 hours 44 mins', 'value': 27815}, 'status': 'OK'}, {'distance': {'text': '71.3 km', 'value': 71330}, 'duration': {'text': '14 hours 39 mins', 'value': 52768}, 'status': 'OK'}, {'distance': {'text': '51.1 km', 'value': 51095}, 'duration': {'text': '10 hours 27 mins', 'value': 37595}, 'status': 'OK'}, {'distance': {'text': '101 km', 'value': 101302}, 'duration': {'text': '21 hours 0 mins', 'value': 75623}, 'status': 'OK'}, {'distance': {'text': '116 km', 'value': 115892}, 'duration': {'text': '23 hours 58 mins', 'value': 86264}, 'status': 'OK'}, {'distance': {'text': '115 km', 'value': 115402}, 'duration': {'text': '23 hours 54 mins', 'value': 86049}, 'status': 'OK'}, {'distance': {'text': '70.8 km', 'value': 70809}, 'duration': {'text': '14 hours 25 mins', 'value': 51876}, 'status': 'OK'}, {'status': 'ZERO_RESULTS'}, {'distance': {'text': '130 km', 'value': 129573}, 'duration': {'text': '1 day 3 hours', 'value': 96395}, 'status': 'OK'}, {'distance': {'text': '116 km', 'value': 115522}, 'duration': {'text': '1 day 1 hour', 'value': 90099}, 'status': 'OK'}, {'distance': {'text': '146 km', 'value': 146026}, 'duration': {'text': '1 day 6 hours', 'value': 109682}, 'status': 'OK'}, {'distance': {'text': '139 km', 'value': 139112}, 'duration': {'text': '1 day 5 hours', 'value': 103082}, 'status': 'OK'}, {'distance': {'text': '165 km', 'value': 164827}, 'duration': {'text': '1 day 11 hours', 'value': 126411}, 'status': 'OK'}, {'distance': {'text': '95.2 km', 'value': 95157}, 'duration': {'text': '19 hours 39 mins', 'value': 70726}, 'status': 'OK'}, {'distance': {'text': '94.6 km', 'value': 94615}, 'duration': {'text': '19 hours 31 mins', 'value': 70232}, 'status': 'OK'}, {'distance': {'text': '164 km', 'value': 164022}, 'duration': {'text': '1 day 10 hours', 'value': 124129}, 'status': 'OK'}, {'distance': {'text': '157 km', 'value': 157279}, 'duration': {'text': '1 day 9 hours', 'value': 118556}, 'status': 'OK'}, {'distance': {'text': '173 km', 'value': 172559}, 'duration': {'text': '1 day 11 hours', 'value': 127339}, 'status': 'OK'}, {'distance': {'text': '116 km', 'value': 115769}, 'duration': {'text': '23 hours 49 mins', 'value': 85711}, 'status': 'OK'}, {'distance': {'text': '154 km', 'value': 154479}, 'duration': {'text': '1 day 8 hours', 'value': 114390}, 'status': 'OK'}, {'distance': {'text': '596 km', 'value': 596184}, 'duration': {'text': '5 days 5 hours', 'value': 451626}, 'status': 'OK'}]}], 'status': 'OK'}

            # add Google Maps data to each recommendation
            elements = rows['rows'][0]['elements']
            del_recs = []
            for i in range(len(elements)):
                element = elements[i]
                if element['status'] == 'OK':
                    recommendations[i].set_steps(element['distance']['value'] / user_stride)
                    recommendations[i].set_address(rows['destination_addresses'][i])
                    recommendations[i].set_time(element['duration']['value'])
                    recommendations[i].set_time_str(element['duration']['text'])

                    duration_hour = element['duration']['value'] / 3600
                    for weather_time in valid_weather_times:
                        recommendations[i].add_weather_time(dict(weather_time))
                        if weather_time['end'] - weather_time['start'] < duration_hour:
                            recommendations[i].set_latest_weather_time(False)
                        else:
                            if weather_time['valid']:
                                recommendations[i].add_valid_weather_hours(weather_time['end'] - weather_time['start'])
                else:
                    del_recs.append(i)

            # delete recommendations that Google Maps has no data for
            for rec in del_recs:
                del recommendations[rec]

            # sort recommendations using scoring/ranking function
            sorted_recommendations = sorted(recommendations, key=lambda rec: score(rec, steps, add_steps), reverse=True)

            # create jsons of all recommendations and create a response
            for recommendation in sorted_recommendations:
                final_recommendations.append(recommendation.to_json())

            response = make_response(json_util.dumps(final_recommendations), 200)

    except KeyError as e:
        response = make_response(Response('invalid client request'), 400)

    except Exception as e:
        print(e)
        response = make_response(Response(e), 500)

    finally:
        return response

# get time to sleep and projected score
@index_api.route('/get-sleep', methods=['GET'])
def get_sleep():
    response = []
    try:
        # request args
        args = request.args.to_dict()
        username = args['username']

        # get current time
        current_time = datetime.datetime.fromtimestamp(time.time(), TZ)
        current_hour, current_min = current_time.hour, current_time.minute

        # get user
        user = users_collection.find_one({'username': username})
        if user is None:
            response = make_response(Response('user not found: ' + username), 401)
        else:
            # calculate sleep time
            wakeup_time = user['goals']['sleep']['time']
            sleep_goal = user['goals']['sleep']['goal']
            goal_hours = math.floor(sleep_goal)
            goal_min = (sleep_goal - goal_hours) * 60
            wakeup_hour = math.floor(wakeup_time)
            wakeup_min = 60 * (wakeup_time-wakeup_hour)

            start_min = wakeup_min - goal_min
            start_hour = wakeup_hour - goal_hours
            if start_min < 0:
                start_min = start_min + 60
                start_hour -= 1
            if start_hour < 0:
                start_hour += 24

            modified_wakeup_hour = wakeup_hour + 24 if wakeup_hour <= current_hour else wakeup_hour
            modified_wakeup_min = wakeup_min
            if wakeup_min <= current_min:
                modified_wakeup_hour -= 1
                modified_wakeup_min += 60

            time_diff = (modified_wakeup_hour - current_hour) + ((modified_wakeup_min - current_min) / 60)
            rec = {}
            # if current time is past bedtime
            if time_diff <= sleep_goal:
                rec = {
                    'start_hour': current_hour,
                    'start_min': current_min,
                    'end_hour': wakeup_hour,
                    'end_min': wakeup_min,
                    'score': (time_diff / sleep_goal) * 100
                }
            # if current time is before bedtime
            else:
                rec = {
                    'start_hour': start_hour,
                    'start_min': start_min,
                    'end_hour': wakeup_hour,
                    'end_min': wakeup_min,
                    'score': 100
                }

            response = make_response(json_util.dumps(rec), 200)

    except KeyError as e:
        response = make_response(Response('invalid client request'), 400)

    except Exception as e:
        print(e)
        response = make_response(Response(e), 500)

    finally:
        return response

# scoring function
def score(recommendation: Recommendation, min_steps, add_steps):
    # current recommendation steps
    rec_steps = recommendation.get_steps()

    # valid times of good weather
    valid_time_ranges = recommendation.get_valid_weather_hours() / 2

    # location frequency
    frequency = recommendation.get_frequency()

    # steps proportion
    steps_proportion_upper = rec_steps / (min_steps + add_steps + 500)
    steps_proportion_lower = rec_steps / min_steps

    # final score
    steps_proportion = steps_proportion_upper * steps_proportion_lower

    return frequency + valid_time_ranges + (1 - abs(1-steps_proportion))

def weather_parse(weather_response, sleep_hour, wakeup_hour):
    final_weather_list = []
    previous_valid = -2
    one_complete = False
    

    current_hour = datetime.datetime.now(TZ).hour
    if current_hour > 0:
        final_weather_list.append({'start': 0, 'end': current_hour, 'temp': '', 'description': '', 'valid': False})

    for hour in weather_response['hourly']:
        current_hour = datetime.datetime.fromtimestamp(int(hour['dt']), TZ).hour
        is_valid = True

        # stop at 0 hour
        if current_hour == 0 and one_complete:
            break
        
        # if alerts weather
        if 'alerts' in weather_response:
            for alert in weather_response['alerts']:
                if hour['dt'] > alert['start'] and hour['dt'] < alert['end']:
                    is_valid = False
                    break
        
        # if good weather
        if is_valid and hour['weather'][0]['id'] // 100 == 8:
            if previous_valid != 1:
                final_weather_list.append({'start': current_hour, 'end': current_hour + 1, 'temp': hour['temp'], 'description': hour['weather'][0]['main'], 'valid': True})
            else:
                final_weather_list[-1]['end'] += 1
                final_weather_list[-1]['temp'] = (final_weather_list[-1]['temp'] + hour['temp']) / 2
            previous_valid = 1
        # if bad weather
        else:
            if previous_valid != 2:
                final_weather_list.append({'start': current_hour, 'end': current_hour + 1, 'temp': hour['temp'], 'description': hour['weather'][0]['main'], 'valid': False})
            else:
                final_weather_list[-1]['end'] += 1
                final_weather_list[-1]['temp'] = (final_weather_list[-1]['temp'] + hour['temp']) / 2
            previous_valid = 2

        one_complete = True
    return final_weather_list
