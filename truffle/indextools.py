"""
Author: Amol Kapoor
Description: Provides API for indexing code base.
"""

import json
import os

import global_constants as gc
import parsers.pyparser as pyparser
import text_index


def _get_files(code_dir):
    """Gets a list of files that can be processed by truffle."""
    files = []
    for (dirpath, _, filenames) in os.walk(code_dir):
        filenames = [os.path.join(dirpath, f) for f in filenames if
                     f.endswith(gc.SUPPORTED_LANGS)]
        files.extend(filenames)
    return files


def _get_parsers(files):
    """
    For each file in files, get the appropriate ast tree.
    """
    parsers = []
    for fname in files:
        parser = _map_file_to_parser(fname)
        parsers.append(parser)
    return parsers


def _index_code(parsers):
    """
    Returns a list of function objects and file objects.
    """
    functions = {}
    function_calls = {}
    files = {}
    variables = {}
    for parser in parsers:
        fu, fc, fi, va = parser.index_file()
        functions.update(fu)
        function_calls.update(fc)
        files.update(fi)
        variables.update(va)
    return functions, function_calls, files, variables



def _map_file_to_parser(fname):
    """Return the right parser class."""
    # TODO: Make this do the right thing; right now only does python.
    if not fname.endswith('py'):
        raise ValueError('file type not implemented; check _map_file_to_parser')
    return pyparser.PyParser(fname)

def index_code(code_dir, func_index_fname='function_index.json',
               file_index_fname='file_index.json',
               var_index_fname='var_index.json'):
    """
    Gets files in code base and indexes in a json file, returns the list of
    tfl objects.
    """
    files = _get_files(code_dir)

    # Does text search before any other indexing.
    text_searcher = text_index.index_text(files)

    if len(files) == 0:
        print 'no files could be indexed beyond text search'
        return {}, {}, {}, text_searcher

    parsers = _get_parsers(files)

    # Index functions -> function calls.
    indexed_functions, indexed_files, indexed_vars = _index_code(parsers)

    with open(func_index_fname, 'w') as f:
        json.dump(indexed_functions, f)
    with open(file_index_fname, 'w') as f:
        json.dump(indexed_files, f)
    with open(var_index_fname, 'w') as f:
        json.dump(indexed_vars, f)

    return indexed_functions, indexed_files, indexed_vars, text_searcher
