function makeImage(url) {
	im = new Image();
	im.src = url;
	// im.crossOrigin = "anonymous"; // pretty sure this isn't needed any more because of getImageData.php
	return im;
}

function averageColor(image) {
	var hist = {};

	Pixastic.process(image, "colorhistogram", {paint:false, returnValue:hist});

	ravg = weightedAverage(hist.rvals);
	gavg = weightedAverage(hist.gvals);
	bavg = weightedAverage(hist.bvals);
	
	return [Math.round(ravg), Math.round(gavg), Math.round(bavg)];
}

function weightedAverage(arr) {
	var numerator = 0;
	var denominator = 0;
	
	for (i=0; i<arr.length; i++) {
		denominator += arr[i];
		numerator += arr[i] * i;
	}

	var avg = numerator / denominator;
	return avg;
}

// on a scale from 0 - 1, how different are the two rgb arrays? (lower is less different / more similar)
// sqrt(deltaR^2 + deltaG^2 + deltaB^2)
function getRGBDifferenceScore(first, second) {
	deltaR = (first[0] / 255 - second[0] / 255);
	deltaG = (first[1] / 255 - second[1] / 255);
	deltaB = (first[2] / 255 - second[2] / 255);
	similarity = Math.pow(
		Math.pow(deltaR, 2) +
		Math.pow(deltaG, 2) +
		Math.pow(deltaB, 2),
	0.5);
	return similarity
}

function makeRGBMosaicMatrix(originalImage, rows, cols) {
	if (! rows) {
		rows = 1;
	}
	if (! cols) {
		cols = 1;
	}
	
	rowSize = Math.round(originalImage.height / rows);
	colSize = Math.round(originalImage.width / cols);
	// log(rowSize + ', ' + colSize);
	
	matrix = new Array(rows);
	// loop over rows, one entry for each col
	for (row = 0; row < rows; row++) {
		matrix[row] = new Array(cols);
		for (col = 0; col < cols; col++) {
			// make a copy so we don't lose the original
			image = makeImage(originalImage.src);
			cropped = Pixastic.process(image, "crop", {rect: {top: rowSize * row, left: colSize * col, height: rowSize, width: colSize}})
			matrix[row][col] = averageColor(cropped)
		}
	}
	return matrix;
}

function drawMosaicSwatches(matrix) {
	for (row = 0; row < matrix.length; row++) {
		currentRow = $("<div class='row'></div>");
		for (col = 0; col < matrix[row].length; col++) {
			swatch = $("<div class='swatch'>");
			swatch.css("background-color", "rgb(" + matrix[row][col][0] + "," + matrix[row][col][1] + "," + matrix[row][col][2] + ")");
			currentRow.append(swatch)
		}
		$("#mosaic").append(currentRow);
	}
}

function drawMosaicImages(matrix) {
	for (row = 0; row < matrix.length; row++) {
		currentRow = $("<div class='row'></div>");
		for (col = 0; col < matrix[row].length; col++) {
			image = matrix[row][col];
			currentRow.append(image)
		}
		$("#mosaic").append(currentRow);
	}
}

function makeImageMosaicMatrix(template, originalImages, rows, cols) {
	width = template.width / cols;
	height = template.height / rows;
	
	log('Making RGB mosaic matrix for profile image ...');
	// get rgb matrix for the template
	templateMatrix = makeRGBMosaicMatrix(template, rows, cols);
	colWidth = Math.round(template.width / cols);
	rowHeight = Math.round(template.height / rows);
	
	images = new Array(originalImages);
	
	log('Cropping images ...');
	// crop images to correct aspect ratio, resize to appropriate size
	// most importantly, *make a copy of images to alter*
	for (image in originalImages) {
		images[image] = makeImage(originalImages[image].src);
		cropToAspectRatio(images[image], colWidth, rowHeight);
		images[image].width = colWidth;
		images[image].height = rowHeight; // is this line needed? probably not except to deal with a rounding error. worst error should be 1px.
	}
	
	log('Finding average colors of all images ...');
	// find average colors of all images in matrix
	imageRGBs = new Array(images.length);
	for (image in images) {
		rgb = averageColor(images[image]);
		imageRGBs[image] = (rgb);
	}
	
	// compare these to the rgb matrix
	// start at the begining of the templateMatrix
	// calculate the scores for each image for this swatch
	// choose the best image, place it in new matrix, pop from images array
	log('Choosing best matches for each swatch ...');
	imagesMatrix = new Array(templateMatrix.length)
	for (row in templateMatrix) {
		imagesMatrix[row] = new Array(templateMatrix[row].length)
		for (swatch in templateMatrix[row]) {
			// find the best matching image for this swatch
			bestScore = 2; // choose a score outside of valid range to make sure it gets repalced
			bestScoreIndex = -1;
			for (image in images) {
				score = getRGBDifferenceScore(templateMatrix[row][swatch], imageRGBs[image]);
				// lower score is a better match
				if (score < bestScore) {
					bestScore = score;
					bestScoreIndex = image;
				}
			}
			
			// now that we have the best match, splice it *and* it's score out and place in a new matrix
			// splice out the color, discard
			imageRGBs.splice(bestScoreIndex, 1);
			imagesMatrix[row][swatch] = images.splice(bestScoreIndex, 1);
		}
	}
	
	// return new matrix with images for swatches
	return imagesMatrix;
}

function cropToAspectRatio(image, x, y) {
	// find the largest multiple of x and y that fit the given image
	xRatio = image.width / x;
	yRatio = image.height / y;
	if (yRatio < xRatio) {
		ratio = yRatio;
	} else {
		ratio = xRatio;
	}
	// log(ratio)
	newX = x * ratio;
	newY = y * ratio;
	// log('new: ' + newX + ', ' + newY)
	
	marginX = Math.round((image.width - newX) / 2);
	marginY = Math.round((image.height - newY) / 2);
	// log('margin: ' + marginX + ', ' + marginY)
	
	Pixastic.process(image, "crop", {rect: {top: marginY, left: marginX, width: newX, height: newY}});
}

function cropToExactSize(image, x, y) {
	// just need to center it
	marginX = Math.round((image.width - x) / 2);
	marginY = Math.round((image.height - y) / 2);
	
	Pixastic.process(image, "crop", {rect: {top: marginY, left: marginX, width: newX, height: newY}});
}

function makeAndDisplayMosaic(rows, cols) {
	mat = makeImageMosaicMatrix(profileImg, photos, rows, cols);
	reset();
	drawMosaicImages(mat);
}

function findIdealDimensions(image, numOfImages) {
	log('Finding ideal dimensions ...');
	
	width = image.width;
	height = image.height;
	
	ratio = width / height;
	foundBest = false;
	rows = 0;
	cols = 0;
	do {
		if (rows * cols > numOfImages) {
			foundBest = true;
		} else {
			bestRows = rows;
			bestCols = cols;
			
			rows++;
			cols = Math.floor(rows * ratio);
		}
	} while ( !foundBest );
	
	log('Ideal dimensions: ' + bestRows + ' rows and ' + bestCols + ' columns.');
	return [bestRows, bestCols];
}