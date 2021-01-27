from flask import Blueprint, request, Response
from datetime import datetime
from createbson import score_bson

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
    