<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	//getMethod
	if($reqMethod=="GET"){
		if(isset($id)){
			
			
			$t0 = $db->setTable("transaction");
			$t1 = $db->setJoinString("INNER JOIN", "account", array("id"=>$t0.".account_no"));
			
			$db->setColumns($t0, array($t0.".account_no, sum(".$t0.".credit_amount) as totalCredit, sum(".$t0.".debit_amount) as totalDebit, (sum(".$t0.".credit_amount) - sum(".$t0.".debit_amount)) as balance "), true);
			$db->setColumns($t1, array("account_name"));
			
			$db->setGroupBy(array("account_no"), $t0);
			
			if(isset($_GET['account'])){
				$where['id'] = $id;
				$db->setWhere($where, $t1);
			}else{
				$where['id'] = $id;
				$db->setWhere($where, $t0);
			}
			
			$data = $db->selectSingle();
			echo json_encode($data);
			
			
		}else{
			
			$like = array();
			$userId = 0;
			$limit[0] = $pageNo;
			$limit[1] = $records;
			$where = array();
			
			if(isset($_GET['user_id'])) $where['user_id'] = $_GET['user_id'];
			if(isset($_GET['type'])) $where['type'] = $_GET['type'];
			if(isset($_GET['category'])) $where['category'] = $_GET['category'];
			if(isset($_GET['account_no'])) $where['account_no'] = $_GET['account_no'];
			
			if(isset($_GET['startDt']) && isset($_GET['endtDt'])){
				$sDate = date('Y-m-d H:i:s',strtotime($_GET['startDt']));
				$eDate = date('Y-m-d H:i:s',strtotime($_GET['endtDt']));
				//echo $sDate;
				$db->setWhere(array("(date BETWEEN '".$sDate."' AND '".$eDate."')"), "transaction", false, true);
			}
			$t0 = $db->setTable("transaction");
			$db->setWhere($where, $t0);
			$db->setWhere($like, "transaction", true);
			$db->setLimit($limit);
			
			$data = $db->select();
			if($data['status'] == "success"){
				$credit_amount = 0;
				$debit_amount = 0;
				$total_balance = 0;
				foreach($data['data'] as $row){
					$credit_amount += (int) $row['credit_amount'];
					$debit_amount += (int) $row['debit_amount'];
				}
				$data['credit_amount'] = $credit_amount;
				$data['debit_amount'] = $debit_amount;
				$data['total_balance'] = $credit_amount - $debit_amount;
			}
			echo json_encode($data);
		}
	}//end get
	if($reqMethod=="POST" && $_GET['METHOD'] == 'PUT' || $reqMethod=="DELETE" && $_GET['METHOD'] == 'DELETE'){
		$where['id'] = $id; // need where clause to update/delete record
		$update = $db->update("transaction", $body, $where);
		echo json_encode($update);
	}
	
	if($reqMethod=="POST" && $_GET['METHOD'] == 'DELETE'){
		$where['id'] = $id; // need where clause to update/delete record
		$delete = $db->delete("transaction", $where);
		echo json_encode($delete);
	}
	
	if($reqMethod=="POST" && $_GET['METHOD'] == 'POST'){
		$insert = $db->insert("transaction", $body);
		echo json_encode($insert);
	}
 ?>