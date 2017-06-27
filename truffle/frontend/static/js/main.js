function setDirectoryTreeLinkBackground() {
	if (sessionStorage.selectedLink) {
		$("#" + sessionStorage.selectedLink).css("font-weight", "bold");
	}
}

function setupCodeMirror() {
	var mode;

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
}

function setupFilePanel() {
	$(".file-panel li").click(function (e) {
		e.stopPropagation();
		$(this).children().not("i,a").animate({
			height: "toggle"
		})
		$(this).children("i").toggleClass("right");

		if ($(this).attr("id")) {
			sessionStorage.selectedLink = $(this).attr("id")
		}

	});

	$(".files-option").click( function () {
		$(".file-panel").animate({width: "toggle"});
	});
}

$(".scan-option").click( function (e) {
	scanStart();
});

function scanStart() {
	$.getJSON('/_get_scan_path', {}, function(data) {
		console.log(data);
	});
}