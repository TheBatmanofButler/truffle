function codeChange(editor, codeIsChanged) {
	sessionStorage.setItem("codeIsChanged", JSON.stringify(codeIsChanged));
	setSelectedLink();
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

	getCodeText(fileName, function(codeText) {

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

		var scanOn = JSON.parse(sessionStorage.getItem("scanOn"));

		if (scanOn) {
			editor.setOption("readOnly", true);
			editor.setOption("cursorBlinkRate", -1);

			var lineno = getLinenoFromURL();
			moveToLine(lineno);
		}
	})

}

function removeCurrentLineStyling() {
	var lineno = getLinenoFromURL()
	if (!isNaN(lineno)) {
		var currentLineno = lineno - 1;
		editor.getDoc().removeLineClass(currentLineno, "gutter", "selected-line-gutter");
		editor.getDoc().removeLineClass(currentLineno, "background", "selected-line-background");
	}
}

function moveToLine(lineno) {
	removeCurrentLineStyling();
	var cmLineno = lineno - 1;
	editor.getDoc().addLineClass(cmLineno, "gutter", "selected-line-gutter");
	editor.getDoc().addLineClass(cmLineno, "background", "selected-line-background");
	lineScroll(cmLineno, editor);

	setupBottomBox(lineno);
}

function lineScroll(i) { 
	var t = editor.charCoords({line: i, ch: 0}, "local").top; 
	var middleHeight = editor.getScrollerElement().offsetHeight / 2; 
	editor.scrollTo(null, t - middleHeight - 5); 
} 

function setScanPath(callback) {
	$.getJSON('/_get_scan_path', function(data) {
		sessionStorage.setItem("scanPath", JSON.stringify(data[0]));
		sessionStorage.setItem("treePath", JSON.stringify(data[1]));
		callback(data);
	});
}

function postSavedFile(filename, codeText) {
	$.post('/_post_saved_file', {"filename": filename, "code_text": codeText}, function(response) {
		sessionStorage.setItem("codeIsChanged", JSON.stringify(false));
		setSelectedLink();
		console.log("File Saved")
	});
}

function pathToDomId(filepath) {
	return "FILE" + filepath.split("/").join("-").split(".").join("-")
}

function pathToKey(filepath) {
	var parts = filepath.split(".");
	parts = parts.slice(0, -1);
	if (parts.length > 1) {
		parts = parts.join(".");
	}
	else {
		parts = parts[0];
	}
	return parts.split("/").join(".");
}

function getShortNameFromFileName(fileName) {
	var parts = fileName.split("/");
	return parts[parts.length - 1];
}

function getLinenoFromURL() {
	return parseInt(window.location.pathname.split(".").pop());
}

function getLinenoFromServer(functionName, callback) {
	$.getJSON('/_get_lineno', {
		function_name: functionName
	}, function(lineno) {
		callback(lineno);
	});
}

function getCodeText(fileName, callback) {
	$.getJSON('/_get_code_text', {
		file_name: fileName
	}, function(codeText) {
		callback(codeText);
	});
}

function startScan() {
	setScanPath( function(data) {
		sessionStorage.setItem("scanOn", JSON.stringify(true));
		sessionStorage.setItem("commentBoxMode", JSON.stringify(0));

		if (!$(".selected").length) {
			$(".single-line-tab").click();
		}

		var scanPath = data[0];
		var treePath = data[1];
		var scanIndex = getScanStartIndex(scanPath, treePath);

		sessionStorage.setItem("scanIndex", JSON.stringify(scanIndex));
		sessionStorage.setItem("scanStartIndex", JSON.stringify(scanIndex));
		sessionStorage.setItem("currentFunction", JSON.stringify(scanPath[scanIndex]));

		getFileNameFromServer( function(nextFile) {
			getDocstringInfo(nextFile, function() {
				goToCommentable();
			});
		});
	});
}

function getFunctionsInFileFromServer(fileName, callback) {
	$.getJSON('/_get_functions_in_file', {
		file_name: fileName
	}, function(functionsInFile) {
		callback(functionsInFile);
	});
}

