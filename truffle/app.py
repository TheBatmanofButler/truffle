from flask import Flask, jsonify, render_template, request
from filetools import get_directory_tree, get_scan_path
from searchtools import index_code

import re
import global_constants


app = Flask(__name__, template_folder="frontend/templates", static_folder="frontend/static")
directory_tree = get_directory_tree(global_constants.FILEPATH)
indexed_functions, indexed_files, indexed_vars, text_searcher = index_code(global_constants.FILEPATH)

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html", directory_tree=directory_tree, filename="", code_text="")

@app.route("/<path:filename>", methods=["GET", "POST"])
def get_code(filename):

    with open("/" + filename, 'r') as f:
        code_text = f.read()

    return render_template("index.html", directory_tree=directory_tree, filename=filename, code_text=code_text)

@app.route("/_get_scan_path", methods=["GET", "POST"])
def _get_scan_path():

	scan_path = get_scan_path(directory_tree, indexed_files, indexed_functions)
	return jsonify(scan_path)

if __name__ == "__main__":
    app.run(debug=True)
