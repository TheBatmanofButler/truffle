"""
Author: Amol Kapoor
Description: Parser for .py files
"""

import ast
from parser import Parser

def _get_name(node):

    if isinstance(node.func, ast.Attribute):
        name = ''
        node = node.func
        while not isinstance(node, ast.Name):
            if isinstance(node, ast.Call):
                node = node.func
            elif isinstance(node, ast.Attribute):
                name = node.attr + '.' + name if len(name) else node.attr
                node = node.value
            elif isinstance(node, ast.Subscript):
                node = node.value

        name = (node.id + '.' + name) if len(name) else node.id
        return (name, 'False')
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

    def _process_node_calls(self, nodelist):
        """ Returns the names of the node calls """
        funcs = []
        for node in nodelist:
            name, orig_file = _get_name(node)
            funcs.append((name, node.lineno, self.fname, orig_file))
        return funcs

    def get_fname(self):
        """ Returns file name """
        return self.fname

    def get_function_calls(self, func_node):
        """ Gets functions called in a specific node """
        return [node for node in ast.walk(func_node) 
                if isinstance(node, ast.Call)]

    def get_function_defs(self):
        """ Gets function definitions from ast """
        return [node for node in ast.walk(self.root) if
                isinstance(node, ast.FunctionDef)]

    def index_functions(self):
        """ Populates function data structure for the file """
        function_nodes = self.get_function_defs()

        functions = {}
        for node in function_nodes:
            called_function_nodes = self.get_function_calls(node)
            func = {
                'called_functions': self._process_node_calls(
                    called_function_nodes),
                'lineno': node.lineno,
                'name': node.name,
                'fname': self.fname
            }

            functions[self.fname + '.' + node.name + '.' + node.lineno] = func

        return functions


