from flask import Flask
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/habitrabbit"
load_dotenv()

hrDB = PyMongo(app)

@app.route('/')
def hello():
    users = hrDB.db["users"].find()
    for user in users:
        print(user, "Hello")

    return "Hello World!"

if __name__ == '__main__':
    app.run()
