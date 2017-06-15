from flask import Flask, jsonify, render_template, request
from file_directory import make_tree

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():

	tree = make_tree("/Users/ganeshravichandran/Dropbox/Code/truffle")
	return render_template("index.html", tree=tree, code_text=code_text)

if __name__ == "__main__":
    app.run(debug=True)
