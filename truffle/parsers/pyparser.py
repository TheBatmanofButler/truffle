"""
Author: Amol Kapoor
Description: Parser for .py files
"""

import ast
from parser import Parser

def _get_name(node):

    if isinstance(node.func, ast.Attribute):
        return (node.func.attr, 'False')
    else:
        return (node.func.id, 'True')


class PyParser(Parser):
    """
    Python file parser.
    """
    FILE_TYPE = '.py'

    def __init__(self, fname):
        super(PyParser, self).__init__(fname)
        self.fname = fname
        self.root = ast.parse(open(fname, 'r').read())

    def get_fname(self):
        """ Returns file name """
        return self.fname

    def get_function_calls(self):
        """ Gets functions from ast """
        funcs = []
        nodes = [node for node in ast.walk(self.root) if isinstance(node,
                                                                    ast.Call)]
        for node in nodes:
            name, orig_file = _get_name(node)
            funcs.append((name, node.lineno, self.fname, orig_file))
        return funcs

    def get_function_defs(self):
        """ Gets function definitions from ast """
        funcs = []
        nodes = [node for node in ast.walk(self.root) if
                 isinstance(node, ast.FunctionDef)]
        for node in nodes:
            funcs.append((node.name, node.lineno, self.fname))
        return funcs

