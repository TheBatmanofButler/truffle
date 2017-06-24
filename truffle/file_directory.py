"""
Author: Ganesh Ravichandran
Description: Functions to load and organize file directory
"""

import os
import re
import global_constants

def _get_short_name(long_name):
    """Returns file name without directory path"""

    short_name = long_name.split("/")
    short_name = short_name[len(short_name) - 1]

    return short_name

def _is_included(text):
    """Returns True if .py file, False otherwise"""

    for reg in global_constants.INCLUDE_LIST:
    	if re.search(reg, text):
    		return True

    return False

def _is_excluded(text):
    """Returns True if file should be excluded, False otherwise"""

    for reg in global_constants.EXCLUDE_LIST:
    	if re.search(reg, text):
    		return True

    return False

def _get_directory_tree(path):
    """Helper function for get_directory_tree"""

    tree = {"name": path, "short_name": _get_short_name(path), "children": []}

    for name in os.listdir(path):
        filename = os.path.join(path, name)
        global_constants.COUNT_ID += 1
        if os.path.isdir(filename):
            if not _is_excluded(name):
                tree["children"].append(_get_directory_tree(filename))
        else:
            if _is_included(name):
                tree["children"].append({"name": filename, "short_name": _get_short_name(name), "count_id": global_constants.COUNT_ID})
    return tree

def get_directory_tree(path):
    """Returns dictionary of .py files in the given directory"""

    global_constants.COUNT_ID = 0
    return _get_directory_tree(path)    