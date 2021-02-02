from flask import Blueprint, request, Response
from createbson import user_bson

user_api = Blueprint('user_api', __name__)

from app import users_collection

@user_api.route('/create-user', methods=['POST'])
def create_user():
    response = Response('success', 200)
    try:
        user_info = request.json
        result = users_collection.update_one(
            {'username': user_info['username']},
            {'$setOnInsert': user_bson(user_info, 'create')},
            upsert=True
        )
        
        # username already exists
        if result.matched_count > 0:
            response = Response('user already exists: ' + user_info['username'], 409)

    except KeyError:
        response = Response('invalid client request', 400)

    finally:
        return response

@user_api.route('/login-user', methods=['POST'])
def login_user():
    response = Response('success', 200)
    try:
        auth_info = request.json
        result = users_collection.find_one(
            {'username': auth_info['username']}
        )

        if result == None:
            response = Response('user not found: ' + auth_info['username'], 401)

        if result['password'] != auth_info['password']:
            response = Response('incorrect password: ' + auth_info['password'], 401)

    except KeyError:
        response = Response('invalid client request', 400)

    finally:
        return response

@user_api.route('/update-user', methods=['POST'])
def update_user():
    response = Response('success', 200)
    try:
        user_info = request.json
        result = users_collection.update_one(
            {'username': user_info['username']},
            {'$set': user_bson(user_info, 'update')}
        )
        if result.matched_count == 0:
            response = Response('user not found: ' + user_info['username'], 401)
    
    except KeyError:
        response = Response('invalid client request', 400)

    finally:
        return response

