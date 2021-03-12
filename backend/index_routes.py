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

# API_KEY = os.environ.get('API_KEY')

# class InvalidKeyError(Exception):
#     pass

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

@index_api.route('/get-locations', methods=['GET'])
def get_locations():
    response = []
    try:
        args = request.args.to_dict()
        longitude = truncate(float(args['longitude']), PRECISION)
        latitude = truncate(float(args['latitude']), PRECISION)
        longitude_two_dec = truncate(float(args['longitude']), 2)
        latitude_two_dec = truncate(float(args['latitude']), 2)
        steps = int(args['steps'])
        username = args['username']
        user_stride = height_to_stride(float(args['height']))
        # api_key = args['key']

        # if api_key != API_KEY:
        #     raise InvalidKeyError

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

            # past 7 scores
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
            

            # weather
            weather_url = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + str(latitude_two_dec) + '&lon=' + str(longitude_two_dec) + '&exclude=daily,current,minutely&appid=' + os.environ.get('OPEN_WEATHER_KEY') + '&units=imperial'
            weather_response = requests.get(weather_url)
            valid_weather_times = weather_parse(weather_response.json(), math.floor(sleep_time), math.ceil(wakeup_time))

            # closest locations in index
            locations = index_collection.find({'geometry': 
                                    {'$near': 
                                        {'$geometry': 
                                            {'type': 'Point',  
                                            'coordinates': [longitude, latitude] 
                                            }
                                        }
                                    }
                                }).limit(MAX_LOCATIONS)

            for location in locations:
                destinations.append((location['latitude'], location['longitude']))
                recommendation = Recommendation()
                recommendation.set_latitude(location['latitude'])
                recommendation.set_longitude(location['longitude'])
                recommendation.set_frequency(location['properties']['frequency'])
                recommendations.append(recommendation)
            
            # google maps
            # latitude = 42.0526114
            # longitude = -124.2839819
            rows = gmaps.distance_matrix((latitude, longitude), destinations, mode='walking')
            # print(rows)
            # rows = {'destination_addresses': ['Unnamed Road, Brookings, OR 97415, USA', 'Unnamed Road, Smith River, CA 95567, USA', '2445 S Fred D Haight Dr, Smith River, CA 95567, USA', '6089 Lake Earl Dr, Crescent City, CA 95532, USA', '250 Dundas Rd, Crescent City, CA 95531, USA', '15035 US-199, Gasquet, CA 95543, USA', 'Unnamed Road, Gold Beach, OR 97444, USA', "NF-9938, O'Brien, OR 97534, USA", '23350 Redwood Hwy, Kerby, OR 97531, USA', '680 Hays Cut Off Rd, Cave Junction, OR 97523, USA', '95445 Mussel Creek Rd, Gold Beach, OR 97444, USA', '41.51823,-124.03075', '535 Thompson Creek Rd, Selma, OR 97538, USA', '36975 Agness Illahe Rd, Agness, OR 97406, USA', 'NF-620, Wilderville, OR 97543, USA', '10223 Redwood Hwy, Wilderville, OR 97543, USA', 'Unnamed Road, Happy Camp, CA 96039, USA', '103 Flake St, Port Orford, OR 97465, USA', '42135 Old Mill Rd, Port Orford, OR 97465, USA', 'Rock Creek Rd, Williams, OR 97544, USA', '1628-1656 Grays Creek Rd, Grants Pass, OR 97527, USA', '4880 Galice Rd, Merlin, OR 97532, USA', '96521 Co Hwy 184, Sixes, OR 97476, USA', '397 Majestic Dr, Grants Pass, OR 97527, USA', '121616 US-101, Orick, CA 95555, USA'], 'origin_addresses': ['401 Hillside Ave, Brookings, OR 97415, USA'], 'rows': [{'elements': [{'distance': {'text': '10.2 km', 'value': 10184}, 'duration': {'text': '2 hours 24 mins', 'value': 8649}, 'status': 'OK'}, {'distance': {'text': '21.9 km', 'value': 21852}, 'duration': {'text': '4 hours 55 mins', 'value': 17721}, 'status': 'OK'}, {'distance': {'text': '24.6 km', 'value': 24577}, 'duration': {'text': '4 hours 57 mins', 'value': 17808}, 'status': 'OK'}, {'distance': {'text': '30.2 km', 'value': 30240}, 'duration': {'text': '6 hours 6 mins', 'value': 21944}, 'status': 'OK'}, {'distance': {'text': '38.3 km', 'value': 38282}, 'duration': {'text': '7 hours 44 mins', 'value': 27815}, 'status': 'OK'}, {'distance': {'text': '71.3 km', 'value': 71330}, 'duration': {'text': '14 hours 39 mins', 'value': 52768}, 'status': 'OK'}, {'distance': {'text': '51.1 km', 'value': 51095}, 'duration': {'text': '10 hours 27 mins', 'value': 37595}, 'status': 'OK'}, {'distance': {'text': '101 km', 'value': 101302}, 'duration': {'text': '21 hours 0 mins', 'value': 75623}, 'status': 'OK'}, {'distance': {'text': '116 km', 'value': 115892}, 'duration': {'text': '23 hours 58 mins', 'value': 86264}, 'status': 'OK'}, {'distance': {'text': '115 km', 'value': 115402}, 'duration': {'text': '23 hours 54 mins', 'value': 86049}, 'status': 'OK'}, {'distance': {'text': '70.8 km', 'value': 70809}, 'duration': {'text': '14 hours 25 mins', 'value': 51876}, 'status': 'OK'}, {'status': 'ZERO_RESULTS'}, {'distance': {'text': '130 km', 'value': 129573}, 'duration': {'text': '1 day 3 hours', 'value': 96395}, 'status': 'OK'}, {'distance': {'text': '116 km', 'value': 115522}, 'duration': {'text': '1 day 1 hour', 'value': 90099}, 'status': 'OK'}, {'distance': {'text': '146 km', 'value': 146026}, 'duration': {'text': '1 day 6 hours', 'value': 109682}, 'status': 'OK'}, {'distance': {'text': '139 km', 'value': 139112}, 'duration': {'text': '1 day 5 hours', 'value': 103082}, 'status': 'OK'}, {'distance': {'text': '165 km', 'value': 164827}, 'duration': {'text': '1 day 11 hours', 'value': 126411}, 'status': 'OK'}, {'distance': {'text': '95.2 km', 'value': 95157}, 'duration': {'text': '19 hours 39 mins', 'value': 70726}, 'status': 'OK'}, {'distance': {'text': '94.6 km', 'value': 94615}, 'duration': {'text': '19 hours 31 mins', 'value': 70232}, 'status': 'OK'}, {'distance': {'text': '164 km', 'value': 164022}, 'duration': {'text': '1 day 10 hours', 'value': 124129}, 'status': 'OK'}, {'distance': {'text': '157 km', 'value': 157279}, 'duration': {'text': '1 day 9 hours', 'value': 118556}, 'status': 'OK'}, {'distance': {'text': '173 km', 'value': 172559}, 'duration': {'text': '1 day 11 hours', 'value': 127339}, 'status': 'OK'}, {'distance': {'text': '116 km', 'value': 115769}, 'duration': {'text': '23 hours 49 mins', 'value': 85711}, 'status': 'OK'}, {'distance': {'text': '154 km', 'value': 154479}, 'duration': {'text': '1 day 8 hours', 'value': 114390}, 'status': 'OK'}, {'distance': {'text': '596 km', 'value': 596184}, 'duration': {'text': '5 days 5 hours', 'value': 451626}, 'status': 'OK'}]}], 'status': 'OK'}
            # rows = {'destination_addresses': ['4551 Carol Ave, Fremont, CA 94538, USA', '44152 Glendora Dr, Fremont, CA 94539, USA', '37873 Benchmark Ct, Fremont, CA 94536, USA', '11600 Pleasanton Sunol Rd, Sunol, CA 94586, USA', '6169 Thornton Ave, Newark, CA 94560, USA', '4590 Amiens Ave, Fremont, CA 94555, USA', '120 Dixon Landing Rd, Milpitas, CA 95035, USA', '32181 Condor Dr, Union City, CA 94587, USA', '748 Anacapa Ct, Milpitas, CA 95035, USA', '300 Neal St, Pleasanton, CA 94566, USA', '404 N Baywood Ave, San Jose, CA 95002, USA', '28313 Beatron Way, Hayward, CA 94544, USA', '7700 Highland Oaks Dr, Pleasanton, CA 94588, USA', '113 El Bosque Dr, San Jose, CA 95134, USA', '2410 Sebastopol Ln, Hayward, CA 94542, USA', '4225 Hacienda Dr, Pleasanton, CA 94588, USA', '17 Pheasant Hollow, Sunnyvale, CA 94089, USA', '4205 Cheeney St, Santa Clara, CA 95054, USA', '2273 Cryer St, Hayward, CA 94545, USA', '1420 Old Piedmont Rd, San Jose, CA 95132, USA', '6301 E Castro Valley Blvd, Castro Valley, CA 94552, USA', '7402 Dover Ln, Dublin, CA 94568, USA', '1600 Whitewood Dr, San Jose, CA 95131, USA', '597 Worley Ave, Sunnyvale, CA 94085, USA', '718 Grace St, Hayward, CA 94541, USA'], 'origin_addresses': ['41099 Bernie St, Fremont, CA 94539, USA'], 'rows': [{'elements': [{'distance': {'text': '4.4 km', 'value': 4362}, 'duration': {'text': '54 mins', 'value': 3254}, 'status': 'OK'}, {'distance': {'text': '5.5 km', 'value': 5527}, 'duration': {'text': '1 hour 9 mins', 'value': 4169}, 'status': 'OK'}, {'distance': {'text': '6.5 km', 'value': 6476}, 'duration': {'text': '1 hour 19 mins', 'value': 4753}, 'status': 'OK'}, {'distance': {'text': '28.8 km', 'value': 28812}, 'duration': {'text': '6 hours 35 mins', 'value': 23670}, 'status': 'OK'}, {'distance': {'text': '11.5 km', 'value': 11451}, 'duration': {'text': '2 hours 23 mins', 'value': 8595}, 'status': 'OK'}, {'distance': {'text': '12.6 km', 'value': 12641}, 'duration': {'text': '2 hours 37 mins', 'value': 9422}, 'status': 'OK'}, {'distance': {'text': '11.9 km', 'value': 11925}, 'duration': {'text': '2 hours 28 mins', 'value': 8906}, 'status': 'OK'}, {'distance': {'text': '11.4 km', 'value': 11422}, 'duration': {'text': '2 hours 19 mins', 'value': 8351}, 'status': 'OK'}, {'distance': {'text': '15.2 km', 'value': 15169}, 'duration': {'text': '3 hours 9 mins', 'value': 11341}, 'status': 'OK'}, {'distance': {'text': '42.8 km', 'value': 42816}, 'duration': {'text': '9 hours 2 mins', 'value': 32542}, 'status': 'OK'}, {'distance': {'text': '21.9 km', 'value': 21866}, 'duration': {'text': '4 hours 31 mins', 'value': 16287}, 'status': 'OK'}, {'distance': {'text': '15.5 km', 'value': 15462}, 'duration': {'text': '3 hours 9 mins', 'value': 11319}, 'status': 'OK'}, {'distance': {'text': '36.9 km', 'value': 36858}, 'duration': {'text': '7 hours 48 mins', 'value': 28080}, 'status': 'OK'}, {'distance': {'text': '20.1 km', 'value': 20149}, 'duration': {'text': '4 hours 9 mins', 'value': 14945}, 'status': 'OK'}, {'distance': {'text': '18.5 km', 'value': 18499}, 'duration': {'text': '3 hours 54 mins', 'value': 14014}, 'status': 'OK'}, {'distance': {'text': '38.8 km', 'value': 38849}, 'duration': {'text': '8 hours 14 mins', 'value': 29630}, 'status': 'OK'}, {'distance': {'text': '26.2 km', 'value': 26197}, 'duration': {'text': '5 hours 25 mins', 'value': 19496}, 'status': 'OK'}, {'distance': {'text': '22.7 km', 'value': 22697}, 'duration': {'text': '4 hours 42 mins', 'value': 16922}, 'status': 'OK'}, {'distance': {'text': '20.1 km', 'value': 20104}, 'duration': {'text': '4 hours 8 mins', 'value': 14885}, 'status': 'OK'}, {'distance': {'text': '21.1 km', 'value': 21141}, 'duration': {'text': '4 hours 26 mins', 'value': 15984}, 'status': 'OK'}, {'distance': {'text': '23.7 km', 'value': 23749}, 'duration': {'text': '5 hours 0 mins', 'value': 17978}, 'status': 'OK'}, {'distance': {'text': '35.7 km', 'value': 35717}, 'duration': {'text': '7 hours 34 mins', 'value': 27223}, 'status': 'OK'}, {'distance': {'text': '21.2 km', 'value': 21165}, 'duration': {'text': '4 hours 25 mins', 'value': 15875}, 'status': 'OK'}, {'distance': {'text': '27.2 km', 'value': 27198}, 'duration': {'text': '5 hours 38 mins', 'value': 20277}, 'status': 'OK'}, {'distance': {'text': '20.1 km', 'value': 20140}, 'duration': {'text': '4 hours 9 mins', 'value': 14940}, 'status': 'OK'}]}], 'status': 'OK'}
            # print(rows)

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

            for rec in del_recs:
                del recommendations[rec]

            last_week_score = avg_steps/avg_steps_goal
            add_steps = 0
            if last_week_score < STEPS_THRESHOLD:
                add_steps = (avg_steps_goal * STEPS_THRESHOLD) - avg_steps
            sorted_recommendations = sorted(recommendations, key=lambda rec: score(rec, steps, add_steps), reverse=True)

            for recommendation in sorted_recommendations:
                final_recommendations.append(recommendation.to_json())

            response = make_response(json_util.dumps(final_recommendations), 200)

    except KeyError as e:
        print(e)
        response = make_response(Response('invalid client request'), 400)

    # except InvalidKeyError
    #     response = make_response(Response(''), 401)

    except Exception as e:
        print(e)
        response = make_response(Response(e), 500)

    finally:
        return response

