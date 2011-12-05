function log(message) {
	console.log(message);
	
	// pretty log message on screen
	atBottom = ($("#log").scrollTop() == $("#log").prop("scrollHeight") - $("#log").height())
	$("#log").append(message + "<br />");
	
	// if we were at the bottom before, keep it at bottom
	if (atBottom) {
		$("#log").scrollTop($("#log").prop("scrollHeight"))
	}
}

function newMosaic() {
	rows = $("#rows").val();
	cols = $("#cols").val();
	makeAndDisplayMosaic(rows, cols);
}

function showHideOriginal() {
	$("#original").fadeToggle(300);
}