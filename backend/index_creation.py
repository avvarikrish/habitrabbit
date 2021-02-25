import json
import os
from urllib import request, parse

from pkg import truncate

PRECISION = 4
LAT_LONG_FILE = 'us-zip-code-latitude-and-longitude.json'
URL = os.environ.get('SERVER_URL')
print('URL', URL)

with open(LAT_LONG_FILE, 'r') as data_file:
    data = json.load(data_file)
    precision_value = 10 ** PRECISION
    for location in data:
        trunc_longitude = truncate(location['fields']['longitude'], PRECISION)
        trunc_latitude = truncate(location['fields']['latitude'], PRECISION)
        post_data = {'longitude': trunc_longitude, 'latitude': trunc_latitude}
        jsondata = json.dumps(post_data).encode('utf-8')
        req = request.Request(URL)
        req.add_header('Content-Type', 'application/json; charset=utf-8')
        resp = request.urlopen(req, data=jsondata)
