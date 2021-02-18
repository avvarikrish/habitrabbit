from flask import Flask
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os

app = Flask(__name__)
app.config['MONGO_URI'] = 'mongodb://localhost:27017/habitrabbit'
load_dotenv()

hr_db = PyMongo(app)
users_collection = hr_db.db['users']
scores_collection = hr_db.db['scores']
index_collection = hr_db.db['index']
print(users_collection)
print(users_collection.find())
from user_routes import user_api
from score_routes import scores_api
from index_routes import index_api

app.register_blueprint(user_api, url_prefix='/users')
app.register_blueprint(scores_api, url_prefix='/scores')
app.register_blueprint(index_api, url_prefix='/index')
print("App is registered")
if __name__ == '__main__':
    app.run()
