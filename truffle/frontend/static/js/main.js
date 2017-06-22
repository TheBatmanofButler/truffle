$(".file-panel li").click(function (e) {
	e.stopPropagation();
	$(this).children().not("i,a").animate({
		height: "toggle"
	})
	$(this).children("i").toggleClass("right");

});

$( document ).ready(function() {

	var mode;

	if (filename.includes(".py")) {
		mode = "python";
	}
	else if (filename.includes(".js")) {
		mode = "javascript";
	}
	else if (filename.includes(".html")) {
		mode = "html";
	}

	var editor = CodeMirror(document.getElementById("editor"), {
	  value: codeText,
	  lineNumbers: true,
	  mode: mode
	});

});