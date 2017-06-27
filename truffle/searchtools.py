"""
Author: Amol Kapoor
Description: Provides API for using indexed code base. Attempts to handle for
varying amounts of input data, fails gracefully.
"""
import text_index

def get_func_def_loc(func_name, indexed_functions):
    """Gets the function definition location given a func_name from a call."""
    pass

def get_file_functions(fname, indexed_functions, indexed_files):
    """Gets a list of function objects that are defined in a file."""
    pass

def get_variable_link(variable_name, indexed_vars):
    """Gets the source location of a variable given its name."""
    pass

def get_text_search(text_searcher, query):
    """ Gets the text search hits """
    return text_index.search_text(text_searcher, query)
