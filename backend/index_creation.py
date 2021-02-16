import math
import json
from urllib import request, parse

PRECISION = 4
LAT_LONG_FILE = 'us-zip-code-latitude-and-longitude.json'
URL = 'http://127.0.0.1:5000/index/add-location'

with open(LAT_LONG_FILE, 'r') as data_file:
    data = json.load(data_file)
    precision_value = 10 ** PRECISION
    for location in data:
        trunc_longitude = math.floor(location['fields']['longitude'] * precision_value) / precision_value
        trunc_latitude = math.floor(location['fields']['latitude'] * precision_value) / precision_value
        post_data = {'longitude': trunc_longitude, 'latitude': trunc_latitude}
        jsondata = json.dumps(post_data).encode('utf-8')
        req = request.Request(URL)
        req.add_header('Content-Type', 'application/json; charset=utf-8')
        resp = request.urlopen(req, data=jsondata)
