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
            raise ValueError('Not a python file', fname)
        self.fname = fname

    def index_functions(self):
        raise NotImplementedError

    def index_files(self):
        raise NotImplementedError

    def index_variables(self):
        raise NotImplementedError
