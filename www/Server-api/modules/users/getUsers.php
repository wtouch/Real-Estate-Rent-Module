<?php
	function getMultipleUsers($limit){
		$db = new dbHelper();
		$sessionObj = new session();
		$session = $sessionObj->getSession();
		$where=array(); // this will used for user specific data selection.
			$like = array();
			 if(isset($_GET['search']) && $_GET['search'] == true){
				 (isset($_GET['username'])) ? $like['username'] = $_GET['username'] : "";
			 }
			$userId = 0;
			if(isset($_GET['status'])) $where['status'] = $_GET['status'];
			
			if(isset($_GET['user_id'])) $userId = $_GET['user_id'];
			
			
			$groupWhere['status'] = 1;
			
			$t[0] = $db->getUsers($userId, $userCols = null, $where, $like);
			$db->setLimit($limit);
			$db->setOrderBy(array("id"=>"asc"),$t[0]);
			$t1 = $db->setJoinString("INNER JOIN", "user_group", array("id"=>$t[0].".group_id"));
			$db->setWhere($groupWhere, $t1);
			// inner join select column [table name][join col name][column to select] = column alias
			$selectInnerJoinCols['group_name'] = "group_name";
			$selectInnerJoinCols['config'] = "group_config";
			$selectInnerJoinCols['group_permission'] = "permission";
			$db->setColumns($t1, $selectInnerJoinCols);
			
			$data = $db->select(true); // true for totalRecords
			
			if($data['status'] == "success"){
				if(isset($data['data'][0]['totalRecords'])){
					$tootalDbRecords['totalRecords'] = $data['data'][0]['totalRecords'];
					$data = array_merge($tootalDbRecords,$data);
				}
			}
			echo json_encode($data);
	}
	function getSingleUser($id){
		$db = new dbHelper();
		$where['id'] = $id;
		$t0 = $db->setTable("users");
		$db->setWhere($where, $t0);
		$data = $db->selectSingle();
		return $data;
	}
 ?>