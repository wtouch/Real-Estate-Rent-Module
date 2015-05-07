<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	//getMethod
	if($reqMethod=="GET"){
		if(isset($id)){
			$where['id'] = $id;
			$t0 = $db->setTable("enquiry");
			$db->setWhere($where, $t0);
			$data = $db->selectSingle();
			echo json_encode($data);
			
		}else{
			$like = array();
			$userId = 0;
			$limit[0] = $pageNo;
			$limit[1] = $records;
			$where = array();
			if(isset($_GET['user_id'])) $userId = $_GET['user_id'];
			
			if(isset($_GET['search']) && $_GET['search'] == true){
				 
				(isset($_GET['subject'])) ? $like['subject'] = $_GET['subject'] : "";
			}
			
			(isset($_GET['status'])) ? $where['status'] = $_GET['status'] : "";
			(isset($_GET['read_status'])) ? $where['read_status'] = $_GET['read_status'] : "";
			
			$userCols['name'] = "name";
			$userCols['username'] = "username";
			$user = $db->getUsers($userId,$userCols);
			
			$t0 = $db->setJoinString("INNER JOIN", "enquiry", array("user_id"=>$user.".id"));
			$selectInnerJoinCols[0] = "*";
			$db->setColumns($t0, $selectInnerJoinCols);
			$db->setWhere($where, $t0);
			$db->setWhere($like, $t0, true);
			$db->setLimit($limit);
			
			$data = $db->select(true); // true for totalRecords
			
			if($data['status'] == "success"){
				if(isset($data['data'][0]['totalRecords'])){
					$tootalDbRecords['totalRecords'] = $data['data'][0]['totalRecords'];
					$data = array_merge($tootalDbRecords,$data);
				}
			}
			echo json_encode($data);
		}
	}//end get
	
	if($reqMethod=="POST"){
		$input = json_decode($body);
		
		$from['email'] = $input->from_email->from;
		$from['name'] = $input->name;
		(property_exists ($input->to_email, 'cc')) ? $ccMail = explode(",", $input->to_email->cc) : $ccMail = null;
		$recipients = explode(",", $input->to_email->to);
		$subject = $input->subject;
		$message = "<table>
				<tr>
					<td>Name: </td><td>".$from['name']."</td>
				</tr>
				<tr>
					<td>Email: </td><td>".$from['email']."</td>
				</tr>";
		if(is_object($input->message)){
			foreach($input->message as $key => $value){
				$message .= "<tr>
					<td>".$key.":</td><td>".$value."</td>
				</tr>";
			}
		}else{
			$message .= "<tr>
					<td>Message: </td><td>".$input->message."</td>
				</tr>";
		}
		$message .= "</table>";
		//$message = $input->message->message;

		$mail = $db->sendMail($from, $recipients, $subject, $message, $replyTo=null, $attachments = null, $ccMail, $bccMail = null, $messageText = null);
		 if($mail['status'] == 'success'){
			$insert = $db->insert("enquiry", $body);
			$insert['message'] = $insert['message']." " .$mail['message'];
			$response= $insert;
		}else{
			$response = $mail;
		}
		echo json_encode($response);
	}
	if($reqMethod=="PUT" || $reqMethod=="DELETE"){
		$where['id'] = $id; // need where clause to update/delete record
		$input = json_decode($body);
		$response = array();
		try{
			if(property_exists ($input, 'reply_message')){
				$from['email'] = $input->reply_message->from_email;
				$from['name'] = $input->reply_message->name;
				$recipients = explode("," ,$input->reply_message->to_email);
				$subject = $input->reply_message->subject;
				$message = "<table>
						<tr>
							<td>Name: </td><td>".$from['name']."</td>
						</tr>
						<tr>
							<td>Email: </td><td>".$from['email']."</td>
						</tr>";
				if(is_object($input->reply_message->message)){
					foreach($input->message as $key => $value){
						$message .= "<tr>
							<td>".$key.":</td><td>".$value."</td>
						</tr>";
					}
				}else{
					$message .= "<tr>
							<td>Message: </td><td>".$input->reply_message->message."</td>
						</tr>";
				}
				$message .= "</table>";
				
				//print_r($input);
				$mail = $db->sendMail($from, $recipients, $subject, $message, $replyTo=null, $attachments = null, $ccMail=null, $bccMail = null, $messageText = null);
				
				if(isset($mail['status']) && $mail['status'] != 'success'){
					throw new Exception('Mail didn\'t sent!');
				}
					$response["message"] = $mail["message"];
				
			}
			$update = $db->update("enquiry", $body, $where);
			//$response = $update;
			$response["status"] = "success";
			$response["message"] = (isset($response["message"])) ? $response["message"]." ".$update["message"] : $update["message"];
			$response["data"] = $update["data"];
			echo json_encode($response);
		}catch(Exception $e){
			$response["status"] = "warning";
			$response["message"] = 'Error: ' .$e->getMessage();
			$response["data"] = null;
			echo json_encode($response);
		}
	}
 ?>