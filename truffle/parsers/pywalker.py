"""
@Author: AmoL Kapoor
Node walker.
"""
import ast


def _get_node_name(node):
    """Get all attribute and name ids for a node."""
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


def _get_args(node):
    if isinstance(node, ast.FunctionDef):
        return [arg.id for arg in node.args.args]
    elif isinstance(node, ast.ClassDef):
        return [_get_node_name(base) for base in node.bases]


class FileWalker(ast.NodeVisitor):
    """Walk the file, populate the relevant DS."""

    def __init__(self, fname):
        self.fname = fname
        self.context = []
        self.var_name = []
        self.functions = {}
        self.variables = {}
        self.imported_modules = {}
        self.imported_functions = {}
        self.calls = {}

    def get_data(self):
        """Return data."""
        return (self.functions, self.variables, self.imported_modules,
                self.imported_functions, self.calls)

    def _check_imports(self, var_name):
        """Recursively check to make sure all imports are handled."""
        split_var_name = var_name.split('.')
        for asname, info in self.imported_modules.iteritems():
            if asname == split_var_name[0]:
                if asname == info:
                    split_var_name[0] = info
                else:
                    split_var_name[0] = self._check_imports(info)
                return  '.'.join(split_var_name)

        for asname, info in self.imported_functions.iteritems():
            if asname == var_name:
                return self._check_imports(info[1]) + '.' + info[0]

        return var_name

    def _get_var_name(self):
        """Get name from current var name list, checking against imports."""

        # Handle direct imports, which only have a single function in the name.
        if (len(self.var_name) == 2
                and self.var_name[-1] in self.imported_functions):
            import_funcname, import_module = self.imported_functions[
                self.var_name[-1]]
            import_module = self._check_imports(import_module)
            import_module = import_module
            var_name_clone = list(self.var_name)
            var_name_clone[0] = import_module
            var_name_clone[-1] = import_funcname
            return '.'.join(var_name_clone)
        # Check to see if an import name exists in the variable name.
        else:
            var_name_clone = list(self.var_name)
            base_name = self._check_imports(var_name_clone[0])
            if base_name == self.var_name[0]:
                scoped_name = [self.fname] + self.context + self.var_name
                return '.'.join(scoped_name)
            var_name_clone[0] = base_name
            return '.'.join(var_name_clone)


    def _process_import(self, node):
        """Process imports (asname - name) and store."""
        for alias in node.names:
            name = alias.name
            asname = alias.asname
            if not asname:
                asname = name
            if isinstance(node, ast.Import):
                self.imported_modules[asname] = name
            elif isinstance(node, ast.ImportFrom):
                module = node.module
                self.imported_functions[asname] = (name, module)

    def _process_functiondef(self, node):
        """Process functions (fname.name.lineno - calls) and store."""
        function_name = '%s.%s.%s' % (self.fname, '.'.join(self.context),
                                      node.name)
        self.functions[function_name] = {
            'calls': {},
            'lineno': node.lineno,
            'calling_functions': [],
            'name': node.name,
            'fname': self.fname,
            'docstring': ast.get_docstring(node, clean=True),
            'scope': '.'.join(self.context),
            'args': _get_args(node)
        }

    def _process_call(self, node):
        """Process calls (imported call) and store."""
        var_name = '%s.%d' % ('.'.join(self.var_name), node.lineno)
        true_var_name = self._get_var_name()
        self.calls[var_name] = true_var_name
        if self.context:
            last_scope = '%s.%s.%s' % (self.fname, '.'.join(self.context[:-1]),
                                       self.context[-1])
            self.functions[last_scope]['calls'][true_var_name] = node.lineno

    def _process_variable(self, node):
        """Process variables (imported vars) and store."""
        var_name = '.'.join(self.var_name)
        base_name = self._check_imports(self.var_name[0])
        if base_name == self.var_name[0]:
            var_name = '%s.%s.%s' % (self.fname, '.'.join(self.context),
                                     var_name)
        if var_name in self.variables:
            loaded_var_name = '%s.%d' % (var_name, node.lineno)
            self.variables[loaded_var_name] = self.variables[var_name]
        else:
            self.variables[var_name] = '%s.%d' % (self._get_var_name(),
                                                  node.lineno)

    def visit_FunctionDef(self, node):
        self._process_functiondef(node)
        self.context.append(node.name)
        self.generic_visit(node)
        self.context.pop()

    def visit_ClassDef(self, node):
        self.visit_FunctionDef(node)

    def visit_Call(self, node):
        call_name = _get_node_name(node)
        self.var_name.append(call_name)
        self._process_call(node)
        self.generic_visit(node)
        self.var_name.pop()

    def visit_Lambda(self, node):
        # lambdas are just functions, albeit with no statements
        self.context.append('lambda')
        self.generic_visit(node)
        self.context.pop()

    def visit_Attribute(self, node):
        self.var_name.append(node.attr)
        self.generic_visit(node)
        self.var_name.pop()

    def visit_Name(self, node):
        # TODO(ajkapoor): Current iteration doesnt properly handle variables.
        # Specifically, the names are on the wrong side of the attributes.
        # See: ...Test.thisisatest3.x.test_process_variable
        self.var_name.append(node.id)
        self._process_variable(node)
        self.generic_visit(node)
        self.var_name.pop()

    def visit_ImportFrom(self, node):
        self._process_import(node)
        self.generic_visit(node)

    def visit_Import(self, node):
        self.visit_ImportFrom(node)
