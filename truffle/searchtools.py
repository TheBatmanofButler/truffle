"""
Author: Amol Kapoor
Description: Provides API for handling indexed code base.
"""

import json
import os

import parsers.pyparser as pyparser

import truffle.global_constants as gc

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

def _get_function_calls(parsers):
    functions = []
    for parser in parsers:
        functions.extend(parser.get_function_calls())
    return functions

def _get_function_defs(parsers):
    functions = []
    for parser in parsers:
        functions.extend(parser.get_function_defs())
    return functions

def index_code(code_dir, index_fname='index.json'):
    """
    Gets files in code base and indexes in a json file, returns the list of
    tfl objects
    """
    files = _get_files(code_dir)

    if len(files) == 0:
        raise ValueError('Cannot read any of the files in codebase.')

    parsers = _get_parsers(files)
    function_calls = _get_function_calls(parsers)
    print function_calls
    function_defs = _get_function_defs(parsers)
    print function_defs

if __name__=='__main__':
    index_code('.')