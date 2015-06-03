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
			if(isset($_GET['category'])) $where['category'] = $_GET['category'];
			if(isset($_GET['user_id'])) $where['user_id'] = $_GET['user_id'];
			if(isset($_GET['search']) && $_GET['search'] == true){
				(isset($_GET['account_name'])) ? $like['account_name'] = $_GET['account_name'] : "";
			}
			
			if(isset($_GET['startDt']) && isset($_GET['endtDt'])){
				$db->setWhere(array("(date BETWEEN '".$_GET['startDt']."' AND '".$_GET['endtDt']."')"), "account", false, true);
			}
			$t0 = $db->setTable("account");
			$db->setWhere($where, $t0);
			$db->setWhere($like, $t0, true);
			$db->setLimit($limit);
			
			$data = $db->select();
			echo json_encode($data);
		}
	}//end get
	if($reqMethod=="POST" && $_GET['METHOD'] == 'PUT' || $reqMethod=="DELETE" && $_GET['METHOD'] == 'DELETE'){
		$where['id'] = $id; // need where clause to update/delete record
		$update = $db->update("account", $body, $where);
		echo json_encode($update);
	}
	if($reqMethod=="POST" && $_GET['METHOD'] == 'DELETE'){
		$where['id'] = $id; // need where clause to update/delete record
		$delete = $db->delete("account", $where);
		echo json_encode($delete);
	}
	
	if($reqMethod=="POST" && $_GET['METHOD'] == 'POST'){
		$insert = $db->insert("account", $body);
		echo json_encode($insert);
	}
 ?>