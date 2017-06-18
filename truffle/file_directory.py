from codecrawler import CodeCrawler

import os, re

def get_short_name(long_name):
	short_name = long_name.split("/")
	short_name = short_name[len(short_name) - 1]

	return short_name

def is_included(text):
	include_list = [".py$"]

	for reg in include_list:
		if re.search(reg, text):
			return True

	return False

def is_excluded(text):
	exclude_list = [".git*", ".DS_Store", ".pyc$", "__pycache__"]

	for reg in exclude_list:
		if re.search(reg, text):
			return False

	return True

def make_directory_tree(path):
	all_py_files = []
	tree, all_py_files = make_directory_tree_helper(path, all_py_files)
	return tree, all_py_files

def make_directory_tree_helper(path, all_py_files):
	tree = { "name": path, "short_name": get_short_name(path), "children": [] }
	try: lst = os.listdir(path)
	except OSError:
	    print "fff"
	else:
	    for name in lst:
			fn = os.path.join(path, name)
			if os.path.isdir(fn):
				if is_excluded(name):
					tree['children'].append(make_directory_tree_helper(fn, all_py_files))
			else:
				if is_included(name):
					all_py_files.append(fn)
					tree['children'].append({"name": fn[1:], "short_name": get_short_name(name), "isPython": True})
	return tree, all_py_files

def get_all_functions():
	rootpath = os.getcwd()
	directory_tree, all_py_files = make_directory_tree(rootpath)
	files = {}
	functions = {}
	calls = {}

	for fname in all_py_files:
		CodeCrawler(fname, files, functions, calls)

	return calls