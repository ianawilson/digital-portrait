Digital Portrait
================

Your profile picture is often quintessential of your online existence. Do the rest of the images attached to your digital self add up to it? Does any of that add up to you?


TODO
----

 - slider bar for how opaque / transparent profile picture is
 - Mozilla gradient for #log
 - center original over mosaic
 - fix layout for all aspect ratios of profile images
 - instructions, explanation
 - only loads 5000 friends


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

Idea for hiding caching:
Start with a small number of images, keep increasing the grid and load new images in the background simultaneously.

Possible fixed-width fonts:
http://www.google.com/webfonts#ReviewPlace:refine/Collection:Lekton|Ubuntu+Mono|Inconsolata|Anonymous+Pro|VT323

Probably using this little color difference finder:
http://stevehanov.ca/blog/index.php?id=116
AND, all it did was do sqrt(deltaR^2 + deltaG^2 + deltaB^2), so I'm doing that