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

$( document ).ready(function() {
	var mode;

	if (filename.includes(".py")) {
		mode = "python";
		console.log("py")
	}
	else if (filename.includes(".js")) {
		mode = "javascript";
		console.log("js")
	}
	else if (filename.includes(".html")) {
		mode = "xml";
		console.log("xml")
	}

	var editor = CodeMirror(document.getElementById("editor"), {
	  value: codeText,
	  lineNumbers: true,
	  mode: mode
	});

	if (sessionStorage.selectedLink) {
		$("#" + sessionStorage.selectedLink).css("font-weight", "bold");
	}

});