<?
    try {
        // Check if the URL is set
    	if(isset($_GET["url"])) {
    	    $image = $_GET["url"];
            $ext = pathinfo($image, PATHINFO_EXTENSION);
            header("Content-type: image/jpeg");
            readfile($image);
            exit(0);
    	} else {
    	    // url not set
    	}
    } catch (Exception $e) {
        print $e;
    }
?>