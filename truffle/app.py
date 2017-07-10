from flask import Flask, jsonify, render_template, request
from filetools import get_directory_tree, get_scan_data
from indextools import index_code
import text_index
import global_constants

app = Flask(__name__, template_folder="frontend/templates", static_folder="frontend/static")
directory_tree = get_directory_tree(global_constants.FILEPATH)
project_index = index_code(global_constants.FILEPATH)

# @app.route("/", methods=["GET", "POST"])
# def index():
#     return render_template("index.html", directory_tree=directory_tree,
#                            filename="", lineno="", code_text="")

@app.route("/", methods=["GET", "POST"])
@app.route("/<path:file_name>", methods=["GET", "POST"])
@app.route("/<path:file_name>.<int:lineno>", methods=["GET", "POST"])
def index(file_name = "", lineno = None):

    if file_name:
        file_name = "/" + file_name 
        with open(file_name, 'r') as f:
            code_text = f.read()
    else:
        code_text = ""

    return render_template("index.html", directory_tree=directory_tree,
                           file_name=file_name, lineno=lineno,
                           code_text=code_text)

@app.route("/_get_scan_data", methods=["GET"])
def _get_scan_data():
	scan_functions, scan_path = get_scan_data(directory_tree, project_index.project_index)
	return_dict = {"scanFunctions": scan_functions, "scanPath": scan_path}

	return jsonify(return_dict)

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
