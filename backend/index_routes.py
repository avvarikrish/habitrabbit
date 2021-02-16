from flask import Blueprint, request, Response, make_response
from createbson import index_bson

index_api = Blueprint('index_api', __name__)

from app import index_collection

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