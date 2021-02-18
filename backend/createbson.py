def user_bson(user_info, call_type):
    bson_value = {
        'username': user_info['username'],
        'first_name': user_info['first_name'],
        'last_name': user_info['last_name'],
        'password': user_info['password']
    }
    if call_type == 'create':
        bson_value['goals'] = {
            'sleep': user_goal_bson(8, 0.5),
            'steps': user_goal_bson(10000, 0.5)
        }

    return bson_value

def score_bson(username, month, day, year, sleep_score, steps_score):
    return {
        'username': username,
        'cumulative_score': (sleep_score.score() * sleep_score.weight()) + (steps_score.score() * steps_score.weight()),
        'month': month,
        'day': day,
        'year': year,
        'subscores': {
            'sleep': sleep_score.bson(),
            'steps': steps_score.bson()
        }
    }

def goals_bson(goals_info):
    return {
        'sleep' : user_goal_bson(goals_info['sleep']['goal'], goals_info['sleep']['weight']),
        'steps' : user_goal_bson(goals_info['steps']['goal'], goals_info['steps']['weight'])
    }

def user_goal_bson(value, weight):
    return {
        'goal': value,
        'weight': weight
    }

def index_bson(longitude, latitude):
    return {
        'geometry' : {
            'type': 'Point',
            'coordinates' : [longitude, latitude],
        },
        'longitude': longitude,
        'latitude': latitude,
    }