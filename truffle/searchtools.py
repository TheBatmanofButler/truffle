"""
Author: Amol Kapoor
Description: Provides API for handling indexed code base.
"""

import json
import os

import parsers.pyparser as pyparser

import global_constants as gc

def _map_file_to_parser(fname):
    """
    Return the right parser function.
    """
    return pyparser.PyParser(fname)

def _get_parsers(files):
    """
    For each file in files, get the appropriate ast tree.
    """
    parsers = []
    for fname in files:
        parser = _map_file_to_parser(fname)
        parsers.append(parser)
    return parsers

def _get_files(code_dir):
    """
    Gets a list of files that can be processed by truffle.
    """
    files = []
    for (dirpath, _, filenames) in os.walk(code_dir):
        filenames = [os.path.join(dirpath, f) for f in filenames if
                     f.endswith(gc.SUPPORTED_LANGS)]
        files.extend(filenames)
    return files


def _index_files(parsers):
    """ Return a map """
    files = {}
    for parser in parsers:
        files.update(parser.index_files())
    return files

def _index_functions(parsers):
    """
    Returns a list of function objects (see wiki) without a populated field for
    calling functions.
    """
    functions = {}
    for parser in parsers:
        functions.update(parser.index_functions())
    return functions

def _add_calling_functions(indexed_functions):
    """ Populates calling functions set for each defined function passed in"""
    for func_name, function in indexed_functions.iteritems():
        for called_func_name in function['called_functions']:
            if called_func_name[0] in indexed_functions:
                indexed_functions[called_func_name[0]][
                    'calling_functions'].append(func_name)
    return indexed_functions

def index_code(code_dir, func_index_fname='function_index.json',
               file_index_fname='file_index.json'):
    """
    Gets files in code base and indexes in a json file, returns the list of
    tfl objects
    """
    files = _get_files(code_dir)

    if len(files) == 0:
        raise ValueError('Cannot read any of the files in codebase.')

    parsers = _get_parsers(files)
    indexed_functions = _index_functions(parsers)

    indexed_files = _index_files(parsers)

    with open(func_index_fname, 'w') as f:
        json.dump(indexed_functions, f)
    with open(file_index_fname, 'w') as f:
        json.dump(indexed_files, f)

    return indexed_functions, indexed_files

def get_func_def_loc(func_name, functions):
    """ Gets the function definition location """
    return functions[func_name].fname, functions[func_name].lineno

if __name__=='__main__':
    print 'running test on . dir'
    print 'testing languages: %s' % str(gc.SUPPORTED_LANGS)
    # TODO: Make a test folder
    #index_functions('/home/amol/Code/school/Oxford/Oxford-Reinforcement-Learning/final-proj')
    index_functions('.')
    print 'output at function_index.json'
