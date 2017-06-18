$(".file-tree li").click(function (e) {
	e.stopPropagation();
	$(this).children().not("i,a").animate({
		height: "toggle"
	})
	$(this).children("i").toggleClass("right");

});