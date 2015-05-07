<?php
	require_once 'db/dbHelper.php';
	require_once 'uploadClass.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	//getMethod
	if($reqMethod=="GET"){
		if(isset($id)){
			$where['id'] = $id;
			$t0 = $db->setTable("template");
			$db->setWhere($where, $t0);
			$data = $db->selectSingle();
			echo json_encode($data);
			
		}else{
			 // This is for search
			 $like = array();
			 if(isset($_GET['search']) && $_GET['search'] == true){
				 
				 (isset($_GET['template_name'])) ? $like['template_name'] = $_GET['template_name'] : "";
			 }
			$where = array(); // this will used for user specific data selection.
			$limit[0] = $pageNo; // from which record to select
			$limit[1] = $records; // how many records to select
			(isset($_GET['template_type'])) ? $where['template_type'] = $_GET['template_type'] : "";
			(isset($_GET['status'])) ? $where['status'] = $_GET['status'] : "";
			(isset($_GET['development_status'])) ? $where['development_status'] = $_GET['development_status'] : "";
			(isset($_GET['category'])) ? $where['category'] = $_GET['category'] : "";
			(isset($_GET['custom'])) ? $where['custom'] = $_GET['custom'] : "";
			
			if(isset($_GET['user_id'])){
				$userId = $_GET['user_id'];
				$userCols['name'] = "name";
				$userCols['username'] = "username";
				$user = $db->getUsers($userId,$userCols);
				$db->setLimit($limit);
				$table = $db->setJoinString("INNER JOIN", "template", array("user_id"=>$user.".id"));
				$db->setWhere($where, $table);
				$db->setWhere($like, $table, true);
				$selectInnerJoinCols[0] = "*";
				$db->setColumns($table, $selectInnerJoinCols);
			}else{
				
				$t0 = $db->setTable("template");
				$db->setWhere($where, $t0);
				$db->setWhere($like, $t0, true);
				$db->setLimit($limit);
			}
			
			$data = $db->select(true); // true for totalRecords
			
			echo json_encode($data);
		}
	}//end get
	
	if($reqMethod=="POST"){
		if(isset($postParams) && $postParams == 'addtemplate'){
			addTemplate($body);
		}else{
			$insert = $db->insert("template", $body);
			echo json_encode($insert);
		}
	}
	
	if($reqMethod=="PUT" || $reqMethod=="DELETE"){
		$where['id'] = $id; // need where clause to update/delete record
		if(isset($_GET['postParams']) && $_GET['postParams'] == 'addtemplate'){
			updateTemplate($body,$id);
		}else{
			$update = $db->update("template", $body, $where);
			echo json_encode($update);
		}
	}
	
	function addTemplate($body){
		try{
			$upload = new uploadClass;
			$db = new dbHelper();
			$input = json_decode($body);
			$file = $input->template_zip->file_path;
			$path_to_extract = $input->category."/".$input->template_name;
			$upload->set_path("website/templates");
			
			$insert = $db->insert("template", $body);
			if($insert['status'] == "success" && $insert['data'] != ""){
				$extractZip = $upload->extract_zip($file, $path_to_extract);
				if(!$extractZip){
					throw new Exception("zip not extracted!");
				}
				$where['id'] = $insert['data'];
				$updateData['template_params'] =  file_get_contents($upload->get_path().$path_to_extract."/templateParams.json");
				$update = $db->update("template", $updateData, $where);
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
	function updateTemplate($body,$id){
		try{
			$upload = new uploadClass;
			$db = new dbHelper();
			$input = json_decode($body);
			$file = $input->template_zip->file_path;
			$path_to_extract = $input->category."/".$input->template_name;
			$upload->set_path("website/templates");
			$where['id'] = $id;
			
			$insert = $db->update("template", $body, $where);
			if($insert['status'] == "success"){
				$extractZip = $upload->extract_zip($file, $path_to_extract);
				if(!$extractZip){
					throw new Exception("zip not extracted!");
				}
				$updateData['template_params'] =  file_get_contents($upload->get_path().$path_to_extract."/templateParams.json");
				$update = $db->update("template", $updateData, $where);
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