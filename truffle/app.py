from flask import Flask, jsonify, render_template, request
from filetools import get_directory_tree, get_scan_path
from indextools import index_code
import text_index
import global_constants


app = Flask(__name__, template_folder="frontend/templates", static_folder="frontend/static")
directory_tree = get_directory_tree(global_constants.FILEPATH)
project_index = index_code(global_constants.FILEPATH)

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html", directory_tree=directory_tree,
                           filename="", lineno="", code_text="")

@app.route("/<path:filename>")
@app.route("/<path:filename>.<int:lineno>")
def get_code(filename, lineno = ""):
    with open("/" + filename, 'r') as f:
        code_text = f.read()
    return render_template("index.html", directory_tree=directory_tree,
                           filename=filename, lineno=lineno,
                           code_text=code_text)

@app.route("/_get_scan_path", methods=["GET"])
def _get_scan_path():
    # TODO(ganesh): DOES NOT WORK
    scan_path = get_scan_path(directory_tree, indexed_files, indexed_functions)
    return jsonify(scan_path)

@app.route("/_post_saved_file", methods=["POST"])
def _post_saved_file():
    filename = request.form["filename"]
    code_text = request.form["code_text"]
    with open("/" + filename, 'w') as f:
        f.write(code_text)
    return jsonify("saved!")

@app.route("/_run_search", methods=["GET", "POST"])
def _run_search():
    query = request.form["query"]
    print query
    hits = text_index.search_text(project_index.text_searcher, query)
    print hits
    return jsonify(hits)

@app.route("/_flow_tree", methods=["GET"])
def _get_function_tree():
    return render_template("callgraph.html", forest=project_index.forest,
                           rootDir=global_constants.FILEPATH)

def main():
    print app.root_path
    app.run(debug=True)

if __name__ == "__main__":
    main()
