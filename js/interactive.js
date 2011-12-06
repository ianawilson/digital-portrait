$(document).ready(interactiveInit)

function interactiveInit() {
	$("button").mouseover(function() {
		$(this).addClass("mouseover");
	});
	$("button").mouseout(function() {
		$(this).removeClass("mouseover");
	});
}

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

function newIdealMosaic() {
	dim = findIdealDimensions(profileImg, photos.length)
	log(dim)
	makeAndDisplayMosaic(dim[0], dim[1]);
}

function showHideOriginal() {
	$("#original").fadeToggle(300);
}