"""
Author: Amol Kapoor
Description: Provides API for using indexed code base.
"""

def get_func_def_loc(func_name, functions):
    """ Gets the function definition location """
    return functions[func_name].fname, functions[func_name].lineno

def get_text_search(text_searcher, query):
    """ Gets the text search hits """
    return text_index.search_text(text_searcher, query)
