<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	//getMethod
	if($reqMethod=="GET"){
		echo $reqMethod;
		$date = new dateTime();
		print_r(date("Y-m-d h:i:s"));
	}//end get
	
	if($reqMethod=="POST"){
				echo $reqMethod;
		echo $body;
	}
	
	if($reqMethod=="PUT" || $reqMethod=="DELETE"){
		echo $reqMethod;
		echo $body;
	}
 ?>