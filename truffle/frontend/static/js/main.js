$(".file-panel li").click(function (e) {
	e.stopPropagation();
	$(this).children().not("i,a").animate({
		height: "toggle"
	})
	$(this).children("i").toggleClass("right");

});

$( document ).ready(function() {
	console.log(21)
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

});