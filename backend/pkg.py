# helper functions

import math

# truncate value to specified precision
def truncate(value, precision):
    precision_value = 10 ** precision
    return math.floor(value * precision_value) / precision_value

# get user stride from user height
def height_to_stride(height):
    return 0.414 * height * 0.0254