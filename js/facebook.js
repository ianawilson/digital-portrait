$(document).ready(init);

var photos = new Array(0);
var profileImg;
var profileMat;

function init() {
    FB.init({ 
        appId:'244918665570373', cookie:true, 
        status:true, xfbml:true, oauth:true
    });
    
	FB.getLoginStatus(function(response) {
        if (response.authResponse) {
			// good
			log("Application loaded and authenticated to Facebook.")
			start();
		} else {
			FB.login(function(response) {
				if (response.authResponse) {
					start();
				} else {
					log('User cancelled login or did not fully authorize.');
				}
			}, {scope: 'user_photos,friends_photos'});
        }
	});
}

function start() {
	fetchProfilePhoto();
}

function fetchProfilePhoto() {
	FB.api('/me/albums', function(response) {
	    for (album in response.data) {
			if (response.data[album].type == 'profile') {
				FB.api('/' + response.data[album].id + '/photos', function(response){
					profile = response.data[0].source;
					// profile = response.data[0].images[0].source;
					
					// some testing
					// $("#test").html("<img src='" + profile +"' crossOrigin='anonymous' />");
					// log($("#photo")[0])
					// mat = makeMosaicMatrix($("#photo")[0]);
					// $("#test").append(mat)
					log('Fetching profile picture ...');
					$.getImageData({url:profile,
						success: function (image) {
							profileImg = image;
							$("#original").append(profileImg);
							log('Finished fetching profile picture.');
							// set content height and width based on picture
							$("#content").height($("#original").height() + 10);
							$("#content").width($("#original").width() + 10);
						},
						error: function (xhr, text_status) {
							
						}
					});
				}); // end of getting photos from album
			}
	    }
	}); // end of getting my albums
}

function fetchMorePhotos(limit) {
	log('Fetching more photos ...');
	FB.api('/me/photos', {'offset': photos.length, 'limit': limit}, function(response) {
		log('Fetched ' + response.data.length + ' additional photos.');
		fetchCount = 1; // for success callback; if you use pic, they are all 24
		for (pic in response.data) {
			picture = response.data[pic].picture;
			picCount = pic + 1;
			log('Processing photo in position ' + (parseInt(pic) + 1) + ' ...');
			
			$.getImageData({url:picture,
				success: function (image) {
					photos.push(image);
					log('Finished processing photo in position ' + fetchCount++ + '.');
					$("#stats").html(photos.length + " photo(s) loaded")
				},
				error: function (xhr, text_status) {
					
				}
			});
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