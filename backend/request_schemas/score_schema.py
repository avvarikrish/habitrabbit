from schema import Optional

add_score = {
    'username': str,
    Optional('steps'): int,
    Optional('sleep'): int,
    Optional('date'): {
        'month': int,
        'day': int,
        'year': int
    }
}

get_scores = {
    'username': str,
    Optional('month'): str,
    Optional('day'): str,
    Optional('year'): str
}

update_goals = {
    'username': str,
    'goals': {
        'sleep': {
            'goal': int,
            'weight': float,
            'time': float
        },
        'steps': {
            'goal': int,
            'weight': float
        }
    }
}