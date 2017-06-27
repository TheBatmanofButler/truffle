function setDirectoryTreeLinkBackground() {
	var selectedLink = sessionStorage.getItem("selectedLink");
	if (selectedLink) {
		$("#" + selectedLink).css("font-weight", "bold");
	}
}

function setupCodeMirror() {
	var mode;
	var codeMirrorLineNo = parseInt(getScanLineNo(window.location.href)) - 1;
	var scanOn = JSON.parse(sessionStorage.getItem("scanOn"));

	if (filename.includes(".py")) {
		mode = "python";
	}
	else if (filename.includes(".js")) {
		mode = "javascript";
	}
	else if (filename.includes(".html")) {
		mode = "xml";
	}

	var editor = CodeMirror(document.getElementById("editor"), {
	  value: codeText,
	  lineNumbers: true,
	  mode: mode,
	  theme: "base16-dark"
	});

	if (scanOn) {
		editor.getDoc().addLineClass(codeMirrorLineNo, "gutter", "selected-line-gutter");
		editor.getDoc().addLineClass(codeMirrorLineNo, "background", "selected-line-background");
		editor.scrollIntoView(codeMirrorLineNo, 1);
	}
}

function setupFilePanel() {
	$(".file-panel li").click(function (e) {
		e.stopPropagation();
		$(this).children().not("i,a").animate({
			height: "toggle"
		})
		$(this).children("i").toggleClass("right");

		if ($(this).attr("id")) {
			sessionStorage.setItem("selectedLink", $(this).attr("id"));
		}

	});

	$(".files-option").click( function () {
		$(".file-panel").animate({width: "toggle"});
	});
}

$(".scan-option").click( function (e) {
	getScanPath();
});

function getScanLineNo(url) {
	var urlArray = url.split("."),
		lineno = urlArray[urlArray.length - 1];

	return lineno;
}

function getScanPathUrl(url) {
	var filenameEndIndex = url.indexOf(".py") + 3,
		filename = url.substring(0,filenameEndIndex),
		lineno = getScanLineNo(url),
		scanPathUrl = filename + "." + lineno;

	return scanPathUrl;
}

function getScanPath() {
	$.getJSON('/_get_scan_path', {}, function(data) {
		sessionStorage.setItem("scanPath", JSON.stringify(data));
		sessionStorage.setItem("scanIndex", JSON.stringify(0));
		runScan();
	});
}

function openScanPath() {
	var scanPath = JSON.parse(sessionStorage.getItem("scanPath"));
	var scanIndex = JSON.parse(sessionStorage.getItem("scanIndex"));
	var scanPathUrl = getScanPathUrl(scanPath[scanIndex]);

	sessionStorage.setItem("scanIndex", JSON.stringify(scanIndex + 1));
	window.open(scanPathUrl, "_self");
}

function runScan() {
	sessionStorage.setItem("scanOn", JSON.stringify(true));
	openScanPath();
}