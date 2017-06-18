from flask import Flask, json, render_template, request
from file_directory import make_directory_tree, get_all_functions_in_file
from searchtools import index_code

app = Flask(__name__, template_folder="frontend/templates", static_folder="frontend/static")

TEST_PATH = "/Users/ganeshravichandran/Dropbox/Code/truffle"
directory_tree = make_directory_tree(TEST_PATH)
indexed_functions = {}

@app.route("/", methods=["GET", "POST"])
def index():
	return render_template("index.html", directory_tree=directory_tree)

@app.route("/get_code/<path:filename>", methods=["GET", "POST"])
def get_code(filename):
	filename = "/" + filename
	codebase = ""
	with open(filename, 'r') as f:
		code_text = f.read()
	indexed_functions = index_code(TEST_PATH)
	functions_in_file = get_all_functions_in_file(indexed_functions, filename)

	print type(indexed_functions)

	return render_template("index.html", directory_tree=directory_tree, functions_in_file=functions_in_file, indexed_functions=indexed_functions, code_text=code_text)

if __name__ == "__main__":
    app.run(debug=True)
