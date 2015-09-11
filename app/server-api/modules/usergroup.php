<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	//getMethod
	if($reqMethod=="GET"){
		if(isset($id)){
			$where['id'] = $id;
			$t0 = $db->setTable("user_group");
			$db->setWhere($where, $t0);
			$data = $db->selectSingle();
			echo json_encode($data);
			
		}else{
			$where=array(); // this will used for user specific data selection.
			 $like = array();
			 if(isset($_GET['search']) && $_GET['search'] == true){
				 
				 (isset($_GET['group_name'])) ? $like['group_name'] = $_GET['group_name'] : "";
			 }
			
			(isset($_GET['user_id'])) ? $where['user_id'] = $_GET['user_id'] : "";
			(isset($_GET['status'])) ? $where['status'] = $_GET['status'] : "";
			(isset($_GET['read_status'])) ? $where['read_status'] = $_GET['read_status'] : "";
			
			
			$limit[0] = $pageNo; // from which record to select
			$limit[1] = $records; // how many records to select
			
			$t0 = $db->setTable("user_group");
			$db->setColumns($t0,array("*"));
			$db->setWhere($where, $t0);
			$db->setWhere($like, $t0, true);
			$db->setLimit($limit);
			
			$db->setColumns($t0,array("(select count(*) as count from users where status = 1 and group_id = ".$t0.".id) as usersCount"),true);
			
			$data = $db->select(true); // true for totalRecords
			
			echo json_encode($data);
		}
	}//end get
	
	if($reqMethod=="POST"){
		$insert = $db->insert("user_group", $body);
		echo json_encode($insert);
	}
	if($reqMethod=="PUT" || $reqMethod=="DELETE"){
		$where['id'] = $id; // need where clause to update/delete record
		$update = $db->update("user_group", $body, $where);
		echo json_encode($update);
	}
 ?>