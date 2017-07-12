function codeChange(editor, codeIsChanged) {
	sessionStorage.setItem("codeIsChanged", JSON.stringify(codeIsChanged));
	setDirectoryTreeLinkBackground();
}

function getFileNameFromURL() {
	var scanOn = JSON.parse(sessionStorage.getItem("scanOn"));
	var parts = window.location.pathname.split(".");

	if (isNaN(parts[parts.length - 1])) {
		return window.location.pathname;
	}
	else {
		var noExt = parts.slice(0, -2).join('/');
		var fileName = noExt + "." + parts[parts.length - 2];
		return fileName;
	}
}

function getFileNameFromServer(callback) {
	var currentFunction = JSON.parse(sessionStorage.getItem("currentFunction"));

	$.getJSON('/_get_file_name', {
		current_function: currentFunction
	}, function(fileName) {
		callback(fileName);
	});
}

function setupCodeMirror() {

	var fileName = getFileNameFromURL();
	var mode;
	if (fileName.includes(".py")) {
		mode = "python";
	}
	else if (fileName.includes(".js")) {
		mode = "javascript";
	}
	else if (fileName.includes(".html")) {
		mode = "xml";
	}

	CodeMirror.commands.save = function(instance) {
		postSavedFile(fileName, instance.getValue());
	}

	// global var
	editor = CodeMirror(document.getElementById("editor"), {
	  value: codeText,
	  lineNumbers: true,
	  mode: mode,
	  theme: "base16-dark",
	  readOnly: false,
	  cursorBlinkRate: 530
	});

	editor.on("change", function() {
		if (editor.getDoc().historySize().undo) {
			codeChange(editor, true);
		}
		else {
			codeChange(editor, false);
		}
	});

	$(".save-option").click( function (e) {
		editor.execCommand("save");
	});

	// hyperlinkOverlay(editor);
	var scanOn = JSON.parse(sessionStorage.getItem("scanOn"));

	if (scanOn) {
		editor.setOption("readOnly", true);
		editor.setOption("cursorBlinkRate", -1);

		var lineno = getLinenoFromURL();
		moveToLine(lineno);
	}

}

function removeCurrentLineStyling() {
	var lineno = getLinenoFromURL()
	if (!isNaN(lineno)) {
		var currentLineno = parseInt(lineno) - 1;
		editor.getDoc().removeLineClass(currentLineno, "gutter", "selected-line-gutter");
		editor.getDoc().removeLineClass(currentLineno, "background", "selected-line-background");
	}
}

function moveToLine(lineno) {
	removeCurrentLineStyling();
	var newLineno = lineno - 1;
	editor.getDoc().addLineClass(newLineno, "gutter", "selected-line-gutter");
	editor.getDoc().addLineClass(newLineno, "background", "selected-line-background");
	lineScroll(newLineno, editor);
}

function lineScroll(i) { 
	var t = editor.charCoords({line: i, ch: 0}, "local").top; 
	var middleHeight = editor.getScrollerElement().offsetHeight / 2; 
	editor.scrollTo(null, t - middleHeight - 5); 
} 

function getScanPathUrl(url) {
	var filenameEndIndex = url.indexOf(".py") + 3,
		filename = url.substring(0,filenameEndIndex),
		scanPathUrl = filename + "." + lineno;

	return scanPathUrl;
}

function setScanPath(callback) {
	$.getJSON('/_get_scan_path', function(scanPath) {
		sessionStorage.setItem("scanPath", JSON.stringify(scanPath));
		callback(scanPath);
	});
}

function postSavedFile(filename, codeText) {
	$.post('/_post_saved_file', {"filename": filename, "code_text": codeText}, function(response) {
		sessionStorage.setItem("codeIsChanged", JSON.stringify(false));
		setDirectoryTreeLinkBackground();
		console.log("File Saved")
	});
}

function pathToDomId(filepath) {
	return "FILE" + filepath.split("/").join("-").split(".").join("-")
}

