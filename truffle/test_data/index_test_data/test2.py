import test1
from test1 import MathStuff

mathstuff = MathStuff('2x + 3y = 10')

print mathstuff.get_vars()

mathstuff.plug_in_vars('x', 3)

mathstuff.plug_in_vars('y', 3)

first_term = test1.mult(2, 3)

second_term = test1.mult(3, 3)

total = test.add(first_term, second_term)
