$(".file-tree li").click(function (e) {
	e.preventDefault();
	e.stopPropagation();
	console.log($(this).children(), $(this).text())
	$(this).children().animate({
		height: "toggle"
	})
});