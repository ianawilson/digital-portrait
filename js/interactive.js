$(document).ready(interactiveInit)

// var borderColor = '204, 0, 51,'
var borderColor = '230, 32, 32,'
var borderColorOn = $.Color('rgb(' + borderColor +' 1)');
var borderColorOff = $.Color('rgb(' + borderColor +' 0)');

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
	
	// set up the friend filter
	$('#friend-filter').change(function() {
		var filter = $(this).val();
		list = $("#friend-list");
		instructions = $("#friend-instructions");
		if (filter) {
			instructions.slideDown();
			list.find("li:not(:Contains(" + filter + "))").slideUp();
			// only get the ones with images
			list.find("li:Contains(" + filter + ")").children('img').parents().not('.used').slideDown();
		} else {
			instructions.slideUp();
			list.find("li").slideUp();
		}
	});
	$('#friend-filter').keyup(function() {
		$(this).change();
	});
	
	initInstructions();
	
	$('.instruct').hover(function() {
		$(this).addClass('mouseover');
	}, function() {
		$(this).removeClass('mouseover');
	});
}

// defining custom Contains
// taken from http://kilianvalkhof.com/2010/javascript/how-to-build-a-fast-simple-list-filter-with-jquery/
jQuery.expr[':'].Contains = function(a,i,m){
    return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
};

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
	$("#load-mosaic").hide(100, function() {
		$("#mosaic-loading").show(100, function() {
			dim = findIdealDimensions(profileImg, photos.length);
			// log(dim);
			makeAndDisplayMosaic(dim[0], dim[1]);
			$("#mosaic-loading").hide(100);
			$("#load-mosaic").show(100);
		});
	});
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
function lookHere() {
	lastLook = Date.now();
	// we don't want to animate if the last one was very recent (and we're looking for it)
	if (! checkingForLastLook) {
		$("#stats").animate({'background-color': $.Color('rgba(250, 248, 100, 0.8)')}, 150);
		checkingForLastLook = true;
		checkForLastLook();
	}
}

function checkForLastLook() {
	if (Date.now() - lastLook > 1000) {
		checkingForLastLook = false;
		console.log('fade out');
		$("#stats").animate(
			{'background-color': $.Color('rgba(255, 255, 255, 0)')},
			300
		);
	} else {
		console.log('check again in 500ms');
		setTimeout(checkForLastLook, 500);
	}
}

function initInstructions() {
	// set up instruction help
	instructionPairs = [
		['instruct-stats', '#stats'],
		['instruct-friends', '#friends'],
		['instruct-load-mosaic', '#load-mosaic'],
		['instruct-toggle-original', '#toggle-original']
	];
	instructables = [];
	for (i in instructionPairs) {
		instructables.push(instructionPairs[i][1]);
	}
	
	// click handler
	$('.instruct').click(function(e) {
		// if the overlay is open, close it, remove aboveOverlay class
		if ($("#overlay").is(":visible")) {
			$('#overlay').fadeOut(150);
			for (i in instructables) {
				$(instructables[i]).removeClass('aboveOverlay').removeClass('highlighted');
			}
			
		} else {
			$(this).addClass('aboveOverlay');
			$('#overlay').fadeIn(150);
			for (i in instructionPairs) {
				if ($(this).hasClass(instructionPairs[i][0])) {
					$(instructionPairs[i][1]).addClass('aboveOverlay').addClass('highlighted');
				}
			}
		}
	});
	
	// use hover handler, since it deals with children elements better
	// and use no hover over function
	$('.instruct').hover(function() {}, function() {
		$('#overlay').fadeOut(150);
		$(this).removeClass('aboveOverlay');
		for (i in instructables) {
			$(instructables[i]).removeClass('aboveOverlay').removeClass('highlighted');
		}
	});
}


function readyForMosaic() {
	if (profileReady && photosReady) {
		$("#photos-loading").hide();
		$("#load-mosaic").show();
	}
}