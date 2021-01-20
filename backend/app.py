from flask import Flask, request, Response
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import json
import os

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/habitrabbit"
load_dotenv()

hr_db = PyMongo(app)
users_collection = hr_db.db["users"]

@app.route('/create-user', methods=['POST'])
def create_user():
    user_info = request.json
    result = users_collection.update_one(
        {"email": user_info["email"]},
        {"$setOnInsert": user_info},
        upsert=True
    )

    # email already exists
    if result.matched_count > 0:
        return Response("email already exists: " + user_info["email"], 409)

    return "success"

if __name__ == '__main__':
    app.run()
