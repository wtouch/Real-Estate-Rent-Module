<?php
    if($_SESSION['loggedIn'] == "true") {
        echo "You are logged in";
    } else {
        die("You don't have permission to be here.");
    }
 ?>