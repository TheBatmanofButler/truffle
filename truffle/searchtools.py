"""
Author: Amol Kapoor
Description: Provides API for using indexed code base. Attempts to handle for
varying amounts of input data, fails gracefully.
"""

import os
import text_index

def _get_possible_sources(partial_path, indexed_files):
    """Returns the possible sources of a file given a partial path desc."""
    partial_path = partial_path.replace('.', '/')
    possible_sources = []
    for root, _, files in os.walk('.'):
        for fname in files:
            path = os.path.abspath(os.path.join(root, fname))
            if partial_path in path and path in indexed_files:
                possible_sources.append(path)
    return possible_sources

def _get_possible_functions(func_name, possible_sources, indexed_files):
    possible_functions = []
    for src_fname in possible_sources:
        file_obj = indexed_files[src_fname]
        for name, lineno in file_obj.functions:
            if func_name == name:
                possible_functions.append('%s.%s.%d' % (src_fname, name,
                                                        lineno))

    return possible_functions

def _get_possible_functions_with_scope(scope, possible_functions,
                                       indexed_functions):
    possible_functions_with_scope = []
    for name in possible_functions:
        context = indexed_functions[name]['scope']
        if scope in context:
            possible_functions_with_scope.append(name)

    return possible_functions


def get_func_def_loc(func_call, indexed_functions, indexed_files):
    """Gets the function definitions given a func_obj from a call.

    func_call is a dict containing as much relevant information about the call
    as is easily obtained from the initial grab. This should at minimum contain
    calling_fname, func_module, func_name if any.
    """
    func_name = func_call.func_name
    module = func_call.func_module
    calling_fname = func_call.calling_fname

    calling_file_obj = indexed_files[calling_fname]

    # First want to get the real function name.
    if func_name in calling_file_obj.imported_functions:
        func_name, module = calling_file_obj.imported_functions[func_name]
    # And we want to check for imported modules
    elif module and module in calling_file_obj.imported_files:
        module = calling_file_obj.imported_files[module]

    # Now we can get the source file name.
    source_fname = module if module else calling_fname
    possible_sources = _get_possible_sources(source_fname, indexed_files)
    if not possible_sources:
        return None

    # With function name and source file(s), can start finding functions.
    possible_functions = _get_possible_functions(func_name, possible_sources,
                                                 indexed_files)
    if not possible_functions:
        return None
    elif len(possible_functions) == 1:
        return possible_functions

    # Can try to further narrow down by scope.
    possible_functions_with_scope = _get_possible_functions_with_scope(
        func_call.scope, possible_functions, indexed_functions)

    if not possible_functions_with_scope:
        return None
    else:
        return possible_functions_with_scope

def get_file_functions(fname, indexed_functions, indexed_files):
    """Gets a list of function objects that are defined in a file."""
    pass

def get_variable_link(variable_name, indexed_vars):
    """Gets the source location of a variable given its name."""
    pass

def get_text_search(text_searcher, query):
    """ Gets the text search hits """
    return text_index.search_text(text_searcher, query)
