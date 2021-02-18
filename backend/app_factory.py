from gevent import monkey
monkey.patch_all()
from app import app
print("app is registered 2")
@app.route('/')
def index():
    return '''simple_test'''
def create_app():
    return app