<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	//getMethod
	if($reqMethod=="GET"){
		if(isset($id)){
			$where['id'] = $id;
			$t0 = $db->setTable("product");
			$db->setWhere($where, $t0);
			$data = $db->select();
			echo json_encode($data);
			
		}else{
			$where=array(); // this will used for user specific data selection.
			$limit[0] = $pageNo; // from which record to select
			$limit[1] = $records; // how many records to select
			
			((isset($_GET['business_id'])) && ($_GET['business_id']!=="")) ? $where['business_id'] = $_GET['business_id'] : "";
			
			
			((isset($_GET['type'])) && ($_GET['type']!=="")) ? $where['type'] = $_GET['type'] : "";
			
			$t0 = $db->setTable("product");
			$db->setWhere($where, $t0);
			
			$db->setLimit($limit);
			
			$data = $db->select(); // true for totalRecords
			
			echo json_encode($data);
		}
	}//end get
	
	if($reqMethod=="POST"){
		$insert = $db->insert("product", $body);
		echo json_encode($insert);
	}
	
	if($reqMethod=="PUT" || $reqMethod=="DELETE"){
		$where['id'] = $id; // need where clause to update/delete record
		$update = $db->update("product", $body, $where);
		echo json_encode($update);
	}

 ?>