def user_bson(user_info):
    return {
        'username': user_info['username'],
        'first_name': user_info['first_name'],
        'last_name': user_info['last_name'],
        'password': user_info['password']
    }

def score_bson(score_info, month, day, year):
    sleep_score = score_info['sleep']['current_value'] * score_info['sleep']['weight'] / score_info['sleep']['goal']
    steps_score = score_info['steps']['current_value'] * score_info['steps']['weight'] / score_info['steps']['goal']
    return {
        'username': score_info['username'],
        'cumulative_score': sleep_score + steps_score,
        'month': month,
        'day': day,
        'year': year,
        'subscores': {
            'sleep': {
                'score': sleep_score,
                'weight': score_info['sleep']['weight'],
                'current_value': score_info['sleep']['current_value'],
                'goal': score_info['sleep']['goal']
            },
            'steps': {
                'score': steps_score,
                'weight': score_info['steps']['weight'],
                'current_value': score_info['steps']['current_value'],
                'goal': score_info['steps']['goal']
            }
        }
    }