$(".file-tree li").click(function (e) {
	e.preventDefault();
	e.stopPropagation();
	$(this).children().not("i").animate({
		height: "toggle"
	})
	$(this).children("i").toggleClass("right");
});