"""
Author: Amol Kapoor
Description: Parser for .py files
"""

import ast
import pywalker


class PyParser(object):
    """Python file parser."""
    FILE_TYPE = '.py'

    def __init__(self, fname):
        self.real_fname = fname
        self.fname = fname.replace('/', '.')
        try:
            self.root = ast.parse(open(fname, 'r').read())
        except SyntaxError:
            print 'File %s has invalid syntax, cannot be indexed' % self.fname
            self.root = None

    def index_code(self):
        walker = pywalker.FileWalker(self.fname)
        walker.visit(self.root)
        data = walker.get_data()
        return {
            'functions': data[0],
            'variables': data[1],
            'imported_modules': data[2],
            'imported_from': data[3],
            'calls': data[4]
        }
