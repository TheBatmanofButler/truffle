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
            'scope': ['some', 'scope'],
            'args': ['arg1', 'arg2', 'arg3']
        }}

        [walker._process_functiondef(node) for node in ast.walk(root)
         if isinstance(node, ast.FunctionDef)]

        self.assertDictEqual(walker.functions, true_func_obj)

if __name__ == '__main__':
    unittest.main()
