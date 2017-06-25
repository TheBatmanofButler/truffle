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
    var scanPanel = $(".scan-panel"),
    	categoryPanel = $(".add-category-panel");

    if ((scanPanel.css("display") != "none") || (categoryPanel.css("display") != "none")) {
	    $(".code-panel, .button-comment-panel, .options-box").css("opacity", 1);
	}
	else {
		$(".code-panel, .button-comment-panel, .options-box").css("opacity", 0.5);
	}
}

function enableScanButton() {
	var scanButton = $(".start-scan-option");
	resetScanAnimation();
	resetFlowAnimation();
	scanButton.click( function (e) {
		setupScanAnimation();
		setupFlowAnimation();
		bodyStyling();
		$(".scan-panel").show();
		disableScanButton();
		// disableAddCategoryButton();
		return false;
	});
	scanButton.css("cursor", "pointer");
}

function enableAddCategoryButton() {
	console.log("enable");
	var categoryButton = $(".add-category-option");
	categoryButton.click( function (e) {
		bodyStyling();
		$(".add-category-panel").show();
		// disableScanButton();
		disableAddCategoryButton();
		return false;
	});
	categoryButton.css("cursor", "pointer");
}

function disableScanButton() {
	var scanButton = $(".start-scan-option");
	scanButton.unbind();
	scanButton.css("cursor", "default");
}

function disableAddCategoryButton() {
	console.log("disable");
	var categoryButton = $(".add-category-option");
	categoryButton.unbind();
	categoryButton.css("cursor", "default");
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