<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
		$table = "rent_receipt";
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
			if(isset($_GET['property_id'])) $where['property_id'] = $_GET['property_id'];
			if(isset($_GET['generated_date'])) $like['generated_date'] = $_GET['generated_date'];
			
			$userCols['name'] = "name";
			$userCols['username'] = "username";
			$userCols['address'] = "address";
			$userCols['email'] = "email";
			$user = $db->getUsers($userId,$userCols);
			$db->setLimit($limit);
			$table = $db->setJoinString("INNER JOIN", "rent_receipt", array("user_id"=>$user.".id"));
			$db->setWhere($where, $table);
			$db->setWhere($like, $table, true);
			$selectInnerJoinCols[0] = "*";
			$db->setColumns($table, $selectInnerJoinCols);
			
			$paid = $db->setJoinString("LEFT JOIN", "account", array("receipt_id"=>$table.".id"));
			$db->setColumns($paid, array("ifnull(".$paid.".amount, 0) as paid") , true);
			$db->setColumns($paid, array("ifnull(".$table.".total_amount, 0) - ifnull(".$paid.".amount, 0) as due_amount"), true);
			
			$data = $db->select();
			if($data['status'] == "success"){
				$total_due = 0;
				$total_rent = 0;
				$total_paid = 0;
				foreach($data['data'] as $row){
					$total_rent += (int) $row['total_amount'];
					$total_due += (int) $row['due_amount'];
					$total_paid += (int) $row['paid'];
				}
				$data['total_paid'] = $total_paid;
				$data['total_due'] = $total_due;
				$data['total_rent'] = $total_rent;
			}
			echo json_encode($data);
		}
	}//end get
	
	
	if($reqMethod=="POST" && $_GET['METHOD'] == 'PUT' || $reqMethod=="DELETE" && $_GET['METHOD'] == 'DELETE'){
		$where['id'] = $id; // need where clause to update/delete record
		$update = $db->update("rent_receipt", $body, $where);
		echo json_encode($update);
	}
	
	if($reqMethod=="POST" && $_GET['METHOD'] == 'POST'){
		$insert = $db->insert("rent_receipt", $body);
		echo json_encode($insert);
	}
 ?>