@index_api.route('/get-sleep', methods=['GET'])
def get_sleep():
    response = []
    try:
        args = request.args.to_dict()
        username = args['username']
        tz = pytz.timezone('America/Los_Angeles')
        current_time = datetime.datetime.fromtimestamp(time.time(), tz)
        current_hour, current_min = current_time.hour, current_time.minute
        user = users_collection.find_one({'username': username})
        if user is None:
            response = make_response(Response('user not found: ' + username), 401)
        else:
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
            if time_diff <= sleep_goal:
                rec = {
                    'start_hour': current_hour,
                    'start_min': current_min,
                    'end_hour': wakeup_hour,
                    'end_min': wakeup_min,
                    'score': (time_diff / sleep_goal) * 100
                }
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
        print(e)
        response = make_response(Response('invalid client request'), 400)

    except Exception as e:
        response = make_response(Response(e), 500)

    finally:
        return response

def score(recommendation: Recommendation, min_steps, add_steps):
    rec_steps = recommendation.get_steps()
    valid_time_ranges = recommendation.get_valid_weather_hours() / (recommendation.get_time() / 3600)
    frequency = recommendation.get_frequency()
    steps_proportion_upper = rec_steps / (min_steps + add_steps + 500)
    steps_proportion_lower = rec_steps / min_steps
    steps_proportion = steps_proportion_upper * steps_proportion_lower

    return frequency + valid_time_ranges + (1 - abs(1-steps_proportion))

