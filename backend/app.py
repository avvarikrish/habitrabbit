from flask import Flask
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import json
import os

app = Flask(__name__)
from user_routes import *

app.config['MONGO_URI'] = 'mongodb://localhost:27017/habitrabbit'
load_dotenv()

hr_db = PyMongo(app)
users_collection = hr_db.db['users']

if __name__ == '__main__':
    app.run()
