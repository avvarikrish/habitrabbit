from flask import Blueprint, request, Response, make_response
from bson import json_util

from recommendation import Recommendation
from createbson import index_bson
from pkg import truncate

index_api = Blueprint('index_api', __name__)

from app import index_collection, gmaps

MAX_LOCATIONS = 25
METER_TO_STEP = 1.3123
PRECISION = 4

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
        steps = int(args['steps'])
        destinations = []
        recommendations = []
        final_recommendations = []
        locations = index_collection.find({'geometry': 
                                {'$near': 
                                    {'$geometry': 
                                        { 'type': 'Point',  
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
        
        # rows = gmaps.distance_matrix((latitude, longitude), destinations, mode='walking')
        rows = {'destination_addresses': ['4551 Carol Ave, Fremont, CA 94538, USA', '44152 Glendora Dr, Fremont, CA 94539, USA', '37873 Benchmark Ct, Fremont, CA 94536, USA', '11600 Pleasanton Sunol Rd, Sunol, CA 94586, USA', '6169 Thornton Ave, Newark, CA 94560, USA', '4590 Amiens Ave, Fremont, CA 94555, USA', '120 Dixon Landing Rd, Milpitas, CA 95035, USA', '32181 Condor Dr, Union City, CA 94587, USA', '748 Anacapa Ct, Milpitas, CA 95035, USA', '300 Neal St, Pleasanton, CA 94566, USA', '404 N Baywood Ave, San Jose, CA 95002, USA', '28313 Beatron Way, Hayward, CA 94544, USA', '7700 Highland Oaks Dr, Pleasanton, CA 94588, USA', '113 El Bosque Dr, San Jose, CA 95134, USA', '2410 Sebastopol Ln, Hayward, CA 94542, USA', '4225 Hacienda Dr, Pleasanton, CA 94588, USA', '17 Pheasant Hollow, Sunnyvale, CA 94089, USA', '4205 Cheeney St, Santa Clara, CA 95054, USA', '2273 Cryer St, Hayward, CA 94545, USA', '1420 Old Piedmont Rd, San Jose, CA 95132, USA', '6301 E Castro Valley Blvd, Castro Valley, CA 94552, USA', '7402 Dover Ln, Dublin, CA 94568, USA', '1600 Whitewood Dr, San Jose, CA 95131, USA', '597 Worley Ave, Sunnyvale, CA 94085, USA', '718 Grace St, Hayward, CA 94541, USA'], 'origin_addresses': ['41099 Bernie St, Fremont, CA 94539, USA'], 'rows': [{'elements': [{'distance': {'text': '4.4 km', 'value': 4362}, 'duration': {'text': '54 mins', 'value': 3254}, 'status': 'OK'}, {'distance': {'text': '5.5 km', 'value': 5527}, 'duration': {'text': '1 hour 9 mins', 'value': 4169}, 'status': 'OK'}, {'distance': {'text': '6.5 km', 'value': 6476}, 'duration': {'text': '1 hour 19 mins', 'value': 4753}, 'status': 'OK'}, {'distance': {'text': '28.8 km', 'value': 28812}, 'duration': {'text': '6 hours 35 mins', 'value': 23670}, 'status': 'OK'}, {'distance': {'text': '11.5 km', 'value': 11451}, 'duration': {'text': '2 hours 23 mins', 'value': 8595}, 'status': 'OK'}, {'distance': {'text': '12.6 km', 'value': 12641}, 'duration': {'text': '2 hours 37 mins', 'value': 9422}, 'status': 'OK'}, {'distance': {'text': '11.9 km', 'value': 11925}, 'duration': {'text': '2 hours 28 mins', 'value': 8906}, 'status': 'OK'}, {'distance': {'text': '11.4 km', 'value': 11422}, 'duration': {'text': '2 hours 19 mins', 'value': 8351}, 'status': 'OK'}, {'distance': {'text': '15.2 km', 'value': 15169}, 'duration': {'text': '3 hours 9 mins', 'value': 11341}, 'status': 'OK'}, {'distance': {'text': '42.8 km', 'value': 42816}, 'duration': {'text': '9 hours 2 mins', 'value': 32542}, 'status': 'OK'}, {'distance': {'text': '21.9 km', 'value': 21866}, 'duration': {'text': '4 hours 31 mins', 'value': 16287}, 'status': 'OK'}, {'distance': {'text': '15.5 km', 'value': 15462}, 'duration': {'text': '3 hours 9 mins', 'value': 11319}, 'status': 'OK'}, {'distance': {'text': '36.9 km', 'value': 36858}, 'duration': {'text': '7 hours 48 mins', 'value': 28080}, 'status': 'OK'}, {'distance': {'text': '20.1 km', 'value': 20149}, 'duration': {'text': '4 hours 9 mins', 'value': 14945}, 'status': 'OK'}, {'distance': {'text': '18.5 km', 'value': 18499}, 'duration': {'text': '3 hours 54 mins', 'value': 14014}, 'status': 'OK'}, {'distance': {'text': '38.8 km', 'value': 38849}, 'duration': {'text': '8 hours 14 mins', 'value': 29630}, 'status': 'OK'}, {'distance': {'text': '26.2 km', 'value': 26197}, 'duration': {'text': '5 hours 25 mins', 'value': 19496}, 'status': 'OK'}, {'distance': {'text': '22.7 km', 'value': 22697}, 'duration': {'text': '4 hours 42 mins', 'value': 16922}, 'status': 'OK'}, {'distance': {'text': '20.1 km', 'value': 20104}, 'duration': {'text': '4 hours 8 mins', 'value': 14885}, 'status': 'OK'}, {'distance': {'text': '21.1 km', 'value': 21141}, 'duration': {'text': '4 hours 26 mins', 'value': 15984}, 'status': 'OK'}, {'distance': {'text': '23.7 km', 'value': 23749}, 'duration': {'text': '5 hours 0 mins', 'value': 17978}, 'status': 'OK'}, {'distance': {'text': '35.7 km', 'value': 35717}, 'duration': {'text': '7 hours 34 mins', 'value': 27223}, 'status': 'OK'}, {'distance': {'text': '21.2 km', 'value': 21165}, 'duration': {'text': '4 hours 25 mins', 'value': 15875}, 'status': 'OK'}, {'distance': {'text': '27.2 km', 'value': 27198}, 'duration': {'text': '5 hours 38 mins', 'value': 20277}, 'status': 'OK'}, {'distance': {'text': '20.1 km', 'value': 20140}, 'duration': {'text': '4 hours 9 mins', 'value': 14940}, 'status': 'OK'}]}], 'status': 'OK'}
        
        elements = rows['rows'][0]['elements']
        for i in range(len(elements)):
            element = elements[i]
            recommendations[i].set_steps(element['distance']['value'] * METER_TO_STEP)
            recommendations[i].set_address(rows['destination_addresses'][i])
            recommendations[i].set_time(element['duration']['value'])
            recommendations[i].set_time_str(element['duration']['text'])

        sorted_recommendations = sorted(recommendations, key=lambda rec: score(rec, steps), reverse=True)
        for recommendation in sorted_recommendations:
            final_recommendations.append(recommendation.to_json())

        response = make_response(json_util.dumps(final_recommendations), 200)

    except KeyError:
        response = make_response(Response('invalid client request'), 400)

    except Exception as e:
        response = make_response(Response(e), 500)

    finally:
        return response

def score(recommendation: Recommendation, min_steps):
    rec_steps = recommendation.get_steps()
    if rec_steps < min_steps:
        return (recommendation.get_frequency() / 100) + (rec_steps / 100)
    if rec_steps > min_steps + 1000:
        return (recommendation.get_frequency() / rec_steps) + (1 / rec_steps)
    return recommendation.get_frequency() + (1 / rec_steps) + (1 / recommendation.get_time())
