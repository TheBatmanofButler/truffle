"""
Author: Amol Kapoor
Defines parser object
"""

class Parser(object):
    """
    Used to parse files.
    """

    FILE_TYPE = None

    def __init__(self, fname):
        if not fname.endswith(self.FILE_TYPE):
            raise ValueError('Not a python file.')
        self.fname = fname

    def get_function_calls(self):
        raise NotImplementedError

    def get_function_defs(self):
        raise NotImplementedError

