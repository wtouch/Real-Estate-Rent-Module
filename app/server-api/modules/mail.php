<?php
	require_once 'modules/db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	if($reqMethod=="POST"){
		$input = json_decode($body);

		$from['email'] = $input->from_email;
		$from['name'] = $input->name;
		$recipients = array($input->to_email);
		$subject = $input->subject;
		$message = $input->message;

		$mail = $db->sendMail($from, $recipients, $subject, $message, $replyTo=null, $attachments = null, $ccMail=null, $bccMail = null, $messageText = null);
		
		echo json_encode($mail);
	}

 ?>