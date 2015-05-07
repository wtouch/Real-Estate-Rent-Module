<?php
	require_once 'db/dbHelper.php';
	require_once 'db/passwordHash.php';
	require_once 'db/session.php';
	require_once 'users/login.php';
	require_once 'users/getUsers.php';
	require_once 'users/register.php';
	
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	$pathExpl = explode("server-api", $_SERVER['REQUEST_URI']);
	$appPath =  $_SERVER['HTTP_HOST'].$pathExpl[0]."app/";
	
	//getMethod
	if($reqMethod=="GET"){
		if(isset($getRequest) && $getRequest =='session'){
			getSession($getRequest);
		}elseif(isset($getRequest) && $getRequest =='logout'){
			logout();
		}elseif(isset($getRequest) && $getRequest =='activate'){
			echo json_encode(autoActivate());
		}else{
			if(isset($id)){
				echo json_encode(getSingleUser($id));
			}else{
				$limit[0] = $pageNo; 
				$limit[1] = $records; 
				getMultipleUsers($limit); // from getUsers.php
			}
		}
	}
	
	if($reqMethod=="POST"){
		if(isset($postParams) && $postParams == 'login'){
			doLogin($body);
		}elseif(isset($postParams) && $postParams == 'register'){
			registerUser($body, $appPath);
		}elseif(isset($postParams) && $postParams == 'forgotpass'){
			echo json_encode(forgotPass($body, $appPath));
		}elseif(isset($postParams) && $postParams == 'changepass'){
			changePass($body);
		}elseif(isset($postParams) && $postParams == 'checkavailability'){
			checkAvailability($body);
		}elseif(isset($postParams) && $postParams == 'activate'){
			$body = json_decode($body);
			$email = $body->email;
			echo json_encode(activateUser($email, $appPath));
		}
	}

	if($reqMethod=="PUT" || $reqMethod=="DELETE"){
		$where['id'] = $id; // need where clause to update/delete record
		$update = $db->update("users", $body, $where);
		echo json_encode($update);
	}

 ?>