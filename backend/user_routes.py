from flask import Flask, request, Response
from app import app, users_collection, hr_db

@app.route('/create-user', methods=['POST'])
def create_user():
    user_info = request.json
    result = users_collection.update_one(
        {'email': user_info['email']},
        {'$setOnInsert': user_info},
        upsert=True
    )

    # email already exists
    if result.matched_count > 0:
        return Response('email already exists: ' + user_info['email'], 409)

    return Response('success', 200)

@app.route('/login-user', methods=['POST'])
def login_user():
    auth_info = request.json
    result = users_collection.find_one(
        {'email': auth_info['email']}
    )

    if result == None:
        return Response('email not found: ' + auth_info['email'], 401)

    if result['password'] != auth_info['password']:
        return Response('incorrect password: ' + auth_info['password'], 401)

    return Response('success', 200)

@app.route('/update-user', methods=['POST'])
def update_user():
    user_info = request.json
    result = users_collection.update_one(
        {'email': user_info['email']},
        {'$set': user_info}
    )
    if result.matched_count == 0:
        return Response('user not found: ' + user_info['email'], 401)

    return Response('success', 200)