<?php
	require_once 'modules/db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	if($reqMethod=="POST"){
		
		$from['email'] = "admin@wtouch.in";
		$from['name'] = "Testing mail";
		$recipients = array("vilas@wtouch.in");
		$subject = "Reset your Password";
		$message = "Dear User, This is testing mail!";

		$mail = $db->sendMail($from, $recipients, $subject, $message, $replyTo=null, $attachments = null, $ccMail=null, $bccMail = null, $messageText = null);
		print_r($mail);
	}

 ?>