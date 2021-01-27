from flask import Flask, request, Response
from app import app, users_collection, hr_db
from createbson import create_user_bson

@app.route('/create-user', methods=['POST'])
def create_user():
    response = Response('success', 200)
    try:
        user_info = request.json
        result = users_collection.update_one(
            {'email': user_info['email']},
            {'$setOnInsert': create_user_bson(user_info)},
            upsert=True
        )
        
        # email already exists
        if result.matched_count > 0:
            response = Response('user already exists: ' + user_info['email'], 409)

    except KeyError:
        response = Response('invalid client request', 400)

    finally:
        return response

@app.route('/login-user', methods=['POST'])
def login_user():
    response = Response('success', 200)
    try:
        auth_info = request.json
        result = users_collection.find_one(
            {'email': auth_info['email']}
        )

        if result == None:
            response = Response('user not found: ' + auth_info['email'], 401)

        if result['password'] != auth_info['password']:
            response = Response('incorrect password: ' + auth_info['password'], 401)

    except KeyError:
        response = Response('invalid client request', 400)

    finally:
        return response

@app.route('/update-user', methods=['POST'])
def update_user():
    response = Response('success', 200)
    try:
        user_info = request.json
        result = users_collection.update_one(
            {'email': user_info['email']},
            {'$set': create_user_bson(user_info)}
        )
        if result.matched_count == 0:
            response = Response('user not found: ' + user_info['email'], 401)
    
    except KeyError:
        response = Response('invalid client request', 400)

    finally:
        return response

