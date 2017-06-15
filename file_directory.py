import os, re

def get_short_name(long_name):
	short_name = long_name.split("/")
	short_name = short_name[len(short_name) - 1]

	return short_name

def is_included(text):
	exclude_list = [".git", ".DS_Store"]

	for reg in exclude_list:
		if re.match(reg, text):
			return False

	return True

def make_tree(path):
    tree = { "name": path, "short_name": get_short_name(path), "children": [] }
    try: lst = os.listdir(path)
    except OSError:
        print "fff"
    else:
        for name in lst:
			print name, is_included(name)
			if is_included(name):
				fn = os.path.join(path, name)
				if os.path.isdir(fn):
					tree['children'].append(make_tree(fn))
				else:
					tree['children'].append({"name": fn, "short_name": get_short_name(name)})
    return tree