def weather_parse(weather_response, sleep_hour, wakeup_hour):
    final_weather_list = []
    previous_valid = -2
    one_complete = False
    # current_time = datetime.datetime.now().hour

    tz = pytz.timezone('America/Los_Angeles')
    current_time = datetime.datetime.now(tz).hour
    first_hour = datetime.datetime.fromtimestamp(int(weather_response['hourly'][0]['dt']), tz).hour
    begin_hour = max(first_hour, wakeup_hour) if first_hour > 0 else wakeup_hour
    if begin_hour > 0:
        final_weather_list.append({'start': 0, 'end': current_time, 'temp': '', 'description': '', 'valid': False})

    if sleep_hour < current_time:
        sleep_hour += 24
    for hour in weather_response['hourly']:
        current_hour = datetime.datetime.fromtimestamp(int(hour['dt']), tz).hour
        is_valid = True if current_hour < sleep_hour and current_hour >= begin_hour else False

        # stop at 0 hour
        if current_hour == 0 and one_complete:
            break
                
        if 'alerts' in weather_response:
            for alert in weather_response['alerts']:
                if hour['dt'] > alert['start'] and hour['dt'] < alert['end']:
                    is_valid = False
                    break
        if is_valid and hour['weather'][0]['id'] // 100 == 8:
            if previous_valid != 1:
                final_weather_list.append({'start': current_hour, 'end': current_hour + 1, 'temp': hour['temp'], 'description': hour['weather'][0]['main'], 'valid': True})
            else:
                final_weather_list[-1]['end'] += 1
                final_weather_list[-1]['temp'] = (final_weather_list[-1]['temp'] + hour['temp']) / 2
            previous_valid = 1
        else:
            if previous_valid != 2:
                final_weather_list.append({'start': current_hour, 'end': current_hour + 1, 'temp': hour['temp'], 'description': hour['weather'][0]['main'], 'valid': False})
            else:
                final_weather_list[-1]['end'] += 1
                final_weather_list[-1]['temp'] = (final_weather_list[-1]['temp'] + hour['temp']) / 2
            previous_valid = 2

        one_complete = True
    return final_weather_list
