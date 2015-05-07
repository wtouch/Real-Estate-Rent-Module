<?php
	require_once 'db/dbHelper.php';
	require_once 'uploadClass.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	//getMethod
	if($reqMethod=="GET"){
		if(isset($id)){
			$where['id'] = $id;
			$t0 = $db->setTable("my_template");
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
				 
				 (isset($_GET['template_name'])) ? $like['template_name'] = $_GET['template_name'] : "";
			}
			(isset($_GET['template_type'])) ? $where['template_type'] = $_GET['template_type'] : "";
			(isset($_GET['status'])) ? $where['status'] = $_GET['status'] : "";
		
			$userCols['name'] = "name";
			$userCols['username'] = "username";
			$user = $db->getUsers($userId,$userCols);
			$db->setLimit($limit);
			$table = $db->setJoinString("INNER JOIN", "my_template", array("user_id"=>$user.".id"));
			$db->setWhere($where, $table);
			$db->setWhere($like, $table, true);
			$selectInnerJoinCols[0] = "*";
			$db->setColumns($table, $selectInnerJoinCols);
			$data = $db->select();
			
			echo json_encode($data);
		}
	}//end get
	
	if($reqMethod=="POST"){
		if(isset($postParams) && $postParams == 'addtemplate'){
			addTemplate($body);
		}else{
			$insert = $db->insert("my_template", $body);
			echo json_encode($insert);
		}
	}
	
	if($reqMethod=="PUT" || $reqMethod=="DELETE"){
		$where['id'] = $id; // need where clause to update/delete record
		$update = $db->update("my_template", $body, $where);
		echo json_encode($update);
	}
	
	function addTemplate($body){
		try{
			$upload = new uploadClass;
			$db = new dbHelper();
			$input = json_decode($body);
			$file = $input->template_zip->file_path;
			$path_to_extract = $input->category."/".$input->template_name;
			$upload->set_path("website/templates");
			
			$insert = $db->insert("my_template", $body);
			if($insert['status'] == "success" && $insert['data'] != ""){
				$extractZip = $upload->extract_zip($file, $path_to_extract);
				if(!$extractZip){
					throw new Exception("zip not extracted!");
				}
			}else{
				throw new Exception($insert['message']);
			}
			$response = $insert;
			$response["message"] = $insert["message"]." Zip extracted in ".$path_to_extract;
			echo json_encode($response);
		}catch(Exception $e) {
			$response["status"] = "error";
            $response["message"] = 'Error: ' .$e->getMessage();
            $response["data"] = null;
			echo json_encode($response);
		}
	}

 ?>