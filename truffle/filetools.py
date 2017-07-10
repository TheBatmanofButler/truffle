"""
Author: Ganesh Ravichandran
Description: Functions to load and organize file directory
"""

from collections import deque

import os
import re
import global_constants

def _get_short_name(long_name):
    """Returns file name without directory path"""

    short_name = long_name.split("/")
    l = len(short_name)

    if short_name[l - 1] == "":
        short_name = short_name[l - 2]
    else:
        short_name = short_name[l - 1]

    return short_name

def _is_included(text):
    """Returns True if should be included, False otherwise"""

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
    """Returns dictionary of files in the given directory"""

    global_constants.COUNT_ID = 0
    return _get_directory_tree(path)

def _is_commentable(filename):
    if re.search(global_constants.SUPPORTED_LANGS_REGEX, filename):
        return True
    return False

def _get_name(node_name):
    """Returns complete name of function to search function data structure"""

    return node_name.replace("/", ".")[:len(node_name) - 3]

def needsDocumentation(docstring):
    if docstring:
        if re.search(global_constants.TRUFFLE_DOCSTRING_REGEX, docstring):
            return False

    return True

def get_scan_data(directory_tree, project_index):
    """Returns list of functions to scan through"""

    node = directory_tree

    visited = set()
    stack = [node]
    scan_functions = {}
    scan_path = []

    while len(stack) > 0:
        node = stack.pop()
        node_name = node["name"]

        if node_name in visited:
            continue

        visited.add(node_name)

        if _is_commentable(node_name):
            key = _get_name(node_name)
            scan_path.append(node_name)
            scan_functions[key] = []
            file_data = project_index[key]["functions"]
            for function_name in file_data:
                function_data = file_data[function_name]
                lineno = function_data["lineno"]
                scan_functions[key].append(lineno)
            scan_functions[key].sort()

        if "children" in node:
            for i in node["children"]:
                if i["name"] not in visited:
                    stack.append(i)

    return scan_functions, scan_path[::-1]
