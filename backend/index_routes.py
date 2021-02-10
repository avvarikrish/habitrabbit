from flask import Blueprint, request, Response, make_response
from createbson import index_bson
from bson import json_util

index_api = Blueprint('index_api', __name__)

from app import index_collection

MAX_LOCATIONS = 25

@index_api.route('/add-location', methods=['POST'])
def add_location():
    response = make_response(Response('success'), 200)
    try:
        location = request.json
        longitude = location['longitude']
        latitude = location['latitude']
        index_collection.update_one({'longitude': longitude, 'latitude': latitude},
                                    {'$setOnInsert': index_bson(longitude, latitude), '$inc': {'properties.frequency': 1}},
                                    upsert=True)

    except KeyError:
        response = make_response(Response('invalid client request'), 400)

    finally:
        return response

@index_api.route('/get-locations', methods=['GET'])
def get_locations():
    response = []
    try:
        args = request.args.to_dict()
        longitude = float(args['longitude'])
        latitude = float(args['latitude'])
        print("LONGITUDE", longitude)
        print("LATITUDE", latitude)
        locations = index_collection.find({'geometry': 
                                {'$near': 
                                    {'$geometry': 
                                        { 'type': 'Point',  
                                        'coordinates': [longitude, latitude] 
                                        }
                                    }
                                }
                            }).limit(MAX_LOCATIONS)
        print(locations)
        response = make_response(json_util.dumps(locations), 200)

    except KeyError:
        response = make_response(Response('invalid client request'), 400)

    except Exception as e:
        print(e)

    finally:
        return response
