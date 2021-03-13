# prefill index with latitudes and longitudes of all US cities

import json
import os
from urllib import request, parse

from pkg import truncate

# truncate all latitudes and longitudes to 4 decimal places
PRECISION = 4
# json file with all locations
LAT_LONG_FILE = 'us-zip-code-latitude-and-longitude.json'
# Flask server url
URL = os.environ.get('SERVER_URL')

with open(LAT_LONG_FILE, 'r') as data_file:
    # load json file
    data = json.load(data_file)

    # go through all locations in data file
    for location in data:
        # truncate latitude and longitudes
        trunc_longitude = truncate(location['fields']['longitude'], PRECISION)
        trunc_latitude = truncate(location['fields']['latitude'], PRECISION)
        post_data = {'longitude': trunc_longitude, 'latitude': trunc_latitude}

        # make API request to add location to index
        jsondata = json.dumps(post_data).encode('utf-8')
        req = request.Request(URL)
        req.add_header('Content-Type', 'application/json; charset=utf-8')
        resp = request.urlopen(req, data=jsondata)
