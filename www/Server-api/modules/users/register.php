<?php
	function autoActivate(){
		
		try{
			$table = 'users';
			$db = new dbHelper();
			if(isset($_GET['activate']) && isset($_GET['email'])){
				$where['email'] = $_GET['email'];
				$dataCol['status'] = 1;
				if(isset($_GET['password'])) $dataCol['password'] = passwordHash::hash($_GET['password']);
				$dataCol['activation_date'] = date("Y-m-d H:i:s");
					$resetPass = $db->update($table, $dataCol, $where);
					if($resetPass['status'] !== 'success'){
						throw new Exception($resetPass['message']);
					}
				$response["message"] = "Your account activated successfully!";
				$response["status"] = "success";
				$response["data"] = null;//json_encode($sessionObj->getSession());
			}else{
				throw new Exception("This link has expired or Link has changed.");
			}
		}catch(Exception $e){
			$response["status"] = "error";
			$response["message"] = 'Error: ' .$e->getMessage();
			$response["data"] = null;
		}
		return $response;
	}
	
	function activateUser($email, $appPath){
		
		try{
			$table = 'users';
			$db = new dbHelper();
			$uniqueId = getUniqueId();

			if($email != ""){
				$where['email'] = $email;
				$t0 = $db->setTable($table);
				$db->setWhere($where, $t0);
				$data = $db->selectSingle();
				//$data = $db->selectSingle($table, $where);
				$passEmpty = ($data['data']['password'] == ("" || null)) ? 'true' : 'false';
				if($data['status'] == 'success' && $data['data']['email'] == $email){
					$frmEmail = json_decode('{"email":"admin@apnasite.in", "name":"Activate Account"}',true);
					$from['email'] = $frmEmail['email'];
					$from['name'] = $frmEmail['name'];
					$recipients = array($email);
					$subject = "Activate your account";
					$message = "Dear User, <a href='http://".$appPath."#/activate/".$uniqueId."/".$email."/".$passEmpty."'>Activate your account</a>";
					$sendMail = $db->sendMail($from, $recipients, $subject, $message);
					if($sendMail['status'] == 'success'){
						$dataCol['status'] = 0;
						$resetPass = $db->update($table, $dataCol, $where);
						if($resetPass['status'] == 'error'){
							throw new Exception("Update Error: ".$resetPass['message']);
							
						}
					}else{
						throw new Exception("Mail sending error: ".$sendMail['message']);
					}
				}else{
					throw new Exception("Email doesn't matched!");
				}
			}else{
				throw new Exception("Please Provide an email id!");
			}
			$response["message"] = "Account activation link sent to given email id. Please check your mailbox.";
			$response["status"] = "success";
			$response["data"] = null;//json_encode($sessionObj->getSession());
			
		}catch(Exception $e){
            $response["status"] = "error";
            $response["message"] = 'Error: ' .$e->getMessage();
            $response["data"] = null;
        }
		return $response;
	}
	
	function registerUser($body, $appPath){
		$db = new dbHelper();	
		
		$insert = $db->insert("users", $body);
		$input = json_decode($body);
		if($insert['status'] == 'success'){
			$activate = activateUser($input->email, $appPath);
			if($activate['status'] == 'success'){
				$insert['message'] = $insert['message']." and ".$activate['message'];
			}else{
				$insert['status'] = "warning";
				$insert['message'] = "Contact system administrator with your user details. admin@apnasite.in";
			}
		}
		echo json_encode($insert);
	}
	function checkAvailability($body){
		$db = new dbHelper();
		$input = json_decode($body);
		foreach ($input as $key => $value){
			$where[$key] = $value;
		}
		//$where['id'] = $id;
		$t0 = $db->setTable("users");
		$db->setWhere($where, $t0);
		$select = $db->select();
		//$select = $db->select("users", $where);
		if($select['status'] === 'success' && $select['data'] >=1){
			$response["message"] = (isset($where['email'])) ? "Email-ID not available!" : "Username not available!";
			$response["status"] = "warning";
			$response["data"] = null;
		}else{
			$response["message"] = (isset($where['email'])) ? "Email-ID available!" : "Username available!";
			$response["status"] = "success";
			$response["data"] = null;
		}
		echo json_encode($response);
	}
 ?>