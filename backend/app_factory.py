from app import app
from flask import Flask
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os
from user_routes import user_api
from score_routes import scores_api
from index_routes import index_api

def create_app():
    app.config['MONGO_URI'] = 'mongodb://localhost:27017/habitrabbit'
    app.register_blueprint(user_api, url_prefix='/users')
    app.register_blueprint(scores_api, url_prefix='/scores')
    app.register_blueprint(index_api, url_prefix='/index')
    return app