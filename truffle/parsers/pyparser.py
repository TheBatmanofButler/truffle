"""
Author: Amol Kapoor
Description: Parser for .py files
"""

import ast
import pywalker


def _process_file(functions, imported_modules, imported_from):
    return {
        'functions': functions,
        'external_imports': imported_modules,
        'direct_imports': imported_from
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
        data = walker.get_data()
        return {
            'functions': data[0],
            'variables': data[1],
            'imported_modules': data[2],
            'imported_from': data[3],
            'calls': data[4]
        }


    def index_file(self):
        (function_index, variable_index, imported_modules, imported_from,
         call_index) = self._index_code()

        file_index = _process_file(function_index.keys(), imported_modules,
                                   imported_from)

        return function_index, call_index, file_index, variable_index
