from flask import Flask, jsonify, render_template, request
from filetools import get_directory_tree, get_scan_path
from indextools import index_code
import text_index

import argparse
import os

parser = argparse.ArgumentParser(description='Process your code base.')
parser.add_argument('--log_dir', help='Where to run truffle.', default='./')
args = parser.parse_args()
log_dir = os.path.abspath(args.log_dir)

app = Flask(__name__, template_folder="frontend/templates", static_folder="frontend/static")
directory_tree = get_directory_tree(log_dir)
project_index = index_code(log_dir)

@app.route("/", methods=["GET", "POST"])
@app.route("/<path:file_name>", methods=["GET", "POST"])
@app.route("/<path:file_name>.<int:lineno>", methods=["GET", "POST"])
def index(file_name="", lineno=None):

    if file_name:
        file_name = "/" + file_name
        with open(file_name, 'r') as f:
            code_text = f.read()
    else:
        code_text = ""

    return render_template("index.html", directory_tree=directory_tree,
                           file_name=file_name, lineno=lineno,
                           code_text=code_text, search_results=None)

@app.route("/_get_scan_path", methods=["GET"])
def _get_scan_path():
    data = get_scan_path(directory_tree, project_index.project_index)
    return jsonify(data)

@app.route("/_get_code_text", methods=["GET"])
def _get_code_text():
    file_name = request.args.get('file_name', 0, type=str)

    with open(file_name, 'r') as f:
        code_text = f.read()

    return jsonify(code_text)

@app.route("/_get_lineno", methods=["GET"])
def _get_lineno():
    current_function = request.args.get('current_function', 0, type=str)
    return jsonify(int(project_index.functions[current_function]["lineno"]))

@app.route("/_get_file_name", methods=["GET"])
def _get_file_name():
    current_function = request.args.get('current_function', 0, type=str)
    fname = project_index.functions[current_function]["fname"]
    file_name = _convert_file_name_to_slashes(fname) + ".py"
    return jsonify(file_name);

def _convert_file_name_to_slashes(file_name_unformatted):
    file_name = file_name_unformatted.replace(".", "/")
    return file_name

@app.route("/_post_saved_file", methods=["POST"])
def _post_saved_file():
    filename = request.form["filename"]
    code_text = request.form["code_text"]
    with open("/" + filename, 'w') as f:
        f.write(code_text)
    return jsonify("saved!")

@app.route("/_run_search", methods=["GET", "POST"])
def _run_search():
    query = request.args.get('query', None)
    hits = text_index.search_text(project_index.text_searcher, query)
    return render_template("index.html", directory_tree=directory_tree,
                           file_name='', lineno='', code_text='',
                           search_results=hits)

@app.route("/_flow_tree", methods=["GET"])
def _get_function_tree():
    return render_template("callgraph.html", forest=project_index.forest,
                           rootDir=log_dir)

@app.route("/_get_docstring", methods=["GET"])
def _get_docstring():
    # filename = request.form["filename"]
    # code_text = request.form["code_text"]
    return jsonify("WOO WOO WOO WOO WOO")

def main():
    print app.root_path
    app.run(debug=True)

if __name__ == "__main__":
    main()
