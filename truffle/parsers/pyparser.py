"""
Author: Amol Kapoor
Description: Parser for .py files
"""

import ast
from baseparser import Parser
import pywalkers

def _get_class_args(node):
    return [_get_name(node) for node in node.bases]


def _get_function_calls(func_node):
    """ Gets functions called in a specific node """
    return [node for node in ast.walk(func_node) if isinstance(node,
                                                               ast.Call)]


def _get_function_name(node):
    if isinstance(node.func, ast.Attribute):
        node = node.func
        name = _get_name(node)
        return name
    else:
        return node.func.id


def _get_function_args(node):
    return [arg.id for arg in node.args.args]


def _get_name(node):
    name = ''
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
    return name


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


def _process_func_defs(func_nodes):
    """ Returns processed function names """
    return [(func.name, func.lineno) for func in func_nodes]


class PyParser(Parser):
    """
    Python file parser.
    """
    FILE_TYPE = '.py'

    def __init__(self, fname):
        super(PyParser, self).__init__(fname)
        self.fname = fname
        try:
            self.root = ast.parse(open(fname, 'r').read())
        except SyntaxError:
            print 'File %s has invalid syntax, cannot be indexed' % self.fname
            self.root = None

    def _process_node_calls(self, nodelist, imports, functions):
        """ Returns the names of the node calls """
        funcs = []
        imported_files, imported_functions = _process_imports(imports)

        for node in nodelist:
            name = _get_function_name(node)

            # If theres a direct import, store the file location and the
            # function name accordingly.
            if name in imported_functions:
                import_funcname, import_module = imported_functions[name]
                import_module = '/'.join(import_module.split('.'))
                name = '%s.%s' % (import_module, import_funcname)
            # If the function is being called externally, check if it is from an
            # imported file and change the source file name accordingly.
            elif '.' in name:
                split_name = name.split('.')
                if split_name[0] in imported_files:
                    new_mod_name = imported_files[split_name[0]]
                    split_name[0] = './' + '/'.join(new_mod_name.split('.')) + '.py'
                name = '/'.join(split_name[:-1]) + '.' + split_name[-1]
            # Otherwise just store function the call.
            else:
                name = self.fname + '.' + name

            # And finally skip over anything thats not user defined.
            if name not in functions:
                continue

            funcs.append((name, node.lineno))

        return funcs

    def _get_function_defs(self):
        """ Gets function definitions from ast """
        walker = pywalkers.FunctionNodeWalker(self.fname)
        walker.visit(self.root)
        return walker.get_data()

    def _get_function_nodes(self):
        return [node for node in ast.walk(self.root) if
                isinstance(node, ast.FunctionDef) or isinstance(node,
                                                                ast.ClassDef)]

    def _get_imports(self):
        """ Gets a list of all of the imports in a file. """
        return [node for node in ast.walk(self.root)
                if isinstance(node, ast.Import) or isinstance(node,
                                                              ast.ImportFrom)]

    def index_files(self):
        """ Populates file data structure for the file"""
        funcs_in_file = self._get_function_nodes()
        functions_in_file = _process_func_defs(funcs_in_file)
        return {self.fname : functions_in_file}

    def index_functions(self):
        """ Populates function data structure for the file """

        imports = self._get_imports()

        functions = self._get_function_defs()

        for func_name, node_obj in functions.iteritems():
            node = node_obj['node']
            called_function_nodes = _get_function_calls(node)

            called_functions = self._process_node_calls(called_function_nodes,
                                                        imports, functions)

            func = {
                'called_functions': called_functions,
                'lineno': node.lineno,
                # 'calling_functions': [],
                'name': node.name,
                'fname': self.fname,
                'docstring': ast.get_docstring(node, clean=True),
            }

            if isinstance(node, ast.FunctionDef):
                func['args'] = _get_function_args(node)
            elif isinstance(node, ast.ClassDef):
                func['args'] = _get_class_args(node)

            functions[func_name] = func

        return functions

    def index_variables(self):
        """ Populates variable data structure for the file """
        walker = pywalkers.VariableNodeWalker(self.fname)
        walker.visit(self.root)
        return walker.get_data()