function getShortNameFromFileName(fileName) {
	var parts = fileName.split("/");
	return parts[parts.length - 1];
}

function getLinenoFromURL() {
	return window.location.pathname.split(".").pop();
}

function getLinenoFromServer(callback) {
	var currentFunction = JSON.parse(sessionStorage.getItem("currentFunction"));

	$.getJSON('/_get_lineno', {
		current_function: currentFunction
	}, function(lineno) {
		callback(lineno);
	});
}

function getCodeText(callback) {
	var fileName = getFileNameFromURL();
	$.getJSON('/_get_code_text', {
		file_name: fileName
	}, function(codeText) {
		callback(codeText);
	});
}

function startScan() {
	setScanPath( function(scanPath) {
		sessionStorage.setItem("scanOn", JSON.stringify(true));
		var scanIndex = sessionStorage.getItem("scanIndex");
		if (!scanIndex) {
			scanIndex = 0;
			sessionStorage.setItem("scanIndex", JSON.stringify(scanIndex));
		}
		sessionStorage.setItem("currentFunction", JSON.stringify(scanPath[scanIndex]));
		goToPage();
	});
}

function goToPage() {
	getFileNameFromServer( function(nextFile) {
		getLinenoFromServer( function(lineno) {
			var url = window.location.origin + nextFile + "." + lineno;

			if (getFileNameFromURL() == nextFile) {
				editor.setOption("readOnly", true);
				editor.setOption("cursorBlinkRate", -1);

				moveToLine(lineno);
				window.history.pushState("", "", url);
			}
			else {
				alert("Going to next page.")
				$(".one-line").hide();
				$(".bottom-box").animate({height: "0"}, function () {
					window.open(url, "_self");
				});
			}
		})
	})
}

function nextInScan(reverse) {

	var scanPath = JSON.parse(sessionStorage.getItem("scanPath"));
	var scanIndex = JSON.parse(sessionStorage.getItem("scanIndex"));

	// TO-DO: create cycle
	if (reverse) {
		scanIndex--;		
	}
	else {
		scanIndex++;
	}

	sessionStorage.setItem("scanIndex", JSON.stringify(scanIndex));

	var currentFunction = scanPath[scanIndex];
	sessionStorage.setItem("currentFunction", JSON.stringify(currentFunction));

	goToPage();
}

function endScan() {
	console.log("Scan ended.")
	
	removeCurrentLineStyling();
	var fileName = getFileNameFromURL();
	var url = window.location.origin + fileName;	

	window.history.pushState("", "", url);
	sessionStorage.setItem("scanOn", JSON.stringify(false));
}

function editDocstring() {

	var docstring = getDocstring();
	if (docstring) {
		console.log(docstring);		
	}

	return codeText;
}

function getDocstring() {
	$.getJSON('/_get_docstring', function(data) {
		console.log(data);
	});
	// /_get_docstring
	// var codeText = JSON.parse(sessionStorage.getItem("codeText"));
	// codeTextArray = codeText.split("\n");
	// var lineno = JSON.parse(sessionStorage.getItem("currentFunction"));

	// var docstringLines = "";
	// if isDocstring(codeLine) {
		
	// }
	// else {
	// 	return "";
	// }
}

function isDocstring(codeLine) {
	if (codeLine.indexOf("\'\'\'") !== -1 || codeLine.indexOf("\"\"\"") !== -1) {
		return true;
	}

	return false;
}


function runSearch(query) {
	window.open(window.location.origin + '/_run_search?query=' + query);
}

function loadSearchResults() {
	console.log(searchResults);
	for (hit in searchResults) {
		$('#editor').append('<div class="search-result-file">' + hit + '<br></div>')
		$('#editor').append('<div class="search-result">' + searchResults[
			hit]['highlight'] + '<br></div>')
		console.log(hit)
	}
}

function loadCallGraph() {
	window.open(window.location.origin + '/_flow_tree')
}
