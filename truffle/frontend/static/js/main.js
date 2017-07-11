function setDirectoryTreeLinkBackground() {
	var selectedLink = JSON.parse(sessionStorage.getItem("selectedLink"));
	if (selectedLink) {
		$("#" + selectedLink).css("font-weight", "bold");

		var codeIsChanged = JSON.parse(sessionStorage.getItem("codeIsChanged"));
		var selectedFilename = sessionStorage.getItem("selectedFilename");
		if (codeIsChanged) {
			$("#" + selectedLink).text( function() {
				return selectedFilename + "*";
			});
			$("#" + selectedLink).css("font-style", "italic");
		}
		else {
			$("#" + selectedLink).text(selectedFilename);
			$("#" + selectedLink).css("font-style", "normal");
		}
	}
}

function codeChange(editor, codeIsChanged) {
	sessionStorage.setItem("codeIsChanged", JSON.stringify(codeIsChanged));
	setDirectoryTreeLinkBackground();
}

function setupCodeMirror() {
	var mode;
	var scanOn = JSON.parse(sessionStorage.getItem("scanOn"));
	var fileName = JSON.parse(sessionStorage.getItem("fileName"));
	var codeText = JSON.parse(sessionStorage.getItem("codeText"));

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
		console.log(instance.getValue())
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

	if (scanOn) {
		editor.setOption("readOnly", true);
		editor.setOption("cursorBlinkRate", -1);

		moveToNewLine();
	}
}

function removeLineStyling() {
	var currentFunction = JSON.parse(sessionStorage.getItem("currentFunction"))
	var currentLineno = currentFunction[0] - 1;
	editor.getDoc().removeLineClass(currentLineno, "gutter", "selected-line-gutter");
	editor.getDoc().removeLineClass(currentLineno, "background", "selected-line-background");
}

function moveToNewLine() {
	var currentFunction = JSON.parse(sessionStorage.getItem("currentFunction"))
	var currentLineno = currentFunction[0] - 1;
	editor.getDoc().addLineClass(currentLineno, "gutter", "selected-line-gutter");
	editor.getDoc().addLineClass(currentLineno, "background", "selected-line-background");
	lineScroll(currentLineno, editor);
}

function lineScroll(i) { 
	var t = editor.charCoords({line: i, ch: 0}, "local").top; 
	var middleHeight = editor.getScrollerElement().offsetHeight / 2; 
	editor.scrollTo(null, t - middleHeight - 5); 
} 

function setupFilePanel() {
	$(".file-panel li").click(function (e) {
		e.stopPropagation();
		$(this).children().not("i,a, .directory-name").animate({
			height: "toggle"
		})
		$(this).children("i").toggleClass("right");

		if ($(this).attr("id")) {
			var selectedLink = $(this).attr("id")
			sessionStorage.setItem("selectedLink", JSON.stringify(selectedLink));
			console.log($.trim($("#" + selectedLink).text()))
			sessionStorage.setItem("selectedFilename", $.trim($("#" + selectedLink).text()));
		}

	});

	$(".files-option").click( function () {
		$(".file-panel").animate({width: "toggle"});
	});
}

function getScanPathUrl(url) {
	var filenameEndIndex = url.indexOf(".py") + 3,
		filename = url.substring(0,filenameEndIndex),
		scanPathUrl = filename + "." + lineno;

	return scanPathUrl;
}

function getScanData() {
	$.getJSON('/_get_scan_data', function(data) {
		console.log(data);
		sessionStorage.setItem("scanFunctions", JSON.stringify(data.scanFunctions));
		sessionStorage.setItem("scanPath", JSON.stringify(data.scanPath));
		openScanPath();
	});
}

function postSavedFile(filename, codeText) {
	$.post('/_post_saved_file', {"filename": filename, "code_text": codeText}, function(response) {
		sessionStorage.setItem("codeIsChanged", JSON.stringify(false));
		setDirectoryTreeLinkBackground();
		alert("File Saved")
	});
}

function openScanPath() {

	var scanPath = JSON.parse(sessionStorage.getItem("scanPath"));
	var scanFunctions = JSON.parse(sessionStorage.getItem("scanFunctions"));
	var fileName = JSON.parse(sessionStorage.getItem("fileName"));

	if (!fileName) {
		var nextLocation = scanPath[0];
	}
	else {
		var nextLocation = fileName;
	}

	var functionPath = scanFunctions[pathToKey(nextLocation)];
	var reversefunctionPath = [];

	if (!functionPath.length) {
		sessionStorage.setItem("functionPath", JSON.stringify(functionPath));
		nextScanPath()
		return;
	}
	var nextFunction = functionPath.shift();
	var nextLineno = nextFunction[0];
	
	sessionStorage.setItem("functionPath", JSON.stringify(functionPath));
	sessionStorage.setItem("reversefunctionPath", JSON.stringify(reversefunctionPath));
	sessionStorage.setItem("currentFunction", JSON.stringify(nextFunction));

	var nextPage = window.location.origin + nextLocation + "." + nextLineno;

	goToPage(nextPage)
}

