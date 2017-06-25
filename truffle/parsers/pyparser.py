"""
Author: Amol Kapoor
Description: Parser for .py files
"""

import ast
from parser import Parser
from walker import VariableNodeWalker

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

def _get_function_name(node):

    if isinstance(node.func, ast.Attribute):
        node = node.func
        name = _get_name(node)
        return name
    else:
        return node.func.id

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

            if name in imported_functions:
                import_funcname, import_module = imported_functions[name]
                import_module = '/'.join(import_module.split('.'))
                name = '%s.%s' % (import_module, import_funcname)
            elif '.' in name:
                split_name = name.split('.')
                if split_name[0] in imported_files:
                    new_mod_name = imported_files[split_name[0]]
                    split_name[0] = './' + '/'.join(new_mod_name.split('.')) + '.py'
                name = '/'.join(split_name[:-1]) + '.' + split_name[-1]
            else:
                name = self.fname + '.' + name

            if name not in functions:
                continue

            funcs.append((name, node.lineno))

        return funcs

    def _process_func_defs(self, func_nodes):
        """ Returns processed function names """
        return [(func.name, func.lineno) for func in func_nodes]

    def get_function_defs(self):
        """ Gets function definitions from ast """
        return [node for node in ast.walk(self.root) if
                isinstance(node, ast.FunctionDef) or isinstance(node,
                                                                ast.ClassDef)]

    def get_imports(self):
        """ Gets a list of all of the imports in a file. """
        return [node for node in ast.walk(self.root)
                if isinstance(node, ast.Import) or isinstance(node,
                                                              ast.ImportFrom)]

    def index_variables(self):
        """ Populates variable data structure for the file """
        walker = VariableNodeWalker(self.fname)
        walker.visit(self.root)
        return walker.get_variables()

    def index_files(self):
        """ Populates file data structure for the file"""
        funcs_in_file = self.get_function_defs()
        functions_in_file = self._process_func_defs(funcs_in_file)
        return {self.fname : functions_in_file}

    def index_functions(self):
        """ Populates function data structure for the file """

        imports = self.get_imports()

        function_nodes = self.get_function_defs()

        functions = {}

        for node in function_nodes:
            functions['%s.%s.%d' % (self.fname, node.name, node.lineno)] = {}

        for node in function_nodes:
            called_function_nodes = _get_function_calls(node)

            called_functions = self._process_node_calls(called_function_nodes,
                                                        imports, functions)

            func = {
                'called_functions': called_functions,
                'lineno': node.lineno,
                # 'calling_functions': [],
                'name': node.name,
                'fname': self.fname,
                'docstring': ast.get_docstring(node, clean=True)
            }

            functions['%s.%s.%d' % (self.fname, node.name, node.lineno)] = func

        return functions
