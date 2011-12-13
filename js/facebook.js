$(document).ready(fbInit);

var friends = new Array(0);
var totalFriends = 0;
var fetchedFriends = 0;

var lookHereTimeout;
var lastLook;
var checkingForLastLook = false;

var photos = new Array(0);
var totalPhotos = 0;

var photosOfMeOffset = 0;
var fetchCount = {};
var profileReady = false;
var photosReady = false;

var profileImg;
var profileMat;

var processQueue = [];

function fbInit() {
    FB.init({ 
        appId:'244918665570373', cookie:true, 
        status:true, xfbml:true, oauth:true
    });
    
	// set up login/out buttons
	$("#login-button").click(login);
	$("#logout-button").click(logout);
	
	log("Application initialized.")
	
	start();
	
	runProcessQueue();
}

function login() {
	FB.login(
		function (response) {
			if (response.authResponse) {
				start();
			} else {
				// they didn't authenticate
			}
		},
		{'scope': 'user_photos,friends_photos'}
	);
	start();
}

function logout() {
	FB.logout(
		function (response) {
			window.location.reload();
		}
	);
}

function updateLogin(authenticated) {
	if (authenticated) {
		FB.api('/me', function(response) {
			$("#login").hide();
			$("#greeting").html("Logged in as " + response['name']);
			$("#logout").fadeIn(300);
			
			setTimeout('$("#continue").fadeIn(300);', 600);
		});
	} else {
		$("#login").fadeIn(300);
		$("#continue").hide();
	}
}

function start() {
	log('Getting Facebook login status.');
	FB.getLoginStatus(function(response) {
        if (response.authResponse) {
			log("User authenticated to Facebook.");
		
			// update login box, start fetching profile photo
			updateLogin(true);
			fetchProfilePhoto();
			fetchPhotosOfMe();
			fetchFriends();
		} else {
			updateLogin(false);
        }
	});
}


function processPhoto(picture, id, trialNum) {
	if (trialNum == null) {
		trialNum = 0;
	}
	$.getImageData({url:picture,
		success: function (image) {
			photos.push(image);
			log('Fetched and processed photo ' + ++fetchCount[id] + '.');
			$("#stats-photos-" + id).html(fetchCount[id]);
			$("#stats-photos").html(photos.length);
			lookHere("#stats");
		},
		error: function (xhr, text_status) {
			if (trialNum > 5) {
				log('Failed to process picture of ' + id + ' after 5 tries.');
			} else {
				// console.log(text_status);
				setTimeout(function() {
					processPhoto(picture, id, trialNum+1);
				}, 500);
			}
		}
	});
}


function runProcessQueue() {
	if (processQueue.length > 0) {
		item = processQueue.shift();
		picture = item[0];
		id = item[1];

		processPhoto(picture, id)
	}
	
	setTimeout(runProcessQueue, 200);
}


function fetchProfilePhoto() {
	log('Fetching profile photo ...');
	FB.api('/me/albums', function(response) {
	    for (album in response.data) {
			if (response.data[album].type == 'profile') {
				FB.api('/' + response.data[album].id + '/photos', function(response){
					profile = response.data[0].source;
					$.getImageData({url:profile,
						success: function (image) {
							profileImg = image;
							original = $("#original");
							original.hide();
							original.append(profileImg);
							$("#profile-loading").hide();
							original.css('margin-left', -1 * Math.round(profileImg.width / 2));
							original.fadeIn(300);
							log('Finished fetching profile picture.');
							
							profileReady = true;
							readyForMosaic();
							
							// set content height and width based on picture
							// $("#content").height(profileImg.height + 10);
							// $("#content").width(profileImg.width + 10);
						},
						error: function (xhr, text_status) {
							log('Failed to process profile photo. Trying again ...');
							fetchProfilePhoto();
						}
					});
				}); // end of getting photos from album
			}
	    }
	}); // end of getting my albums
}

