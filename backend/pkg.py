import math

def truncate(value, precision):
    precision_value = 10 ** precision
    return math.floor(value * precision_value) / precision_value

def height_to_stride(height):
    return 0.414 * height * 0.0254