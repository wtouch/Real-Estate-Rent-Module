<?php
	function getSession($getRequest){
		$sessionObj = new session();
		echo json_encode($sessionObj->getSession());
	}
	function doLogin($body){
		try{
			$db = new dbHelper();
			$sessionObj = new session();
			
			$input = json_decode($body, true);
			
			$where['username'] = $input['username'];
				
			$password = $input['password']; // get password from json
			$sessionPeriod = (isset($input['remember'])) ? 60*60*24*30 : 60*30;
			
			$table = "users";
			$t[0] = $db->setTable($table);
			$db->setWhere($where, $t[0]);
			
			$db->setColumns($t[0], array("*"));
			
			$t[1] = $db->setJoinString("INNER JOIN", "user_group", array("id"=>$t[0].".group_id"));
			
			// inner join select column [table name][join col name][column to select] = column alias
			$selectInnerJoinCols['group_name'] = "group_name";
			$selectInnerJoinCols['config'] = "group_config";
			$selectInnerJoinCols['group_permission'] = "permission";
			$db->setColumns($t[1], $selectInnerJoinCols);
			
			$data = $db->selectSingle();

			if($data['status'] == 'error' || $data['status'] == 'warning' || $data['data'] == "" ){
				throw new Exception('You are not registered user!');
			}
			// password check with hash encode
			if(passwordHash::check_password($data['data']['password'],$password)){
				$sessionObj->setSession($data['data'],$sessionPeriod);
				if($data['data']['status'] == 0){
					throw new Exception('Please activate your account to access.');
				}
				if($data['data']['baned'] == 1){
					throw new Exception('Your account is banned, please contact administrator.');
				}
				$response["message"] = "You are logged in successfully.";
                $response["status"] = "success";
				$response["data"] = $sessionObj->getSession();
				echo json_encode($response);
			}else{
				throw new Exception('Password does\'n match!');
			}
			
				
		}catch(Exception $e){
            $response["status"] = "error";
            $response["message"] = 'Error: ' .$e->getMessage();
            $response["data"] = null;
			echo json_encode($response);
        }
		
	}
	function getUniqueId(){
		$uniqueId = md5(uniqid(rand(), true));
		return $uniqueId;
	}
	function forgotPass($body, $appPath){
		try{
			$table = 'users';
			$db = new dbHelper();
			$input = json_decode($body);
			$uniqueId = getUniqueId();
			if(property_exists($input,'email')){
				$where['email'] = $input->email;
				
				$table = "users";
				$t[0] = $db->setTable($table);
				$db->setWhere($where, $t[0]);
				
				$db->setColumns($t[0], array("*"));
				$data = $db->selectSingle();
				
				if($data['status'] == 'success' && $data['data']['email'] == $input->email){
					$frmEmail = json_decode('{"email":"admin@apnasite.in", "name":"Reset Password"}',true);
					$from['email'] = $frmEmail['email'];
					$from['name'] = $frmEmail['name'];
					
					$recipients = array($input->email);
					$subject = "Reset your Password";
					$message = "Dear User, <a href='http://".$appPath."#/changepass/".$uniqueId."'>Reset your password</a>";
					$sendMail = $db->sendMail($from, $recipients, $subject, $message);
					if($sendMail['status'] == 'success'){
						$dataCol['password'] = $uniqueId;
						$resetPass = $db->update($table, $dataCol, $where);
						if($resetPass['status'] !== 'success'){
							throw new Exception($resetPass['message']);
							
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
			
			$response["message"] = "Password link sent to your email id. Please check your mailbox.";
			$response["status"] = "success";
			$response["data"] = null;//json_encode($sessionObj->getSession());
		}catch(Exception $e){
            $response["status"] = "error";
            $response["message"] = 'Error: ' .$e->getMessage();
            $response["data"] = null;
        }
		return $response;
	}
	function changePass($body){
		try{
			$db = new dbHelper();
			$sessionObj = new session();
			$input = json_decode($body);
			$table = 'users';
			$where = array();
			if(isset($_GET['reset'])){
				if($_GET['reset'] ===""){
					throw new Exception("URL not valid");
				}else{
					$where['password'] = $_GET['reset'];
					
					$t[0] = $db->setTable($table);
					$db->setWhere($where, $t[0]);
					
					$db->setColumns($t[0], array("*"));
					$data = $db->selectSingle();
					
					//print_r($data);
					if($data['status'] != 'success' || $data['data'] == null){
						throw new Exception("You are already changed password or this link has expired. Please try again!");
					}else{
						if(property_exists($input,'password')){
							$newPass['password'] = passwordHash::hash($input->password);
							$updatePass = $db->update("users", $newPass, array("id"=>$data['data']['id']));
							//print_r($updatePass);
							if($updatePass['status'] != 'success'){
								throw new Exception('Password didn\'t updated! Database Error: '.$updatePass['message']);
							}
						}else{
							throw new Exception('Please provide password!');
						};
					}
				}
			}else{
				if(property_exists($input,'user_id')){
					$where['id'] = $input->user_id;
					$t[0] = $db->setTable($table);
					$db->setWhere($where, $t[0]);
					
					$db->setColumns($t[0], array("*"));
					$data = $db->selectSingle();
					if($data['status'] != 'success'){
						throw new Exception("Database Error: ".$data['message']);
					}else{
						$password = $input->password->old;
						// password check with hash encode
						if(passwordHash::check_password($data['data']['password'],$password)){
							$newPass['password'] = passwordHash::hash($input->password->new);
							$updatePass = $db->update($table, $newPass, $where);
							if($updatePass['status'] == 'error'){
								throw new Exception('Password didn\'t updated! Database Error: '.$updatePass['message']);
							}
						}else{
							throw new Exception('Password does\'n match!');
						}
					}
				}else{
					throw new Exception('You are not allowed to change password!');
				};
			}
			$response["message"] = "Your password Changed successfully.";
			$response["status"] = "success";
			$response["data"] = null;
			echo json_encode($response);
		}catch(Exception $e){
            $response["status"] = "warning";
            $response["message"] = 'Warning Message: ' .$e->getMessage();
            $response["data"] = null;
			echo json_encode($response);
        }
	}
	
	function logout(){
		$sessionObj = new session();
		echo json_encode($sessionObj->destroySession());
	}
 ?>