from flask import Blueprint, request, Response, make_response

from createbson import user_bson

user_api = Blueprint('user_api', __name__)

from app import users_collection

@user_api.route('/create-user', methods=['POST'])
def create_user():
    response = make_response(Response('success', 200))
    try:
        user_info = request.json
        result = users_collection.update_one(
            {'username': user_info['username']},
            {'$setOnInsert': user_bson(user_info, 'create')},
            upsert=True
        )

        # username already exists
        if result.matched_count > 0:
            response = make_response(Response('user already exists: ' + user_info['username'], 409))

    except KeyError:
        response = make_response(Response('invalid client request', 400))

    except Exception as e:
        response = make_response(Response(e), 500)

    finally:
        return response

@user_api.route('/login-user', methods=['POST'])
def login_user():
    response = make_response(Response('success', 200))
    try:
        auth_info = request.json
        result = users_collection.find_one(
            {'username': auth_info['username']}
        )
        print(result)

        if result == None:
            response = make_response(Response('user not found: ' + auth_info['username'], 401))
        else:
            if result['password'] != auth_info['password']:
                response = make_response(Response('incorrect password: ' + auth_info['password'], 401))

    except KeyError:
        response = make_response(Response('invalid client request', 400))

    except Exception as e:
        response = make_response(Response(e), 500)

    finally:
        return response

@user_api.route('/update-user', methods=['POST'])
def update_user():
    response = make_response(Response('success', 200))
    try:
        user_info = request.json
        result = users_collection.update_one(
            {'username': user_info['username']},
            {'$set': user_bson(user_info, 'update')}
        )

        # user does not exist
        if result.matched_count == 0:
            response = make_response(Response('user not found: ' + user_info['username'], 401))
    
    except KeyError:
        response = make_response(Response('invalid client request', 400))

    except Exception as e:
        response = make_response(Response(e), 500)

    finally:
        return response

