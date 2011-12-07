$(document).ready(fbInit);

var friends = new Array(0);

var photos = new Array(0);

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
			$("#stats").html(photos.length + " photo(s) loaded")
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
	FB.api('/me/photos', {'offset': photosOfMeOffset, 'limit': 1000}, function(response) {
		log('Fetched ' + response.data.length + ' additional photos.');
		photosOfMeOffset += response.data.length;
		for (pic in response.data) {
			picture = response.data[pic].picture;
			processPhoto(picture);
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
		for (index in response.data) {
			friends.push(response.data[index]);
		}
		friends.sort(friendSort);
		for (index in friends) {
			$("#friend-list").append("<li>" + friends[index]['name'] + "</li>");
		}
	});
}
function friendSort(a, b) {
	return a['name'].localeCompare(b['name']);
}

function displayAllPhotos() {
	$("#test").html("");
	for (photo in photos) {
		$("#test").append(photos[photo]);
		// $("#test").append("<img src='" + photos[photo] + "' />")
	}
}