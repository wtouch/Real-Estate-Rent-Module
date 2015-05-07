<?php
	require_once 'db/dbHelper.php';
	require_once 'uploadClass.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	if($reqMethod=="GET"){
		
	}
	
	if($reqMethod=="POST"){
		$upload = new uploadClass;
		// user parameters 
		$path = (isset($_POST['path'])) ? $_POST['path'] : "uploads/general";
		if(isset($_FILES['file'])){
			$upload->set_path($path);
			echo json_encode($upload->upload($_FILES['file']));
		}else{
			$response["status"] = "error";
			$response['message'] = 'No image found';
			$response['data'] = null;
			echoResponse(200,$response);
		}
	}
	
	if($reqMethod=="PUT" || $reqMethod=="DELETE"){
		echo "currently no need to update for media!";
		/* $table = 'media';
		$where['id'] = $id;
		$update = $db->update($table, $body, $where);
		echo json_encode($update); */
	}
 ?>