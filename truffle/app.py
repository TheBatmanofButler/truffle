from flask import Flask, json, render_template, request
from file_directory import get_directory_tree
from searchtools import index_code

import re
import global_constants


app = Flask(__name__, template_folder="frontend/templates", static_folder="frontend/static")
directory_tree = get_directory_tree(global_constants.FILEPATH)

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html", directory_tree=directory_tree, filename="", code_text="")

@app.route("/<path:filename>", methods=["GET", "POST"])
def get_code(filename):

    with open("/" + filename, 'r') as f:
        code_text = f.read()

    return render_template("index.html", directory_tree=directory_tree, filename=filename, code_text=code_text)

def isCommentable(filename):
    if re.search(global_constants.SUPPORTED_LANGS_REGEX, filename):
        return True
    return False

if __name__ == "__main__":
    app.run(debug=True)
