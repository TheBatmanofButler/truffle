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

	var editor = CodeMirror(document.getElementById("editor"), {
	  value: codeText,
	  lineNumbers: true,
	  mode: mode,
	  theme: "base16-dark"
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

	hyperlinkOverlay(editor);

	if (scanOn) {
		var lineno = JSON.parse(sessionStorage.getItem("lineno"));
		editor.getDoc().addLineClass(lineno, "gutter", "selected-line-gutter");
		editor.getDoc().addLineClass(lineno, "background", "selected-line-background");
		editor.scrollIntoView(lineno - 1, 1);
	}
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
	var nextLineno = linenoPath.shift();
	
	sessionStorage.setItem("linenoPath", JSON.stringify(linenoPath));
	sessionStorage.setItem("lineno", JSON.stringify(nextLineno));

	var nextPage = window.location.origin + nextLocation + "." + nextLineno;

	goToPage(nextPage)
}

function nextScanPath() {
	var linenoPath = JSON.parse(sessionStorage.getItem("linenoPath"));

	if (linenoPath) {
		var nextLineno = linenoPath.shift();
		
		sessionStorage.setItem("linenoPath", JSON.stringify(linenoPath));
		sessionStorage.setItem("lineno", JSON.stringify(nextLineno));
		
		editor.scrollIntoView(nextLineno - 1, 1);
		console.log(nextLineno);
	}
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
		$('#editor').append('<div class="search-result-file">' + hit + '<br></div>')
		$('#editor').append('<div class="search-result">' + searchResults[
			hit]['highlight'] + '<br></div>')
		console.log(hit)
	}
}

function loadCallGraph() {
	window.open(window.location.origin + '/_flow_tree')
}
