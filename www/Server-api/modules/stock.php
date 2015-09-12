<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	 
	//getMethod
	if($reqMethod=="GET"){
		if(isset($id)){
			$where['id'] = $id;
			$t0 = $db->setTable("stock");
			$db->setWhere($where, $t0);
			$data = $db->selectSingle();
			echo json_encode($data);
			
		}else{
			
			$like = array();
			$userId = 0;
			$limit[0] = $pageNo;
			$limit[1] = $records;
			$where = array();
			if(isset($_GET['category'])) $where['category'] = $_GET['category'];
			if(isset($_GET['user_id'])) $where['user_id'] = $_GET['user_id'];
			
			$t0 = $db->setTable("stock");
			$db->setWhere($where, $t0);
			$db->setWhere($like, $t0, true);
			$db->setLimit($limit);
			
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
		print_r($body);
		$where['id'] = $id; // need where clause to update/delete record
		$update = $db->update("stock", $body, $where);
		
		echo json_encode($update);
		
	}
 ?>