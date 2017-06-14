from flask import Flask, jsonify, render_template, request
import os

app = Flask(__name__)

exclude_list = [".git*", ".DS_Store"]

def get_short_name(long_name):
	short_name = long_name.split("/")
	short_name = short_name[len(short_name) - 1]

	return short_name

def make_tree(path):
    tree = { "name": path, "short_name": get_short_name(path), "children": [] }
    try: lst = os.listdir(path)
    except OSError:
        print "fff"
    else:
        for name in lst:
            fn = os.path.join(path, name)
            if os.path.isdir(fn):
                tree['children'].append(make_tree(fn))
            else:
            	if name not in exclude_list:
	                tree['children'].append({"name": fn, "short_name": get_short_name(name)})
    return tree

@app.route("/", methods=["GET", "POST"])
def index():

	tree = make_tree("/Users/ganeshravichandran/Dropbox/Code/truffle")
	return render_template("index.html", tree=tree)

if __name__ == "__main__":
    app.run(debug=True)
