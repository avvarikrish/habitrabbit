from flask import Blueprint, request, Response, make_response
from schema import Schema, SchemaError

from createbson import user_bson
from request_schemas import user_schema
from errors import UserAlreadyExistsError, UserDoesNotExistError, IncorrectUsernamePasswordError

user_api = Blueprint('user_api', __name__)

from app import users_collection

# create a new user in database
@user_api.route('/create-user', methods=['POST'])
def create_user():
    response = make_response(Response('success', 200))
    try:
        # request args
        user_info = request.json
        Schema(user_schema.user).validate(user_info)

        # add user to database
        result = users_collection.update_one(
            {'username': user_info['username']},
            {'$setOnInsert': user_bson(user_info, 'create')},
            upsert=True
        )

        # username already exists
        if result.matched_count > 0:
            raise UserAlreadyExistsError
                
    except SchemaError:
        response = make_response(Response('invalid client request', 400))

    except UserAlreadyExistsError:
        response = make_response(Response('user already exists: ' + user_info['username'], 409))

    except Exception as e:
        response = make_response(Response(e), 500)

    finally:
        return response

# login user
@user_api.route('/login-user', methods=['POST'])
def login_user():
    response = make_response(Response('success', 200))
    try:
        # request args
        auth_info = request.json
        Schema(user_schema.login_user).validate(auth_info)

        # find user with unique username
        result = users_collection.find_one(
            {'username': auth_info['username']}
        )

        # if user does not exist
        if result == None:
            raise UserDoesNotExistError
        # check password if exists
        else:
            if result['password'] != auth_info['password']:
                raise IncorrectUsernamePasswordError

    except SchemaError:
        response = make_response(Response('invalid client request', 400))

    except UserDoesNotExistError:
        response = make_response(Response('user not found: ' + auth_info['username'], 401))

    except IncorrectUsernamePasswordError:
        response = make_response(Response('incorrect password: ' + auth_info['password'], 401))

    except Exception as e:
        response = make_response(Response(e), 500)

    finally:
        return response

# update user info
@user_api.route('/update-user', methods=['POST'])
def update_user():
    response = make_response(Response('success', 200))
    try:
        # request args with updated user info
        user_info = request.json
        Schema(user_schema.user).validate(user_info)

        # update user in database
        result = users_collection.update_one(
            {'username': user_info['username']},
            {'$set': user_bson(user_info, 'update')}
        )

        # user does not exist
        if result.matched_count == 0:
            raise UserDoesNotExistError
    
    except SchemaError:
        response = make_response(Response('invalid client request', 400))

    except UserDoesNotExistError:
        response = make_response(Response('user not found: ' + user_info['username'], 401))

    except Exception as e:
        response = make_response(Response(e), 500)

    finally:
        return response
