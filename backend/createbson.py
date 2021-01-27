def create_user_bson(user_info):
    return {
        'username': user_info['username'],
        'first_name': user_info['first_name'],
        'last_name': user_info['last_name'],
        'password': user_info['password']
    }