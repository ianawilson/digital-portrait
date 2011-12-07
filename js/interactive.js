$(document).ready(interactiveInit)

function interactiveInit() {
	// set all button mouseover properties
	$("button").mouseover(function() {
		$(this).addClass("mouseover");
	});
	$("button").mouseout(function() {
		$(this).removeClass("mouseover");
	});
	
	// set all input boxes default text
	$("input").focus(function (srcc) {
		if ($(this).hasClass("default-text")) {
			$(this).removeClass("default-text");
			$(this).val("");
		}
	});
	$("input").blur(function (srcc) {
		if ($(this).val() == "") {
			$(this).addClass("default-text")
			$(this).val($(this)[0].title);
		}
	});
	$("input").blur();
}

function log(message) {
	console.log(message);
	
	// pretty log message on screen
	$("#log").append(message + "<br />");
	
	$("#log").scrollTop($("#log").prop("scrollHeight"))
}

function newMosaic() {
	rows = $("#rows").val();
	cols = $("#cols").val();
	makeAndDisplayMosaic(rows, cols);
}
function newIdealMosaic() {
	dim = findIdealDimensions(profileImg, photos.length);
	log(dim);
	makeAndDisplayMosaic(dim[0], dim[1]);
}
function showHideOriginal() {
	$("#original").fadeToggle(300);
}

function fadeToApp() {
	$("#welcome").fadeOut(300);
}
function fadeToWelcome() {
	$("#welcome").fadeIn(300);
}