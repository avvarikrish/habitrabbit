from flask import Flask, request, Response
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import json
import os

app = Flask(__name__)
app.config['MONGO_URI'] = 'mongodb://localhost:27017/habitrabbit'
load_dotenv()

hr_db = PyMongo(app)
users_collection = hr_db.db['users']

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

if __name__ == '__main__':
    app.run()
