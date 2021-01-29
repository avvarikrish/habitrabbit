from flask import Blueprint, request, Response, jsonify, make_response
from datetime import datetime
from createbson import score_bson
from bson import json_util

scores_api = Blueprint('scores_api', __name__)

from app import scores_collection

@scores_api.route('/add-score', methods=['POST'])
def add_score():
    response = Response('success', 200)
    try:

        score_info = request.json
        date = datetime.now()
        month, day, year = date.month, date.day, date.year
        scores_collection.update_one({'username': score_info['username'], 'month': month, 'day': day, 'year': year},
                                            {'$set': score_bson(score_info, month, day, year)},
                                            upsert=True
                                        )
    
    except KeyError:
        response = Response('invalid client request', 400)

    finally:
        return response

@scores_api.route('/get-scores', methods=['GET'])
def get_scores():
    response = {}
    try:
        scores_filter = {}
        args = request.args.to_dict()
        scores_filter['username'] = args['username']
        if 'month' in args:
            scores_filter['month'] = int(args.get('month'))
        if 'day' in args:
            scores_filter['day'] = int(args.get('day'))
        if 'year' in args:
            scores_filter['year'] = int(args.get('year'))
        
        response = make_response(json_util.dumps(scores_collection.find(scores_filter)), 200)

    except KeyError:
        response = make_response(Response('invalid client request'), 400)

    finally:
        return response