class Subscore:
    def __init__(self, goal, weight, value):
        self._goal = goal
        self._weight = weight
        self._value = value

    def goal(self):
        return self._goal

    def weight(self):
        return self._weight

    def value(self):
        return self._value

    def score(self):
        return 100 if self._value > self._goal else (self._value / self._goal) * 100

    def bson(self):
        return {
            'score': self.score(),
            'weight': self._weight,
            'value': self._value,
            'goal': self._goal
        }