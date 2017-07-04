"""
Author: Amol Kapoor
Description: Parser for .py files
"""

import ast
import pywalker


def _process_file(functions, imported_modules, imported_functions):
    return {
        'functions': functions,
        'external_imports': imported_modules,
        'direct_imports': imported_functions
    }


class PyParser(object):
    """Python file parser."""
    FILE_TYPE = '.py'

    def __init__(self, fname):
        super(PyParser, self).__init__(fname)
        self.real_fname = fname
        self.fname = fname.replace('/', '.')
        try:
            self.root = ast.parse(open(fname, 'r').read())
        except SyntaxError:
            print 'File %s has invalid syntax, cannot be indexed' % self.fname
            self.root = None

    def _index_code(self):
        walker = pywalker.FileWalker(self.fname)
        walker.visit(self.root)
        return walker.get_data()

    def index_file(self):
        (function_index, variable_index, imported_modules, imported_functions,
         call_index) = self._index_code()

        file_index = _process_file(function_index.keys(), imported_modules,
                                   imported_functions)

        return function_index, call_index, file_index, variable_index
