<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	//getMethod
	if($reqMethod=="GET"){
		if(isset($id)){
			$where['id'] = $id;
			
			$t0 = $db->setTable("account");
			$db->setWhere($where, $t0);
			$data = $db->selectSingle();
			echo json_encode($data);
			
		}else{
			
			$like = array();
			$userId = 0;
			$limit[0] = $pageNo;
			$limit[1] = $records;
			$where = array();
			if(isset($_GET['user_id'])) $where['user_id'] = $_GET['user_id'];
			
			$t0 = $db->setTable("account");
			$db->setWhere($where, $t0);
			$db->setWhere($like, "account", true);
			$db->setLimit($limit);
			
			$data = $db->select();
			echo json_encode($data);
		}
	}//end get
	if($reqMethod=="PUT" || $reqMethod=="DELETE"){
		$where['id'] = $id; // need where clause to update/delete record
		$update = $db->update("account", $body, $where);
		echo json_encode($update);
	}
	
	if($reqMethod=="POST"){
		$insert = $db->insert("account", $body);
		echo json_encode($insert);
	}
 ?>