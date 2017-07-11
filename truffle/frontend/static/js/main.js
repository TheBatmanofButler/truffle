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
	var lineno = JSON.parse(sessionStorage.getItem("lineno")) - 1;
	editor.getDoc().removeLineClass(lineno, "gutter", "selected-line-gutter");
	editor.getDoc().removeLineClass(lineno, "background", "selected-line-background");
}

function moveToNewLine() {
	var lineno = JSON.parse(sessionStorage.getItem("lineno")) - 1;
	editor.getDoc().addLineClass(lineno, "gutter", "selected-line-gutter");
	editor.getDoc().addLineClass(lineno, "background", "selected-line-background");
	lineScroll(lineno, editor);
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

	var linenoPath = scanFunctions[pathToKey(nextLocation)]
	if (!linenoPath.length) {
		sessionStorage.setItem("linenoPath", JSON.stringify(linenoPath));
		nextScanPath()
		return;
	}
	var nextLineno = linenoPath.shift();
	
	sessionStorage.setItem("linenoPath", JSON.stringify(linenoPath));
	sessionStorage.setItem("lineno", JSON.stringify(nextLineno));

	var nextPage = window.location.origin + nextLocation + "." + nextLineno;

	goToPage(nextPage)
}

function nextScanPath() {

	var linenoPath = JSON.parse(sessionStorage.getItem("linenoPath"));

	if (linenoPath.length) {
		var fileName = JSON.parse(sessionStorage.getItem("fileName"));

		var nextLineno = linenoPath.shift();
		
		removeLineStyling();
		
		sessionStorage.setItem("linenoPath", JSON.stringify(linenoPath));
		sessionStorage.setItem("lineno", JSON.stringify(nextLineno));

		var nextPage = window.location.origin + fileName + "." + nextLineno;
		window.history.pushState("", "", nextPage);
		moveToNewLine();
	}
	else {
		var scanFunctions = JSON.parse(sessionStorage.getItem("scanFunctions"));
		var fileName = getNextFileName()
		linenoPath = scanFunctions[pathToKey(fileName)]

		var nextLineno = linenoPath.shift();
		
		sessionStorage.setItem("linenoPath", JSON.stringify(linenoPath));
		sessionStorage.setItem("lineno", JSON.stringify(nextLineno));
		
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
		sessionStorage.setItem("scanOn", JSON.stringify(false));
		var fileName = JSON.parse(sessionStorage.getItem("fileName"));
		var nextPage = window.location.origin + fileName;
		goToPage(nextPage);
	});
}

function runSearch(query) {
	window.open(window.location.origin + '/_run_search?query=' + query);
}

function loadSearchResults() {
	console.log(searchResults);
	for (hit in searchResults) {
		hit_href = window.location.origin + hit
		$('#editor').append(
			'<a class="search-result-link" href="' + hit_href + '">' +
			'<div class="search-result-file">' + hit + '<br></div>' +
			'<div class="search-result-highlight">' + searchResults[hit][
				'highlight'] + '<br></div>' +
			'<a>');
		console.log(hit)
	}
}

function loadCallGraph() {
	window.open(window.location.origin + '/_flow_tree')
}
