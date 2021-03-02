class Recommendation:
    def __init__(self):
        self._latitude = 0
        self._longitude = 0
        self._frequency = 0
        self._steps = 0
        self._address = ''
        self._time = 0
        self._time_str = ''
        self._valid_weather_times = []

    def get_latitude(self):
        return self._latitude

    def set_latitude(self, latitude):
        self._latitude = latitude

    def get_longitude(self):
        return self._longitude

    def set_longitude(self, longitude):
        self._longitude = longitude

    def get_frequency(self):
        return self._frequency

    def set_frequency(self, frequency):
        self._frequency = frequency

    def get_steps(self):
        return self._steps

    def set_steps(self, steps):
        self._steps = steps

    def get_address(self):
        return self._address

    def set_address(self, address):
        self._address = address

    def get_time(self):
        return self._time

    def set_time(self, time):
        self._time = time

    def get_time_str(self):
        return self._time_str

    def set_time_str(self, time_str):
        self._time_str = time_str

    def add_weather_time(self, weather_time):
        self._valid_weather_times.append(weather_time)

    def to_json(self):
        return {
            'latitude': self._latitude,
            'longitude': self._longitude,
            'frequency': self._frequency,
            'steps': self._steps,
            'address': self._address,
            'time': self._time,
            'time_str': self._time_str,
            'valid_weather_times': self._valid_weather_times
        }