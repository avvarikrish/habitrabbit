from flask import Flask
from flask_pymongo import PyMongo
from dotenv import load_dotenv
from user_routes import user_api
import os

app = Flask(__name__)
app.register_blueprint(user_api, url_prefix='/users')

app.config['MONGO_URI'] = 'mongodb://localhost:27017/habitrabbit'
load_dotenv()

hr_db = PyMongo(app)
users_collection = hr_db.db['users']

if __name__ == '__main__':
    app.run()