function getDocstringInfo(fileName, callback) {
	getFunctionsInFileFromServer(fileName, function(functionsInFile) {
		getCodeText(fileName, function(codeText) {

			var codeTextArray =	codeText.split("\n");
			var docstringInfo = [];

			for (var i in functionsInFile) {
				var functionObj = functionsInFile[i];
				var lineno = functionObj.lineno - 1;
				var declInfo = getDeclLineno(codeTextArray, lineno);
				var declStartLineno = declInfo[0];
				var isFunction = declInfo[1];
				var docstringStartLineno = declStartLineno + 1;
				var docstring = codeTextArray.slice(docstringStartLineno, Infinity)
											.join("\n")
											.match(docstringFromStartRegex);
				if (docstring) {
					var docstringLength = docstring[0].split("\n").length;
					functionsInFile[i].docstringLength = docstringLength;
				}
				else {
					functionsInFile[i].docstringLength = false;
				}
			}
			sessionStorage.setItem("functionsInFile", JSON.stringify(functionsInFile));
			callback();
		});
	})
}

function getScanStartIndex(scanPath, treePath) {
	var treeIndex = treePath.indexOf(getFileNameFromURL());

	var j = treeIndex;

	do {
		var fileName = treePath[j];
		var key = pathToKey(fileName);
		for (var i in scanPath) {
			var functionName = scanPath[i];
			if (functionName.indexOf(key) != -1) {
				return i;
			}
		}
		j++;
		if (j == treePath.length) {
			j = 0;
		}
	}
	while (j != treeIndex)

}

function getLinenoFromStorage() {
	var functionName = JSON.parse(sessionStorage.getItem("currentFunction"));
	var functionsInFile = JSON.parse(sessionStorage.getItem("functionsInFile"));

	for (var i in functionsInFile) {
		var functionObj = functionsInFile[i];
		if (functionObj.functionName == functionName) {
			return functionObj.lineno;
		}
	}
}

function goToCommentable() {
	getFileNameFromServer( function(nextFile) {
		var lineno = getLinenoFromStorage();
		console.log(lineno);
		var url = window.location.origin + nextFile + "." + lineno;

		if (getFileNameFromURL() == nextFile) {
			editor.setOption("readOnly", true);
			editor.setOption("cursorBlinkRate", -1);

			moveToLine(lineno);
			window.history.pushState("", "", url);
		}
		else {
			alert("Going to next page.")
			$(".single-line").hide();
			$(".bottom-box").animate({height: "0"}, function () {
				window.open(url, "_self");
			});
		}
	})
}

function nextInScan(reverse) {

	var scanPath = JSON.parse(sessionStorage.getItem("scanPath"));
	var scanIndex = JSON.parse(sessionStorage.getItem("scanIndex"));
	var scanStartIndex = JSON.parse(sessionStorage.getItem("scanStartIndex"));
	var docstringOffset = JSON.parse(sessionStorage.getItem("docstringOffset"));
	var functionsInFile = JSON.parse(sessionStorage.getItem("functionsInFile"));

	var oldFunction = scanPath[scanIndex];
	if (docstringOffset) {
		for (var i in functionsInFile) {
			var functionObj1 = functionsInFile[i];
			if (functionObj1.functionName == oldFunction) {
				for (var j in functionsInFile) {
					var functionObj2 = functionsInFile[j];
					if (functionObj2.lineno > functionObj1.lineno) {
						functionObj2.lineno += docstringOffset;
					}
				}
			}
		}
		sessionStorage.setItem("functionsInFile", JSON.stringify(functionsInFile));
		sessionStorage.setItem("docstringOffset", JSON.stringify(0));
	}

	if (reverse) {
		scanIndex--;		
	}
	else {
		scanIndex++;

		if (scanIndex == scanStartIndex) {
			endScan();
			return;
		}
	}

	sessionStorage.setItem("scanIndex", JSON.stringify(scanIndex));

	var currentFunction = scanPath[scanIndex];
	sessionStorage.setItem("currentFunction", JSON.stringify(currentFunction));

	getFileNameFromServer( function(nextFile) {
		getDocstringInfo(nextFile, function() {
			goToCommentable();
		});
	});
}