function nextScanPath() {

	var functionPath = JSON.parse(sessionStorage.getItem("functionPath"));
	var currentFunction = JSON.parse(sessionStorage.getItem("currentFunction"));
	var reversefunctionPath = JSON.parse(sessionStorage.getItem("reversefunctionPath"));

	if (functionPath.length) {
		reversefunctionPath.push(currentFunction);
		var fileName = JSON.parse(sessionStorage.getItem("fileName"));

		var nextFunction = functionPath.shift();
		var nextLineno = nextFunction[0];
		
		removeLineStyling();
		
		sessionStorage.setItem("functionPath", JSON.stringify(functionPath));
		sessionStorage.setItem("reversefunctionPath", JSON.stringify(reversefunctionPath));
		sessionStorage.setItem("currentFunction", JSON.stringify(nextFunction));

		var nextPage = window.location.origin + fileName + "." + nextLineno;
		window.history.pushState("", "", nextPage);
		moveToNewLine();
	}
	else {
		reversefunctionPath = [];
		var scanFunctions = JSON.parse(sessionStorage.getItem("scanFunctions"));
		var fileName = getNextFileName()
		functionPath = scanFunctions[pathToKey(fileName)]
		sessionStorage.setItem("functionPath", JSON.stringify(functionPath));
		sessionStorage.setItem("reversefunctionPath", JSON.stringify(reversefunctionPath));

		if (!functionPath) {
			alert()
		}

		var nextFunction = functionPath.shift();
		var nextLineno = nextFunction[0];
		
		sessionStorage.setItem("currentFunction", JSON.stringify(nextFunction));
		
		var nextPage = window.location.origin + fileName + "." + nextLineno;
		goToPage(nextPage)
	}
}

function getNextFileName() {
	var fileName = JSON.parse(sessionStorage.getItem("fileName"));
	var scanPath = JSON.parse(sessionStorage.getItem("scanPath"));

	if (!scanPath.length) {
		alert("All files scanned.")
		endScan();
		return;
	}

	var scanIndex = scanPath.indexOf(fileName);
	if (scanIndex == scanPath.length - 1) {
		scanIndex = -1;
	}

	return scanPath[scanIndex + 1]	
}

function previousScanPath() {

	var reversefunctionPath = JSON.parse(sessionStorage.getItem("reversefunctionPath"));
	var currentFunction = JSON.parse(sessionStorage.getItem("currentFunction"));
	var functionPath = JSON.parse(sessionStorage.getItem("functionPath"));

	if (reversefunctionPath.length) {
		functionPath.unshift(currentFunction);
		var fileName = JSON.parse(sessionStorage.getItem("fileName"));

		var previousFunction = reversefunctionPath.pop();
		var previousLineno = previousFunction[0];
		
		removeLineStyling();
		
		sessionStorage.setItem("reversefunctionPath", JSON.stringify(reversefunctionPath));
		sessionStorage.setItem("currentFunction", JSON.stringify(previousFunction));
		sessionStorage.setItem("functionPath", JSON.stringify(functionPath));

		var previousPage = window.location.origin + fileName + "." + previousLineno;
		window.history.pushState("", "", previousPage);
		moveToNewLine();
	}
	else {
		functionPath = [];
		var scanFunctions = JSON.parse(sessionStorage.getItem("scanFunctions"));
		var fileName = getPreviousFileName()
		reversefunctionPath = scanFunctions[pathToKey(fileName)]

		var previousFunction = reversefunctionPath.pop();
		var previousLineno = previousFunction[0];
		
		sessionStorage.setItem("reversefunctionPath", JSON.stringify(reversefunctionPath));
		sessionStorage.setItem("currentFunction", JSON.stringify(previousFunction));
		sessionStorage.setItem("functionPath", JSON.stringify(functionPath));
		
		var previousPage = window.location.origin + fileName + "." + previousLineno;
		goToPage(previousPage)
	}
}

function getPreviousFileName() {
	var fileName = JSON.parse(sessionStorage.getItem("fileName"));
	var scanPath = JSON.parse(sessionStorage.getItem("scanPath"));

	if (!scanPath.length) {
		alert("All files scanned.")
		endScan();
		return;
	}

	var scanIndex = scanPath.indexOf(fileName);
	if (scanIndex == 0) {
		scanIndex = scanPath.length;
	}

	return scanPath[scanIndex - 1]	
}

function pathToKey(filepath) {
	return filepath.split("/").join(".").slice(0, -3)
}

function goToPage(url) {
	window.open(url, "_self");
}

function runScan() {
	sessionStorage.setItem("scanOn", JSON.stringify(true));
	getScanData();
}

function endScan() {
	$(".one-line").hide();
	$(".bottom-box").animate({height: "0"}, function () {
		alert("Scan ended.")
		sessionStorage.setItem("scanOn", JSON.stringify(false));
		var fileName = JSON.parse(sessionStorage.getItem("fileName"));
		var nextPage = window.location.origin + fileName;
		goToPage(nextPage);
	});
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
