$(".file-panel li").click(function (e) {
	e.stopPropagation();
	$(this).children().not("i,a").animate({
		height: "toggle"
	})
	$(this).children("i").toggleClass("right");

});

var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    mode:  "python"
});

$('a').click( function (event){ 
     console.log(this.href);
     $(".flow-tree").animate({"height": 0});
     event.preventDefault()
});