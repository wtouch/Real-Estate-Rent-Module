<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
		$table = "invoice";
	//getMethod
	if($reqMethod=="GET"){
		if(isset($id)){
			if(isset($_GET['account'])){
				$where['id'] = $id;
				$t0 = $db->setTable($table);
				$db->setWhere($where, $t0);
				$data = $db->selectSingle();
				echo json_encode($data);
			}
			
		}else{
			
			$like = array();
			$userId = 0;
			$limit[0] = $pageNo;
			$limit[1] = $records;
			$where = array();
			$whereTrans = array();
			$groupBy = array();
			$orderBy = array();
			if(isset($_GET['user_id'])) $userId = $_GET['user_id'];
			if(isset($_GET['property_id'])) $where['property_id'] = $_GET['property_id'];
			if(isset($_GET['invoice_id'])) $whereTrans['invoice_id'] = $_GET['invoice_id'];
			if(isset($_GET['generated_date'])) $like['generated_date'] = $_GET['generated_date'];
			if(isset($_GET['payment_status'])) $like['payment_status'] = $_GET['payment_status'];
			if(isset($_GET['due_date'])) $like['due_date'] = $_GET['due_date'];
			if(isset($_GET['groupBy'])) $groupBy[] = $_GET['groupBy'];
			
			$userCols['name'] = "name";
			$userCols['username'] = "username";
			$userCols['address'] = "address";
			$userCols['email'] = "email";
			$user = $db->getUsers($userId,$userCols);
			$db->setLimit($limit);
			
			$table = $db->setJoinString("INNER JOIN", "invoice", array("user_id"=>$user.".id"));
			$db->setWhere($where, $table);
			$db->setWhere($like, $table, true);
			$selectInnerJoinCols[0] = "*";
			$db->setColumns($table, $selectInnerJoinCols);
			
			
			$paid = $db->setJoinString("LEFT JOIN", "transaction", array("invoice_id"=>$table.".id"));
			$db->setColumns($paid, array($paid.".id as receipt_id, ".$paid.".date as receipt_date, ".$paid.".description as description, ifnull(sum(".$paid.".credit_amount), 0) as paid"), true);
			$db->setColumns($paid, array("ifnull(".$table.".total_amount, 0) - ifnull(sum(".$paid.".credit_amount), 0) as due_amount"), true);
			
			$db->setWhere($whereTrans, $paid);
			
			if(isset($_GET['groupBy'])){
				($_GET['groupBy'] == 'invoice_id') ? $db->setGroupBy(array("id"), $table) : $db->setGroupBy(array("id"), $paid);
			}
			
			if(isset($_GET['orderBy'])){
				$orderBy[str_replace("-","",$_GET['orderBy'])] = ($_GET['orderBy'][0] == "-" ? "desc" : "asc");
			}
			$db->setOrderBy($orderBy, $table);
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
		$where['id'] = $id;
		$update = $db->update("invoice", $body, $where);
		echo json_encode($update);
	}
	
	if($reqMethod=="POST" && $_GET['METHOD'] == 'DELETE'){
		$where['id'] = $id;
		$delete = $db->delete("invoice", $where);
		echo json_encode($delete);
	}
	
	if($reqMethod=="POST" && $_GET['METHOD'] == 'POST'){
		$insert = $db->insert("invoice", $body);
		echo json_encode($insert);
	}
 ?>