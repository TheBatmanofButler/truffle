from flask import Flask, json, render_template, request
from file_directory import make_directory_tree #, get_all_functions_in_file
from searchtools import index_code

app = Flask(__name__, template_folder="frontend/templates", static_folder="frontend/static")

TEST_PATH = "../"

directory_tree, files = make_directory_tree(TEST_PATH)
indexed_functions = {}

@app.route("/", methods=["GET", "POST"])
def index():
    print directory_tree
    return render_template("index.html", directory_tree=directory_tree)

@app.route("/get_code/<path:filename>", methods=["GET", "POST"])
def get_code(filename):
    # TODO: Make this dynamic by pulling from os path
    codebase = "/home/amol/Code/1train/truffle"
    filename = codebase + "/" + filename
    code_text = ""
    with open(filename, 'r') as f:
        code_text = f.read()

    code_text = code_text.splitlines()

    return render_template("index.html", directory_tree=directory_tree,
                           code_text=code_text)

if __name__ == "__main__":
    app.run(debug=True)
