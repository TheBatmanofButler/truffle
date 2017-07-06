import numpy as np
from np.random import uniform
import test_process_variable

def thisisatest(arg1):
    """test"""
    print arg1

def thisisatest2(arg1):
    thisisatest(5)

class Test(object):

    def thisisatest3():
        print 'hello'
        print test_process_variable.x
        print uniform
        print np.random.uniform
