Digital Portrait
================

Your profile picture is the essence of your online existence. How well does this represent the rest of the images of your digital self?

How well does any of that represent you?

*Hosted at http://ianawilson.com/portrait*


TODO
----

 - in FF, make ideal mosaic seems not to work
 - in FF, input box doesn't clear the first time
 - in FF, please wait does not appear
 - "Like" buttons to share!
  - other social buttons
 - Mozilla gradient for #log
 - viewport size and layout
  - enforce minimum width for the browser window
  - fix layout for all aspect ratios of profile images
 - Uncaught TypeError: Cannot read property 'from' of undefined @ facebook.js:213


Notes
-----

Algorithm:

- Split source image into grid
- Compute average color for each cell of grid (with Pixastic color histogram)
- Find a close match for average color from image pool using sqrt(deltaR^2 + deltaG^2 + deltaB^2); repeat

Using Pixastic with:
 
 - Pixastic core

 - Color Histogram
 - Crop
