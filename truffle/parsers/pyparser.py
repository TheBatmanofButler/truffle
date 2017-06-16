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
            else:
                break

        if isinstance(node, ast.Name):
            name = (node.id + '.' + name) if len(name) else node.id
        return (name, 'False')
    else:
        return (node.func.id, 'True')

def _process_imports(imports):
    imported_files = {}
    imported_functions = {}
    for import_file in imports:
        import_fname = import_file.names[0].name
        import_asname = import_file.names[0].asname
        if not import_asname:
            import_asname = import_fname
        if isinstance(import_file, ast.Import):
            imported_files[import_asname] = import_fname
        elif isinstance(import_file, ast.ImportFrom):
            import_module = import_file.module
            imported_functions[import_asname] = (import_fname,
                                                 import_module)

    return imported_files, imported_functions

def _get_function_calls(func_node):
    """ Gets functions called in a specific node """
    return [node for node in ast.walk(func_node)
            if isinstance(node, ast.Call)]


class PyParser(Parser):
    """
    Python file parser.
    """
    FILE_TYPE = '.py'

    def __init__(self, fname):
        super(PyParser, self).__init__(fname)
        self.fname = fname
        self.root = ast.parse(open(fname, 'r').read())

    def _process_node_calls(self, nodelist, imports):
        """ Returns the names of the node calls """
        # TODO: find a way to ignore python default calls
        funcs = []
        imported_files, imported_functions = _process_imports(imports)

        for node in nodelist:
            name, orig_file = _get_name(node)

            if name in imported_functions:
                import_funcname, import_module = imported_functions[name]
                import_module = '/'.join(import_module.split('.'))
                name = '%s.%s' % (import_module, import_funcname)
            elif '.' in name:
                split_name = name.split('.')
                if split_name[0] in imported_files:
                    new_mod_name = imported_files[split_name[0]]
                    # TODO: find a way to check for file existence in the dir
                    split_name[0] = './' + '/'.join(new_mod_name.split('.')) + '.py'
                name = '/'.join(split_name[:-1]) + '.' + split_name[-1]
            else:
                name = self.fname + '.' + name

            funcs.append((name, node.lineno, self.fname, orig_file))

        return funcs

    def get_fname(self):
        """ Returns file name """
        return self.fname

    def get_function_defs(self):
        """ Gets function definitions from ast """
        return [node for node in ast.walk(self.root) if
                isinstance(node, ast.FunctionDef)]

    def get_imports(self):
        """ Gets a list of all of the imports in a file. """
        return [node for node in ast.walk(self.root)
                if isinstance(node, ast.Import) or isinstance(node,
                                                              ast.ImportFrom)]

    def index_functions(self):
        """ Populates function data structure for the file """

        imports = self.get_imports()

        function_nodes = self.get_function_defs()

        functions = {}
        for node in function_nodes:
            called_function_nodes = _get_function_calls(node)

            called_functions = self._process_node_calls(called_function_nodes,
                                                        imports)

            func = {
                'called_functions': called_functions,
                'lineno': node.lineno,
                'calling_functions': [],
                'name': node.name,
                'fname': self.fname
            }

            functions['%s.%s' % (self.fname, node.name)] = func

        return functions
