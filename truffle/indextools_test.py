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
        print project_index.project_index

    def test_text_search(self):
        pass


if __name__ == '__main__':
    unittest.main()
