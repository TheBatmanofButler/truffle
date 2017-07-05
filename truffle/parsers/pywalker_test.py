"""Tests for pywalkers.py."""

import ast
import unittest
import pywalker


def _setup(fname):
    return ast.parse(open(fname, 'r').read())

class testPywalker(unittest.TestCase):
    def test_get_node_name(self):
        root = _setup('test_data/test_get_node_name.py')
        names = [(pywalker._get_node_name(node), node.__class__.__name__) for
                 node in ast.walk(root) if isinstance(node, ast.Call)]
        self.assertEqual(names[0], ('np.random.uniform', 'Call'))
        self.assertEqual(names[1], ('thisisatest', 'Call'))

    def test_get_args(self):
        root = _setup('test_data/test_get_args.py')
        args = [pywalker._get_args(node) for node in ast.walk(root)
                if isinstance(node, ast.FunctionDef)
                or isinstance(node, ast.ClassDef)]

        self.assertSequenceEqual(args, [['object'], ['object'],
                                        ['First', 'Second', 'datetime.date'],
                                        ['arg1', 'arg2', 'arg3'],
                                        ['arg1', 'arg2', 'arg3']])

    def test_pywalker_get_data(self):
        walker = pywalker.FileWalker('dummy_file')
        walker.functions = 'test1'
        walker.variables = 'test2'
        walker.imported_modules = 'test3'
        walker.imported_functions = 'test4'
        walker.calls = 'test5'
        data = walker.get_data()
        self.assertSequenceEqual(data, ('test1', 'test2', 'test3', 'test4',
                                        'test5'))

    def test_check_import(self):
        walker = pywalker.FileWalker('dummy_file')
        walker.imported_functions = {'testC': ('testc', 'fileB'),
                                     'fileB': ('fileb.addon', 'fileA'),
                                     'fileA': ('filea', 'last_file')}
        walker.imported_modules = {'last_file': 'actual.last.file'}
        var_name = 'testC'
        self.assertEqual(walker._check_imports(var_name),
                         'actual.last.file.filea.fileb.addon.testc')

    def test_get_var_name(self):
        walker = pywalker.FileWalker('dummy_file')
        self.assertSequenceEqual(walker.var_name, ['dummy_file'])
        walker.var_name = ['dummy_file', 'test']
        self.assertEqual(walker._get_var_name(), 'dummy_file.test')
        walker.imported_functions = {'test': ('other_test', 'other.module')}
        self.assertEqual(walker._get_var_name(),
                         'other.module.other_test')
        walker.imported_modules = {'plt': 'matplotlib.pyplot'}
        walker.var_name = ['plt', 'this', 'is', 'a', 'test']
        self.assertEqual(walker._get_var_name(),
                         'matplotlib.pyplot.this.is.a.test')
        walker.imported_functions = {'plt' : ('pyplot', 'matplotlib')}
        walker.imported_modules = {}
        self.assertEqual(walker._get_var_name(),
                         'matplotlib.pyplot.this.is.a.test')

        walker.imported_functions = {'testC': ('testc', 'fileB'),
                                     'fileB': ('fileb', 'fileA'),
                                     'fileA': ('filea', 'last_file')}
        walker.imported_modules = {'last_file': 'actual.last.file'}
        walker.var_name = ['dummy_file', 'testC']
        self.assertEqual(walker._get_var_name(),
                         'actual.last.file.filea.fileb.testc')

    def test_process_import(self):
        walker = pywalker.FileWalker('dummy_file')
        root = _setup('test_data/test_process_import.py')
        [walker._process_import(node) for node in ast.walk(root)
         if isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom)]

        true_functions = {'plt0': ('pyplot', 'mpl'),
                          'uni0': ('uniform', 'np.random'),
                          'uni1': ('uniform', 'numpy.random'),
                          'sample': ('sample', 'numpy.random'),
                          'random': ('random', 'numpy.random'),
                          'randint': ('randint', 'numpy.random')}
        self.assertDictEqual(walker.imported_functions, true_functions)
        true_modules = {'np': 'numpy', 'mpl': 'matplotlib',
                        'plt1': 'matplotlib.pyplot'}
        self.assertDictEqual(walker.imported_modules, true_modules)

    def test_process_function_def(self):
        self.maxDiff = None
        root = _setup('test_data/test_process_functiondef.py')
        walker = pywalker.FileWalker('dummy_file')
        walker.context = ['some', 'scope']

        true_func_obj = {'dummy_file.some.scope.thisisatest': {
            'calls': {},
            'lineno': 1,
            'calling_functions': [],
            'name': 'thisisatest',
            'fname': 'dummy_file',
            'docstring': 'this is a comment',
            'scope': 'some.scope',
            'args': ['arg1', 'arg2', 'arg3']
        }}

        [walker._process_functiondef(node) for node in ast.walk(root)
         if isinstance(node, ast.FunctionDef)]

        self.assertDictEqual(walker.functions, true_func_obj)

    def test_process_call(self):
        root = _setup('test_data/test_process_call.py')
        walker = pywalker.FileWalker('dummy_file')
        walker.var_name = ['this', 'is', 'a', 'test']
        walker.context = ['dummy', 'scope']
        walker.functions = {'dummy_file.dummy.scope': {'calls': {}}}

        [walker._process_call(node) for node in ast.walk(root)
         if isinstance(node, ast.Call)]

        self.assertDictEqual(walker.calls, {
            'this.is.a.test.4': 'this.is.a.test',
        })

        self.assertDictEqual(walker.functions, {
            'dummy_file.dummy.scope': {
                'calls': {
                    'this.is.a.test.4': 4
                }
            }
        })

    def test_process_variable(self):
        root = _setup('test_data/test_process_variable.py')
        walker = pywalker.FileWalker('dummy_file')
        walker.var_name = ['this', 'is', 'a', 'test']
        nodes = [node for node in ast.walk(root) if isinstance(node, ast.Name)]
        self.assertEqual(len(nodes), 1)
        node = nodes[0]
        walker._process_variable(node)
        walker._process_variable(node)
        self.assertDictEqual(walker.variables, {
            'this.is.a.test.1': 'this.is.a.test',
        })

    def test_visits(self):
        walker = pywalker.FileWalker('test_data.test_walk')
        root = _setup('test_data/test_walk.py')
        walker.visit(root)
        functions, var, import_files, import_funcs, calls = walker.get_data()

        true_functions = {
            'test_data.test_walk..thisisatest': {
                'calls': {},
                'lineno': 4,
                'calling_functions': [],
                'name': 'thisisatest',
                'fname': 'test_data.test_walk',
                'docstring': 'test',
                'scope': '',
                'args': ['arg1']
            },
            'test_data.test_walk..thisisatest2': {
                'calls': {
                    'test_data.test_walk.thisisatest.9': 9,
                },
                'lineno': 8,
                'calling_functions': [],
                'name': 'thisisatest2',
                'fname': 'test_data.test_walk',
                'docstring': None,
                'scope': '',
                'args': ['arg1']
            },
            'test_data.test_walk..Test': {
                'calls': {},
                'lineno': 11,
                'calling_functions': [],
                'name': 'Test',
                'fname': 'test_data.test_walk',
                'docstring': None,
                'scope': '',
                'args': ['object']
            },
            'test_data.test_walk.Test.thisisatest3': {
                'calls': {},
                'lineno': 13,
                'calling_functions': [],
                'name': 'thisisatest3',
                'fname': 'test_data.test_walk',
                'docstring': None,
                'scope': 'Test',
                'args': []
            }
        }

        self.assertDictEqual(functions, true_functions)

        # TODO(theahura): THIS DOESNT ACCOUNT FOR SCOPE
        # see: arg1 in both function scopes not being treated separately.
        # Find a way to incorporate context without breaking imported functions.
        true_variables = {
            'test_data.test_walk.arg1.4': 'test_data.test_walk.arg1',
            'test_data.test_walk.arg1.8': 'test_data.test_walk.arg1'
        }

        print var
        self.assertDictEqual(var, true_variables)

        print import_files
        print import_funcs
        print calls


if __name__ == '__main__':
    unittest.main()
