def create_user_bson(user_info):
    return {
        'email': user_info['email'],
        'first_name': user_info['first_name'],
        'last_name': user_info['last_name'],
        'password': user_info['password'],
        'goals': {
            'sleep': user_info['goals']['sleep'],
            'walking': user_info['goals']['walking']
        }
    }