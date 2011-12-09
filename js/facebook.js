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
var fetchCount = 0;

var profileImg;
var profileMat;

var name;

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
			start();
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
	FB.getLoginStatus(function(response) {
        if (response.authResponse) {
			log("User authenticated to Facebook.")
		
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


function processPhoto(picture) {
	$.getImageData({url:picture,
		success: function (image) {
			photos.push(image);
			log('Fetched and processed photo ' + ++fetchCount + '.');
			$("#photo-stats").html(photos.length + " of " + totalPhotos + " photo(s) loaded")
			lookHere("#stats");
		},
		error: function (xhr, text_status) {
			
		}
	});
}


function fetchProfilePhoto() {
	log('Fetching profile picture ...');
	FB.api('/me/albums', function(response) {
	    for (album in response.data) {
			if (response.data[album].type == 'profile') {
				FB.api('/' + response.data[album].id + '/photos', function(response){
					profile = response.data[0].source;
					$.getImageData({url:profile,
						success: function (image) {
							profileImg = image;
							$("#original").hide();
							$("#original").append(profileImg);
							$("#profile-loading").hide();
							$("#original").fadeIn(300);
							log('Finished fetching profile picture.');
							
							// set content height and width based on picture
							$("#content").height(profileImg.height + 10);
							$("#content").width(profileImg.width + 10);
						},
						error: function (xhr, text_status) {
							
						}
					});
				}); // end of getting photos from album
			}
	    }
	}); // end of getting my albums
}

function fetchPhotosOfMe() {
	log('Fetching photos of the user ...');
	FB.api('/me/photos', {'offset': photosOfMeOffset, 'limit': 500}, function(response) {
		log('Fetched ' + response.data.length + ' additional photos.');
		totalPhotos += response.data.length;
		photosOfMeOffset += response.data.length;
		for (pic in response.data) {
			picture = response.data[pic].picture;
			processPhoto(picture);
			
			// show build mosaic button as soon as we have some photos
			$("#photos-loading").hide();
			$("#ideal-mosaic-control").show();
		}
    }); // end of getting 
}

function fetchMyPhotos() {
	log('Fetching photos owned by the user ...');
	FB.api('/me/albums', {'limit': 20}, function (response) {
		for (album in response.data) {
			FB.api('/' + response.data[album]['id'] + '/photos', {'limit': 250}, function (response) {
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
			entry = $("<li class='friend' id='" + friends[index]['id'] + "'>" + friends[index]['name'] + "</li>");
			entry.click(function() {
				id = $(this).attr('id');
				filterField = $("#friend-filter");
				filterField.val('');
				filterField.change();
				filterField.hide();
				$("#friend-loading").show();
				fetchPhotosOfFriend(id);
			});
			$("#friend-list").append(entry);
			FB.api('/' + friends[index]['id'] + '/albums/', function(response) {
				for (albumIndex in response.data) {
					if (response.data[albumIndex]['type'] == 'profile') {
						album = response.data[albumIndex];
						FB.api('/' + album['id'] + '/photos', {'limit': 1}, function(response) {
							fetchedFriends++;
							$("#friend-stats").html(fetchedFriends + " of " + totalFriends + " friend(s) loaded");
							lookHere("#stats");
							id = response.data[0]['from']['id'];
							log('Fetched profile of friend with id ' + id);
							img = $('<img src="' + response.data[0]['picture'] + '" class="friend-profile" />');
							$('#' + id).prepend(img);
							
							// show the search field, since it's been hidden since the start
							$("#friend-loading").hide();
							$("#friend-filter").show();
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

function fetchPhotosOfFriend(friendId) {
	log('Fetching photos of friend with id ' + friendId + ' ...');
	FB.api('/' + friendId + '/photos', {'limit': 250}, function(response) {
		log('Fetched ' + response.data.length + ' additional photos.');
		$("#friend-loading").hide();
		$("#friend-filter").show();
		totalPhotos += response.data.length;
		for (pic in response.data) {
			picture = response.data[pic].picture;
			processPhoto(picture);
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