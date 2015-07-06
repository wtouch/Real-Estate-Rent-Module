<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	 
	//getMethod
	if($reqMethod=="GET"){
		$table="stock";
		if(isset($id)){
			$where['id'] = $select['data']['id'];
			//$where['id'] = $id;
			$stock = $db->setTable("stock");
			$db->setWhere($where, $stock);
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
				(isset($_GET['domain'])) ? $like['domain'] = $_GET['domain'] : "";
			} 
			(isset($_GET['status'])) ? $where['status'] = $_GET['status'] : "";
			(isset($_GET['featured'])) ? $where['featured'] = $_GET['featured'] : "";
			
			$userCols['name'] = "name";
			$userCols['username'] = "username";
			$user = $db->getUsers($userId,$userCols);
			$db->setLimit($limit);
			$table = $db->setJoinString("INNER JOIN", "stock", array("user_id"=>$user.".id"));
			$db->setWhere($where, $table);
			$db->setWhere($like, $table, true);
			$selectInnerJoinCols[0] = "*";
			$db->setColumns($table, $selectInnerJoinCols);
			$data = $db->select();
			echo json_encode($data);
		}
	}//end get
	
	function checkAvailability($body){
		$db = new dbHelper();
		$input = json_decode($body, true);
		$where['goods_name'] = $input['goods_name'];
		$stock = $db->setTable("stock");
		$db->setWhere($where, $stock);
		$select = $db->selectSingle();
		if($select['status'] === 'success' && $select['data'] >=1){
			//print_r($select['data']);
			$where['id'] = $select['data']['id'];
			$data['quantity'] = ($select['data']['quantity']) ? (int)$select['data']['quantity'] + (int)$input['quantity'] : (int)$input['quantity'];
			$update = $db->update("stock", $data, $where);
			echo json_encode($update);
		}else{
			$insert = $db->insert("stock", $body);
			echo json_encode($insert);
		}
	}
	
	if($reqMethod=="POST"){
		checkAvailability($body);
	}
	
	if($reqMethod=="PUT" || $reqMethod=="DELETE"){
		$where['id'] = $id; // need where clause to update/delete record
		$update = $db->update("stock", $body, $where);
		echo json_encode($update);
	}
 ?>