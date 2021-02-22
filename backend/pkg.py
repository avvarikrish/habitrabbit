import math

def truncate(value, precision):
    precision_value = 10 ** precision
    return math.floor(value * precision_value) / precision_value
