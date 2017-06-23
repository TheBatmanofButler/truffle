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
	  mode: mode
	});
}

function bodyStyling() {
    var boxDOM = $(".scan-panel");

    if (boxDOM.css("display") != "none") {
	    $(".code-panel, .button-comment-panel, .options-box").css("opacity", 1);
	}
	else {
		$(".code-panel, .button-comment-panel, .options-box").css("opacity", 0.5);
	}
}

function enableScanButton() {
	console.log("enable");
	var scanButton = $(".start-scan-option");
	scanButton.click( function (e) {
		bodyStyling();
		$(".scan-panel").show();
		disableScanButton();
		return false;
	});
	scanButton.css("cursor", "pointer");
}

function disableScanButton() {
	console.log("disable");
	var scanButton = $(".start-scan-option");
	scanButton.unbind();
	scanButton.css("cursor", "default");
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
}