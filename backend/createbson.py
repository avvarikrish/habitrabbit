# create bsons to store in MongoDB

# create user bson
def user_bson(user_info, call_type):
    bson_value = {
        'username': user_info['username'],
        'first_name': user_info['first_name'],
        'last_name': user_info['last_name'],
        'password': user_info['password']
    }
    # add user with default goals
    if call_type == 'create':
        bson_value['goals'] = {
            'sleep': user_goal_bson(8, 0.5, 8),
            'steps': user_goal_bson(10000, 0.5, None)
        }

    return bson_value

# score bson to store the scores in database
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

# goal bson to store goals
def goals_bson(goals_info):
    return {
        'sleep' : user_goal_bson(goals_info['sleep']['goal'], goals_info['sleep']['weight'], goals_info['sleep']['time']),
        'steps' : user_goal_bson(goals_info['steps']['goal'], goals_info['steps']['weight'], None)
    }

def user_goal_bson(value, weight, time):
    return {
        'goal': value,
        'weight': weight,
        'time': time
    }

# index schema used in database
def index_bson(longitude, latitude):
    return {
        'geometry' : {
            'type': 'Point',
            'coordinates' : [longitude, latitude],
        },
        'longitude': longitude,
        'latitude': latitude,
    }