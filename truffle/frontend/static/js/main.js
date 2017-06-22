$(".file-panel li").click(function (e) {
	e.stopPropagation();
	$(this).children().not("i,a").animate({
		height: "toggle"
	})
	$(this).children("i").toggleClass("right");

});

var editor = CodeMirror(document.getElementById("editor"), {
  value: "",
  lineNumbers: true,
  mode: "python"
});

$('a').click( function (event){ 
	event.preventDefault()

	var link = this;

	$.ajax(this.href).done(function (codeText) {
		var filenameIndex = link.href.indexOf("get_code/") + 8;
		var filename = link.href.substring(filenameIndex);
		$(".code-text-path").text(filename);
		editor.setValue(codeText)
	});
});