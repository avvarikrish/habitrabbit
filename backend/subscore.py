# Subscore class to organize sleep and steps goals

class Subscore:
    def __init__(self, goal, weight, value):
        self._goal = goal
        self._weight = weight
        self._value = value

    # goals value
    def goal(self):
        return self._goal

    # weight of how much the goal is worth
    def weight(self):
        return self._weight

    # actual value
    def value(self):
        return self._value

    # calculate the score
    def score(self):
        return 100 if self._value > self._goal else (self._value / self._goal) * 100

    # get json value of subscore
    def bson(self):
        return {
            'score': self.score(),
            'weight': self._weight,
            'value': self._value,
            'goal': self._goal
        }