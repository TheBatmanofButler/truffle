"""Tests for indextools.py."""

import indextools
import unittest

class testPywalker(unittest.TestCase):

    def test_get_files(self):
        files = indextools.get_files('test_data/get_files_test_data/')

        true_files = ['test_data/get_files_test_data/test4.py',
                      'test_data/get_files_test_data/test2.py',
                      'test_data/get_files_test_data/test1.py',
                      'test_data/get_files_test_data/dir1/test1.py']
        self.assertSequenceEqual(files, true_files)

    def test_index_code(self):
        project_index = indextools.ProjectIndex('test_data/index_test_data')
        project_index = project_index.project_index

        true_keys = ['test_data.index_test_data.test1',
                     'test_data.index_test_data.test2']
        self.assertItemsEqual(project_index.keys(), true_keys)

        functions = project_index[true_keys[0]]['functions']
        var = project_index[true_keys[0]]['variables']
        import_mod = project_index[true_keys[0]]['imported_modules']
        import_from = project_index[true_keys[0]]['imported_from']
        calls = project_index[true_keys[0]]['calls']

        true_functions = [true_keys[0] + '.add',
                          true_keys[0] + '.mult',
                          true_keys[0] + '.MathStuff',
                          true_keys[0] + '.MathStuff.__init__',
                          true_keys[0] + '.MathStuff.get_vars',
                          true_keys[0] + '.MathStuff.plug_in_vars']
        self.assertItemsEqual(true_functions, functions.keys())

        true_func_obj = {
            'args': ['x', 'y'],
            'lineno': 7,
            'calls': {},
            'fname': 'test_data.index_test_data.test1',
            'scope': '',
            'calling_functions': ['test_data.index_test_data.test2'],
            'docstring': 'This is a multiplication function for testing.',
            'name': 'mult'
        }

        import pdb; pdb.set_trace()

    def test_text_search(self):
        pass


if __name__ == '__main__':
    unittest.main()
