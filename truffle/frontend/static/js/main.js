$(".file-panel li").click(function (e) {
	e.stopPropagation();
	$(this).children().not("i,a").animate({
		height: "toggle"
	})
	$(this).children("i").toggleClass("right");

});

console.log(codeText);

var editor = CodeMirror(document.getElementById("editor"), {
  value: codeText,
  lineNumbers: true,
  mode: "python"
});