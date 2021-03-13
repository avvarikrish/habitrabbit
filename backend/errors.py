# custom error definitions

class UserDoesNotExistError(Exception):
    pass

class UserAlreadyExistsError(Exception):
    pass

class IncorrectUsernamePasswordError(Exception):
    pass