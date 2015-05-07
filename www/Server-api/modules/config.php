<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	//getMethod
	if($reqMethod=="GET"){
		try{
			$table = $_GET['table'];
			$limit[0] = 1;
			$limit[1] = 500;
			$where = array();
			$like = array();
			$groupBy = array();
			if(isset($_GET['filter'])){
				//echo $_GET['filter'];
				$filter = json_decode($_GET['filter'],true);
				if(count($filter) >=1){
					foreach($filter as $key => $value){
						$where[$key] = $value;
					}
				}
			}
			
			if(isset($_GET['search'])){
				$search = json_decode($_GET['search'],true);
				if(count($search) >=1){
					foreach($search as $key => $value){
						$like[$key] = $value;
					}
				}
			}
			if(isset($_GET['groupBy'])){
				$groupBy = json_decode($_GET['groupBy'],true);
				if(count($groupBy) >=1){
					foreach($groupBy as $key => $value){
						$groupBy[$key] = $key;
					}
				}
			}
			//print_r($groupBy);
			$t0 = $db->setTable($table);
			$db->setGroupBy($groupBy,$t0);
			$db->setLimit($limit);
			if($table == 'config'){
				((isset($_GET['config_name'])) && ($_GET['config_name']!=="")) ? $where['config_name'] =$_GET['config_name'] : "";
				$db->setWhere($where, $t0);
				$data = $db->selectSingle();
			}elseif($table == 'business_category' && isset($_GET['search'])){
				$subCat = $db->setJoinString("LEFT JOIN", "business_category", array("parent_id"=>$t0.".id"));
				$keywords = $db->setJoinString("LEFT JOIN", "business_category", array("parent_id"=>$subCat.".id"));
				$db->setWhere($where, $t0);
				$db->setWhere($like, $keywords, true);

				$db->setColumns($subCat, array("category_name"=>"type","id"=>"type_id"));
				$db->setColumns($t0, array("*"));
				$db->setColumns($keywords, array("category_name"=>"keyword"));
				$data = $db->select(false);
				
			}else{
				$db->setWhere($where, $t0);
				$db->setWhere($like, $t0, true);
				$data = $db->select(false);
			}
			
			if($data['status'] != "success"){
				throw new Exception($data['message']);
			}
			$response["message"] = "You are logged in successfully.";
			$response["status"] = "success";
			$response["totalRecords"] = isset($data['totalRecords']) ? $data['totalRecords'] : 1;
			$response["data"] = $data['data'];
			echo json_encode($response);
		}catch(Exception $e){
			$response["status"] = "error";
            $response["message"] = 'Error: ' .$e->getMessage();
            $response["data"] = null;
			echo json_encode($response);
		}
	}//end get
	
	if($reqMethod=="POST"){
		$input = json_decode($body,true);
		//print_r($input);
		$postData = array();
		foreach($input as $key => $value){
			//$dbData['config_name'] = $key;
			//$dbData[$key] = $value;
			//array_push($postData,$dbData);
			//print_r($dbData); 
			$insert = $db->insert("business_category", $value);
			echo json_encode($insert);
		 }
	}
	
	if($reqMethod=="PUT" || $reqMethod=="DELETE"){
		$where['id'] = $id; // need where clause to update/delete record
		$update = $db->update("website", $body, $where);
		echo json_encode($update);
	}

 ?>