function endScan() {
	console.log("Scan ended.")
	
	if ($(".single-line").is(":visible")) {
		$(".single-line").hide();
		$(".bottom-box").animate({height: "0"});
	}

	removeCurrentLineStyling();
	var fileName = getFileNameFromURL();
	var url = window.location.origin + fileName;

	editor.setOption("readOnly", false);
	editor.setOption("cursorBlinkRate", 500);

	window.history.pushState("", "", url);
	sessionStorage.setItem("scanIndex", JSON.stringify(null));
	sessionStorage.setItem("currentFunction", JSON.stringify(null));
	sessionStorage.setItem("scanOn", JSON.stringify(false));
}

function editDocstring() {

	var docstring = getDocstring();
	if (docstring) {
		console.log(docstring);		
	}

	return codeText;
}

function getDocstringFromServer(callback) {
	var currentFunction = JSON.parse(sessionStorage.getItem("currentFunction"));

	$.getJSON('/_get_docstring', {
		current_function: currentFunction
	}, function(docstring) {
		callback(docstring);
	});
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

function setupBottomBox(lineno) {
	var corrLineno = lineno - 1;
	var codeTextArray = updateLocalCodeText();
	var declInfo = getDeclLineno(codeTextArray, corrLineno);
	var declStartLineno = declInfo[0];
	var isFunction = declInfo[1];
	var indentation = codeTextArray[declStartLineno].match(indentationRegex)[0] + "    ";

	var functionsInFile = JSON.parse(sessionStorage.getItem("functionsInFile"));
	var functionName = JSON.parse(sessionStorage.getItem("currentFunction"));

	for (var i in functionsInFile) {
		var functionObj = functionsInFile[i];
		if (functionObj.functionName == functionName) {
			var docstringLength = functionObj.docstringLength;
			break;
		}
	}

	if (!docstringLength) {
		addDocstring(codeTextArray, declStartLineno, functionName, indentation);
		codeTextArray = updateLocalCodeText();
		var docstringLength = 1;
	}

	var docstring = codeTextArray.slice(declStartLineno, Infinity)
									.join("\n")
									.match(docstringRegex)[0];
	var docstringNoQuotes = docstring.slice(3,docstring.length - 3)

	var commentBoxMode = parseInt(JSON.parse(sessionStorage.getItem("commentBoxMode")));
	if (commentBoxMode == 0) {
		$(".single-line-text").val(docstringNoQuotes);

		$(".single-line-text").off('keyup');
		$(".single-line-text").on('keyup', function () {
			var docstringStartLineno = declStartLineno + 1;

			var userInput = $(".single-line-text").val(),
				userInputArray = userInput.split(" "),
				docstringLine = "",
				docstringArray = [];

			for (var i in userInputArray) {
				var word = userInputArray[i];
				if (docstringLine.length + word.length > 72 - indentation.length) {
					console.log("ping!")
					docstringArray.push(docstringLine);
					docstringLine = indentation + word + " ";
				}
				else {
					docstringLine += word + " ";
				}
				if (i == userInputArray.length - 1) {
					docstringLine = docstringLine.slice(0, docstringLine.length - 1);
				}
			}
			docstringArray.push(docstringLine);

			var docstringFormatted = indentation + "\"\"\"" + docstringArray.join("\n");

			if (docstringArray.length > 1) {
				docstringFormatted += "\n" + indentation;
			}

			docstringFormatted += "\"\"\"" + "\n";

			var newNumOfLines = docstringFormatted.split("\n").length - 1;

			var functionsInFile = JSON.parse(sessionStorage.getItem("functionsInFile"));

			for (var i in functionsInFile) {
				var functionObj = functionsInFile[i];
				if (functionObj.functionName == functionName) {
					var oldNumOfLines = functionObj.docstringLength;
					functionObj.docstringLength = newNumOfLines;
				}
			}

			var docstringOffset = newNumOfLines - docstringLength;
			sessionStorage.setItem("docstringOffset", JSON.stringify(docstringOffset));
			sessionStorage.setItem("functionsInFile", JSON.stringify(functionsInFile));
			// // editor.getDoc().replaceRange("", {ch: 0, line: docstringStartLineno}, {ch: 0, line: docstringStartLineno + numOfLines});
			editor.getDoc().replaceRange(docstringFormatted, {ch: 0, line: docstringStartLineno}, {ch: 0, line: docstringStartLineno + oldNumOfLines});
			console.log(docstringStartLineno, newNumOfLines, docstringFormatted.split("\n"))
		});
	}
	else if (commentBoxMode == 1) {
		var docstringFields = functionFormatParse(docstringNoQuotes);
		// if (isFunction) {
			if (docstringFields.desc) {
				var docstringDesc = docstringFields.desc;
				$(".multi-line-desc-text").val(docstringDesc);
			}
			else {
				$(".multi-line-desc-text").val("");
			}
			
			$(".multi-line-args-wrapper").empty();
			if (docstringFields.args) {
				var docstringArgs = docstringFields.args;
				for (var arg in docstringArgs) {

     				$container = document.createElement("div")

     				$label = document.createElement("div")
     				$($label).text(docstringArgs[arg][0] + ":").attr("class", "multi-line-label");

     				$textarea = document.createElement("textarea")
     				$($textarea).text(docstringArgs[arg][1]).attr("class", "multi-line-args-text")

     				$container.append($label);
     				$container.append($textarea);
					$(".multi-line-args-wrapper").append($container);

					console.log(arg, docstringArgs[arg]);
				}
			}
			
			if (docstringFields.returns) {
				var docstringReturns = docstringFields.returns;
				$(".multi-line-returns-text").val(docstringReturns);
				console.log(docstringFields.returns)
			}
			else {
				$(".multi-line-returns-text").val("");
			}
		// }
		$(".multi-line-text").on('keyup', function () {
			var docstringStartLineno = declStartLineno + 1;

			var declInput = $(".multi-line-desc-text").val(),
				declInputArray = userInput.split(" "),
				docstringLine = "",
				docstringArray = [];

			for (var i in declInputArray) {
				var word = declInputArray[i];
				if (docstringLine.length + word.length > 72 - indentation.length) {
					console.log("ping!")
					docstringArray.push(docstringLine);
					docstringLine = indentation + word + " ";
				}
				else {
					docstringLine += word + " ";
				}
				if (i == declInputArray.length - 1) {
					docstringLine = docstringLine.slice(0, docstringLine.length - 1);
				}
			}
			docstringArray.push(docstringLine);

			var docstringFormatted = indentation + "\"\"\"" + docstringArray.join("\n");

			if (docstringArray.length > 1) {
				docstringFormatted += "\n" + indentation;
			}

			docstringFormatted += "\"\"\"" + "\n";

			var newNumOfLines = docstringFormatted.split("\n").length - 1;

			var functionsInFile = JSON.parse(sessionStorage.getItem("functionsInFile"));

			for (var i in functionsInFile) {
				var functionObj = functionsInFile[i];
				if (functionObj.functionName == functionName) {
					var oldNumOfLines = functionObj.docstringLength;
					functionObj.docstringLength = newNumOfLines;
				}
			}

			var docstringOffset = newNumOfLines - docstringLength;
			sessionStorage.setItem("docstringOffset", JSON.stringify(docstringOffset));
			sessionStorage.setItem("functionsInFile", JSON.stringify(functionsInFile));
			// // editor.getDoc().replaceRange("", {ch: 0, line: docstringStartLineno}, {ch: 0, line: docstringStartLineno + numOfLines});
			editor.getDoc().replaceRange(docstringFormatted, {ch: 0, line: docstringStartLineno}, {ch: 0, line: docstringStartLineno + oldNumOfLines});
			console.log(docstringStartLineno, newNumOfLines, docstringFormatted.split("\n"))

		});
	}
}

function functionFormatParse(docstring) {

	var returnVal = {
		desc: null,
		args: null,
		raises: null,
		returns: null
	}

	var docstringFields = docstring.split("\n\n");

	for (var i in docstringFields) {
		var field = docstringFields[i];
		if (field.indexOf("Args:") != -1) {
			var paramsIn = field.split("\n").slice(1,Infinity);
			var paramsOut = []
			for (var j in paramsIn) {
				var line = paramsIn[j];
				var isParamDecl = line.match(/[\s\S]*:[\s\S]*/);
				if (isParamDecl) {
				console.log(line)
					paramsOut.push(isParamDecl[0])
				}
				else {
				console.log(line)
					paramsOut[0] += " " + line.replace(/^\s+|\s+$/gm,'');
				}
			}

			var paramArray = []
			for (var k in paramsOut) {
				var paramTuple = paramsOut[k].split(":");
				var paramName = paramTuple[0].replace(/^\s+|\s+$/gm,'');
				var paramDesc = paramTuple[1].replace(/^\s+|\s+$/gm,'');
				paramArray.push([paramName, paramDesc]);
			}

			returnVal.args = paramArray;
		}
		else if (field.indexOf("Returns:") != -1) {
			returnVal.returns = field.split(":")[1].replace(/^\s+|\s+$/gm,'');
		}
		else if (field.indexOf("Raises:") != -1) {
			var errorsIn = field.split("\n").slice(1,Infinity);
			var errorsOut = []
			for (var j in errorsIn) {
				var line = errorsIn[j];
				var isErrorDecl = line.match(/[\s\S]*:[\s\S]*/);
				if (isErrorDecl) {
					errorsOut.unshift(isErrorDecl[0])
				}
				else {
					errorsOut[0] += " " + line.replace(/^\s+|\s+$/gm,'');
				}
			}

			var errorMap = {}
			for (var k in errorsOut) {
				var errorArray = errorsOut[k].split(":");
				var errorName = errorArray[0].replace(/^\s+|\s+$/gm,'');
				var errorDesc = errorArray[1].replace(/^\s+|\s+$/gm,'');
				errorMap[errorName] = errorDesc;
			}

			returnVal.raises = errorMap;
		}
		else {
			returnVal.desc = field.replace(/^\s+|\s+$/gm,'');
		}
	}

	return returnVal;
}

function updateLocalCodeText() {
	var localCodeText = editor.getDoc().getValue();
	var codeTextArray = localCodeText.split("\n");

	return codeTextArray;
}

function addDocstring(codeTextArray, declStartLineno, functionName, indentation) {
	var docstringStartLineno = declStartLineno + 1;
	var emptyDocstring = indentation + "\"\"\"\"\"\"\n";

	var functionsInFile = JSON.parse(sessionStorage.getItem("functionsInFile"));

	for (var i in functionsInFile) {
		var functionObj = functionsInFile[i];
		if (functionObj.functionName == functionName) {
			functionObj.docstringLength = 1;
		}
	}

	var docstringOffset = 1;
	sessionStorage.setItem("docstringOffset", JSON.stringify(docstringOffset));
	sessionStorage.setItem("functionsInFile", JSON.stringify(functionsInFile));
	editor.getDoc().replaceRange(emptyDocstring, {ch: 0, line: docstringStartLineno});
}

function getDeclLineno(codeTextArray, lineno) {

	while(true) {
		var testLine = codeTextArray[lineno];
		var isFuncDeclLine = testLine.search(functionRegex);
		var isClassDeclLine = testLine.search(classRegex);

		if (isFuncDeclLine != -1) {
			return [lineno, true];
		}
		else if (isClassDeclLine != -1) {
			return [lineno, false];
		}
		else {
			lineno++;
		}
	}
}

function getDocstringEndLineno(codeTextArray, lineno, docstringEndRegex) {

	for (var lineno = lineno + 1; lineno < codeTextArray.length; lineno++) {
		var testLine = codeTextArray[lineno];
		var matches = testLine.match(docstringEndRegex);
		if (matches && matches.length == 1) {
			return lineno;
		}
	}
}