function fetchPhotosOfMe() {
	log('Fetching photos of the user ...');
	fetchCount['me'] = 0;
	FB.api('/me/photos', {'offset': photosOfMeOffset, 'limit': 500}, function(response) {
		log('Fetched ' + response.data.length + ' additional photos.');
		totalPhotos += response.data.length;
		photosOfMeOffset += response.data.length;
		for (pic in response.data) {
			picture = response.data[pic].source;
			processQueue.push([picture, 'me']);
			// processPhoto(picture, 'me');
			
			photosReady = true;
			readyForMosaic();
		}
    }); // end of getting 
}

function fetchMyPhotos() {
	log('Fetching photos owned by the user ...');
	FB.api('/me/albums', {'limit': 20}, function (response) {
		for (album in response.data) {
			FB.api('/' + response.data[album]['id'] + '/photos', {'limit': 500}, function (response) {
				for (pic in response.data) {
					picture = response.data[pic].picture;
					processPhoto(picture);
				}
			});
		}
	});
}

function fetchFriends() {
	log('Fetching users\' friends ...');
	FB.api('/me/friends', function(response) {
		totalFriends += response.data.length;
		for (index in response.data) {
			friends.push(response.data[index]);
		}
		friends.sort(friendSort);
		for (index in friends) {
			// entry = $("<li class='friend' id='" + friends[index]['id'] + "'><img class='friend-profile' id='img-" + friends[index]['id'] + "' />" + friends[index]['name'] + "</li>");
			entry = $("<li class='friend' id='" + friends[index]['id'] + "'> " + friends[index]['name'] + "</li>");
			entry.click(function() {
				// add the used class to make it so we don't select them again
				$(this).addClass('used');
				
				id = $(this).attr('id');
				name = $(this).text()
				filterField = $("#friend-filter");
				filterField.hide();
				filterField.val('');
				filterField.trigger('change');
				filterField.blur();
				$("#friend-loading").show();
				fetchPhotosOfFriend(id, name);
			});
			$("#friend-list").append(entry);
			FB.api('/' + friends[index]['id'] + '/albums/', function(response) {
				for (albumIndex in response.data) {
					if (response.data[albumIndex]['type'] == 'profile') {
						album = response.data[albumIndex];
						FB.api('/' + album['id'] + '/photos', {'limit': 1}, function(response) {
							// only try to get it if they have a profile pic
							if (response.data) {
								fetchedFriends++;
								$("#stats-friends").html(fetchedFriends + " friend(s) loaded");
								lookHere("#stats");
								id = response.data[0]['from']['id'];
								log('Fetched friend with id ' + id);
								img = $('<img src="' + response.data[0]['picture'] + '" class="friend-profile" />');
								$('#' + id).prepend(img);
							
								// show the search field, since it's been hidden since the start
								$("#friend-loading").hide();
								$("#friend-filter").show();
							}
						});
					}
				}
			});
		}
	});
}
function friendSort(a, b) {
	return a['name'].localeCompare(b['name']);
}

function fetchPhotosOfFriend(friendID, friendName) {
	console.log(friendID);
	fetchCount['' + friendID] = 0;
	log('Fetching photos of friend ' + friendID + ' ...');
	FB.api('/' + friendID + '/photos', {'limit': 250}, function(response) {
		log('Fetched ' + response.data.length + ' additional photos.');
		$("#friend-loading").hide();
		$("#friend-filter").show();
		totalPhotos += response.data.length;
		friendStats = $("<div><span id='stats-photos-" + friendID + "'>0</span> photo(s) of " + friendName + " loaded</div>");
		$("#stats").append(friendStats);
		for (pic in response.data) {
			picture = response.data[pic].source;
			processQueue.push([picture, friendID]);
			// processPhoto(picture, friendID);
		}
    }); // end of getting
}

function displayAllPhotos() {
	$("#test").html("");
	for (photo in photos) {
		$("#test").append(photos[photo]);
		// $("#test").append("<img src='" + photos[photo] + "' />")
	}
}