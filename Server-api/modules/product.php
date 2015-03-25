<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	//getMethod
	if($reqMethod=="GET"){
		if(isset($id)){
			$where['id'] = $id;
			$data = $db->select("product", $where);
			echo json_encode($data);
			
		}else{
			$where=array(); // this will used for user specific data selection.
			$limit['pageNo'] = $pageNo; // from which record to select
			$limit['records'] = $records; // how many records to select
			
			((isset($_GET['business_id'])) && ($_GET['business_id']!=="")) ? $where['business_id'] = $_GET['business_id'] : "";
			
			((isset($_GET['user_id'])) && ($_GET['user_id']!=="")) ? $where['user_id'] = $_GET['user_id'] : "";
			((isset($_GET['type'])) && ($_GET['type']!=="")) ? $where['type'] = $_GET['type'] : "";
			
			
			// this is used to select data with LIMIT & where clause
			$data = $db->select("product", $where, $limit);
			
			// this is used to count totalRecords with only where clause
			$tootalDbRecords = $db->select("product", $where, $limit=null);
			$totalRecords['totalRecords'] = count($tootalDbRecords['data']);
			
			
			// $data is array & $totalRecords is also array. So for final output we just merge these two arrays into $data array
			$data = array_merge($totalRecords,$data);
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