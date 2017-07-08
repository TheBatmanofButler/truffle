"""This is a test file."""

def add(x, y):
    """This is an add function for testing."""
    return x + y

def mult(x, y):
    """This is a multiplication function for testing."""
    return x*y

class MathStuff(object):
    """Holds math stuff."""

    def __init__(self, algebra):
        """Inits math stuff."""
        self.vars = algebra.split()

    def get_vars(self):
        return self.vars

    def plug_in_vars(self, variable, number):
        for i, ch in enumerate(self.vars):
            if variable == ch:
                self.vars[i] = number
