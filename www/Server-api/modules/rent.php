<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
		$table = "rent";
	//getMethod
	if($reqMethod=="GET"){
		if(isset($id)){
			$where['id'] = $id;
			$t0 = $db->setTable($table);
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
				(isset($_GET['title'])) ? $like['title'] = $_GET['title'] : "";
			}
			(isset($_GET['name'])) ? $where['name'] = $_GET['name'] : "";
			(isset($_GET['username'])) ? $like['username'] = $_GET['username'] : "";
			(isset($_GET['status'])) ? $where['status'] = $_GET['status'] : "";
			$userCols['name'] = "name";
			$userCols['username'] = "username";
			$user = $db->getUsers($userId,$userCols);
			$db->setLimit($limit);
			$table = $db->setJoinString("INNER JOIN", "rent", array("user_id"=>$user.".id"));
			$db->setWhere($where, $table);
			$db->setWhere($like, $table, true);
			$selectInnerJoinCols[0] = "*";
			$db->setColumns($table, $selectInnerJoinCols);
			$data = $db->select();
			echo json_encode($data);
		}
	}//end get
	
	
	if($reqMethod=="PUT" || $reqMethod=="DELETE"){
		$where['id'] = $id; // need where clause to update/delete record
		$update = $db->update("rent", $body, $where);
		echo json_encode($update);
	}
	
	if($reqMethod=="POST"){
		$insert = $db->insert("rent", $body);
		echo json_encode($insert);
	}
 ?>