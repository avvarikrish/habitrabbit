# routes for scores and goals

from flask import Blueprint, request, Response, make_response
from datetime import datetime
from bson import json_util
from schema import Schema, SchemaError

from createbson import score_bson, goals_bson
from subscore import Subscore
from request_schemas import score_schema
from errors import UserDoesNotExistError

scores_api = Blueprint('scores_api', __name__)

from app import scores_collection, users_collection

# add score for user
@scores_api.route('/add-score', methods=['POST'])
def add_score():
    response = {}
    try:
        # request args
        score_info = request.json
        Schema(score_schema.add_score).validate(score_info)

        username = score_info['username']
        date = datetime.now()
        month, day, year = date.month, date.day, date.year
        if 'date' in score_info:
            date = score_info['date']
            month, day, year = date['month'], date['day'], date['year']

        # get user
        user = users_collection.find_one({'username': username})
        if user is None:
            raise UserDoesNotExistError

        # get updated scores from request
        sleep_value, steps_value = 0, 0
        if 'sleep' in score_info:
            sleep_value = score_info['sleep']
        if 'steps' in score_info:
            steps_value = score_info['steps']

        # find current day scores
        user_score = scores_collection.find_one({'username': username, 'month': month, 'day': day, 'year': year})
        # if score already exists
        if user_score is not None:
            if 'sleep' not in score_info:
                sleep_value = user_score['subscores']['sleep']['value']
            
            if 'steps' not in score_info:
                steps_value = user_score['subscores']['steps']['value']
        
        # create Subscore objects
        sleep_score = Subscore(user['goals']['sleep']['goal'], user['goals']['sleep']['weight'], sleep_value)
        steps_score = Subscore(user['goals']['steps']['goal'], user['goals']['steps']['weight'], steps_value)

        # update or add score to database
        new_score_bson = score_bson(username, month, day, year, sleep_score, steps_score)
        scores_collection.update_one({'username': username, 'month': month, 'day': day, 'year': year},
                                    {'$set': new_score_bson},
                                    upsert=True)

        response = make_response(json_util.dumps(new_score_bson), 200)
    
    except SchemaError:
        response = make_response(Response('invalid client request'), 400)

    except UserDoesNotExistError:
        response = make_response(Response('user not found: ' + username), 401)

    except Exception as e:
        response = make_response(Response(e), 500)

    finally:
        return response

# get score for user based on date
@scores_api.route('/get-scores', methods=['GET'])
def get_scores():
    response = []
    try:
        # request args
        args = request.args.to_dict()
        Schema(score_schema.get_scores).validate(args)
        
        scores_filter = {}
        scores_filter['username'] = args['username']
        filter_exists = False
        if 'month' in args:
            filter_exists = True
            scores_filter['month'] = int(args.get('month'))
        if 'day' in args:
            filter_exists = True
            scores_filter['day'] = int(args.get('day'))
        if 'year' in args:
            filter_exists = True
            scores_filter['year'] = int(args.get('year'))
        
        # if date passed in request, find the score with dates passed
        if filter_exists:
            response = make_response(json_util.dumps(scores_collection.find(scores_filter)), 200)
        # else, get current day's scores
        else:
            date = datetime.now()
            response = make_response(json_util.dumps(scores_collection.find({'month': date.month, 'day': date.day, 'year': date.year})), 200)

    except SchemaError:
        response = make_response(Response('invalid client request'), 400)

    except Exception as e:
        response = make_response(Response(e), 500)

    finally:
        return response

# update step and sleep goals
@scores_api.route('/update-goals', methods=['POST'])
def update_goals():
    response = Response('success', 200)
    try:
        # request args
        goals_info = request.json
        Schema(score_schema.update_goals).validate(goals_info)

        date = datetime.now()
        month, day, year = date.month, date.day, date.year
        new_goals = goals_bson(goals_info['goals'])

        # update user collection with new goals
        users_collection.update_one({'username': goals_info['username']},
                                    {'$set': {'goals': new_goals}})

        # update goals and scores in scores collection
        scores_collection.update_one({'username': goals_info['username'], 'month': month, 'day': day, 'year': year},
                                    {'$set': {'subscores.sleep.goal': new_goals['sleep']['goal'],
                                            'subscores.sleep.weight': new_goals['sleep']['weight'],
                                            'subscores.sleep.time': new_goals['sleep']['time'],
                                            'subscores.steps.goal': new_goals['steps']['goal'],
                                            'subscores.steps.weight': new_goals['steps']['weight'],
                                            }
                                    })
                                    
    except SchemaError:
        response = make_response(Response('invalid client request'), 400)

    except Exception as e:
        response = make_response(Response(e), 500)

    finally:
        return response
