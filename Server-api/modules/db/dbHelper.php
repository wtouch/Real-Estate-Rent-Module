<?php
require_once $_SERVER['DOCUMENT_ROOT'].'/server-api/modules/db/config.php'; // Database setting constants [DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD]
class dbHelper {
	private $db;
    private $err;
	private $groupBy = null;
	private $where = null;
	private $orderBy = null;
	private $selectColumns = null;
	private $joinQueryString = null;
	private $table;
	private $queryString;
	private $queryParams;
	private $tablesJoined = null;
	private $limit = null;
	// for mail configuration
	private $mailHost;
	private $mailUsername;
	private $mailPassword;
	private $mailPort;
    function __construct() {
	
        $dsn = 'mysql:host='.DB_HOST.';dbname='.DB_NAME;
        try {
            $this->db = new PDO($dsn, DB_USERNAME, DB_PASSWORD, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
        } catch (PDOException $e) {
            $response["status"] = "error";
            $response["message"] = 'Connection failed: ' . $e->getMessage();
            $response["data"] = null;
            exit;
        }
    }
	
	function sendMail($from, $recipients, $subject, $message, $replyTo=null, $attachments = null, $ccMail=null, $bccMail = null, $messageText = null){
		try{
			$mail = new PHPMailer;

			//$mail->SMTPDebug = 3;                               // Enable verbose debug output

			$mail->isSMTP();                                      // Set mailer to use SMTP
			$mail->Host = 'mail.wtouch.in';  // Specify main and backup SMTP servers
			$mail->SMTPAuth = true;                               // Enable SMTP authentication
			$mail->Username = 'vilas@wtouch.in';                 // SMTP username
			$mail->Password = 'vilas@1988';                           // SMTP password
			$mail->SMTPSecure = 'tls';                            // Enable TLS encryption, `ssl` also accepted
			$mail->Port = 587;                                    // TCP port to connect to

			$mail->From = $from['email'];	// From email - $from['email']
			(isset($from['name'])) ? $mail->FromName = $from['name'] : "";	// From Name - $from['name']
			foreach($recipients as $email){
				$mail->addAddress($email);     // Add a recipient
			}
			
			($replyTo === null) ? $replyTo = $from : $replyTo ;
			if(isset($replyTo['name'])){
				$mail->addReplyTo($replyTo['email'], $replyTo['name']);	// replyTo email & name
			}else{
				$mail->addReplyTo($replyTo['email']);	// replyTo email & name
			}
			
			if($ccMail !== null){
				foreach($ccMail as $email){
					$mail->addCC($email);
				}
			}
			if($bccMail !== null){
				foreach($bccMail as $email){
					$mail->addBCC($email);
				}
			}
			if($attachments !== null){
				foreach($attachments as $file => $path){
					$mail->addAttachment($path, $file);    // Add attachments with Optional name
				}
			}
			
			$mail->isHTML(true);                                  // Set email format to HTML

			$mail->Subject = $subject;
			$mail->Body    = $message;
			//$mail->AltBody = $messageText;

			if(!$mail->send()) {
				throw new Exception('Message could not be sent. Mailer Error: ' . $mail->ErrorInfo);
			}
			$response["message"] = 'Message has been sent';
			$response["status"] = "success";
			$response["data"] = null;
		}catch(Exception $e){
            $response["status"] = "error";
            $response["message"] = 'Error: ' .$e->getMessage();
            $response["data"] = null;
        }
		return $response;
	}
	function isAssoc($arr){
		return array_keys($arr) !== range(0, count($arr) - 1);
	}
	
	function resetQueryData(){
		$this->groupBy = null;
		$this->where = null;
		$this->orderBy = null;
		$this->selectColumns = null;
		$this->joinQueryString = null;
		$this->table = null;
		$this->queryString = null;
		$this->queryParams = null;
		$this->tablesJoined = null;
	}
	
	function setTable($table){
		$this->tablesJoined = 0;
		$tableAlias = "t".$this->tablesJoined;
		$this->table[$table] = $tableAlias;
		return $tableAlias;
	}
	function getTable(){
		foreach($this->table as $key => $value){
			$table = $key." as ".$value;
		}
		return $table;
	}
	function setLimit($limit = array(1,10)){
		$lmt = ($limit[0] == 0 ) ? $limit[0] : $limit[0] - 1;
		$startLimit = $lmt * $limit[1];
		
		$this->limit = "LIMIT ".$startLimit.",".$limit[1];
		return true;
	}
	function getLimit(){
		return $this->limit;
	}
	function setGroupBy($groupByArray){
		if(count($groupByArray) >= 1){
			if($this->groupBy == null || $this->groupBy == ""){
				$this->groupBy = " GROUP BY ";
			}else{
				$this->groupBy .= " ";
			}
			foreach($groupByArray as $key){
				$this->groupBy .= $key.",";
			}
			$this->groupBy = $this->groupBy;
			return true;
		}else{
			return false;
		}
	}
	function getGroupBy(){
		if($this->groupBy != null || $this->groupBy != ""){
			return trim($this->groupBy, ",");
		}else{
			return;
		}
	}
	function setColumns($table, $selectColumns, $joinCols=false){
		if(count($selectColumns) >= 1){
			$selectColumn = ($this->selectColumns == null) ? " " : $this->selectColumns;
			if($this->isAssoc($selectColumns)){
				foreach($selectColumns as $key => $value){
					$selectColumn .= $table.".".$key." as ".$value.",";
				}
			}else{
				foreach($selectColumns as $key => $value){
					$selectColumn .= $table.".".$value.",";
				}
			}
			$this->selectColumns = $selectColumn;
			return true;
		}else{
			return false;
		}
	}
	function getColumns(){
		if($this->selectColumns != null || $this->selectColumns != ""){
			return trim($this->selectColumns, ",");
		}else{
			foreach($this->table as $tableName){
				$columns = $tableName.'.* ';
			}
			return $columns;
		}
	}
	
	/*******************************************************************************/
	function setJoinString($joinType, $joinTable, $joinOn){
		$this->joinQueryString = ($this->joinQueryString == null) ? " ".$joinType : $this->joinQueryString." ".$joinType;
		$this->tablesJoined = ($this->tablesJoined== null) ? 1 : $this->tablesJoined + 1 ;
		foreach($joinOn as $key => $value){
			$this->joinQueryString .= " ".$joinTable. " as t".$this->tablesJoined." ON t".$this->tablesJoined.".".$key ." = ".$value;
		}
		return "t".$this->tablesJoined;
	}
	
	function getJoinString(){
		if($this->joinQueryString != null || $this->joinQueryString != ""){
			return trim($this->joinQueryString, ",");
		}else{
			return;
		}
	}
	
	/*******************************************************************************/
	
	function setOrderBy($orderBy){
		if(count($orderBy) >= 1){
			if($this->orderBy == null || $this->orderBy == ""){
				$this->orderBy = " ORDER BY ";
			}else{
				$this->orderBy .= " ";
			}
			foreach($orderBy as $key => $value){
				$this->orderBy .= $key." ".$value.",";
			}
			$this->orderBy = $this->orderBy;
			return true;
		}else{
			return false;
		}
	}
	function getOrderBy(){
		if($this->orderBy != null || $this->orderBy != ""){
			return trim($this->orderBy, ",");
		}else{
			return;
		}
	}
	function setWhere($where, $table, $like = false){
		if(count($where) >= 1){
			if($this->where == null || $this->where == ""){
				$this->where = " WHERE 1=1";
			}else{
				$this->where .= " ";
			}
			if($like == true){
				foreach($where as $key => $value){
					$this->where .= " AND ".$table.".".$key." like '%".$value."%' ";
				}
			}else{
				foreach($where as $key => $value){
					$this->where .= " AND ".$table.".".$key."='".$value."' ";
				}
			}
			
			return true;
		}else{
			return false;
		}
	}
	
	function getWhere(){
		if($this->where != null || $this->where != ""){
			return trim($this->where, ",");
		}else{
			return;
		}
	}
	
	function getQueryString($total = false){
		$table = $this->getTable();
		$columns = $this->getColumns();
		$joinCols = $this->getJoinString();
		$orderBy = $this->getOrderBy();
		$groupBy = $this->getGroupBy();
		$where = $this->getWhere();
		$limit = $this->getLimit();
		$queryString = ($total == true) ? "(SELECT COUNT(t0.id) FROM ".$table." ".$joinCols." ".$where." ".$groupBy." ".$orderBy.") as totalRecords, " : "";
		
		$this->queryString = "SELECT ".$queryString." ".$columns." FROM ".$table." ".$joinCols." ".$where." ".$groupBy." ".$orderBy." ".$limit;

		return $this->queryString;
	}
	
    function select($totalRecords=false){
        try{
            $stmt = $this->db->query($this->getQueryString($totalRecords));
			
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
			
            if(count($rows)<=0 || !is_array($rows)){
                $response["status"] = "warning";
                $response["message"] = "No data found.";
				$response["data"] = $this->getQueryString($totalRecords);
            }else{
				//$response['totalRecords']= $totalRecords;
				$response["message"] = count($rows)." rows selected.";
                $response["status"] = "success";
                $response["query"] = $this->getQueryString($totalRecords);
				$response["data"] = $rows;
            }
            $this->resetQueryData();
        }catch(PDOException $e){
            $response["status"] = "error";
            $response["message"] = 'Select Failed: ' .$e->getMessage();
            $response["data"] = $this->getQueryString($totalRecords);
        }
        return $response;
    }
	function selectSingle(){
        try{
            
            $stmt = $this->db->query($this->getQueryString());
            //$stmt->execute($a);
            $rows = $stmt->fetch(PDO::FETCH_ASSOC);
			//echo "select * from ".$table." where 1=1 ". $w ." ".$dbLimit;
            if(count($rows)<=0 || !is_array($rows)){
                $response["status"] = "warning";
                $response["message"] = "No data found.";
				$response["data"] = null;
            }else{
				//$response['totalRecords']= $totalRecords;
				$response["message"] = count($rows)." rows selected.";
                $response["status"] = "success";
				$response["data"] = $rows; //(count($rows)==1) ? $rows[0] : $rows;
            }
            $this->resetQueryData();
        }catch(PDOException $e){
            $response["status"] = "error";
            $response["message"] = 'Select Failed: ' .$e->getMessage();
            $response["data"] = null;
        }
        return $response;
    }
    function insert($table, $inputData) {
	
        try{
			(is_Array($inputData)) ? $inputData : $inputData = json_decode($inputData);
			
			$dataKey = array();
			$dataValue = array();
			foreach($inputData as $key => $val) // $inputData holds input json data
			{
				$value = ($key!=='password')
						? (is_object($val) || is_array($val))
							? mysql_real_escape_string(json_encode($val))
							: mysql_real_escape_string($val)
						: passwordHash::hash($val);
				//echo ($key=='password')	? passwordHash::hash($val) : "not pass";
				array_push($dataKey,$key);
				array_push($dataValue,"'".$value."'");
			}
			$colNames = implode(",",$dataKey);
			$colValues = implode(",",$dataValue);

		    $stmt =  $this->db->prepare("INSERT INTO $table($colNames) VALUES($colValues)");
            $stmt->execute();
			$id = $this->db->lastInsertId();
            $affected_rows = $stmt->rowCount();
            $response["status"] = "success";
            $response["message"] = $affected_rows." row inserted into database";
			$response["data"] = $id;
        }catch(PDOException $e){
            $response["status"] = "error";
            $response["message"] = 'Insert Failed: ' .$e->getMessage();
			$response["data"] = null;
        }
        return $response;
    }
	
    function update($table, $inputData, $where){
        
        try{
            $a = array();
            $w = "";
            foreach ($where as $key => $value) {
                $w .= " and " .$key. " = :".$key;
                $a[":".$key] = $value;
            }
            (is_Array($inputData)) ? $inputData : $inputData = json_decode($inputData);
			$updateTable = array();
			foreach($inputData as $key => $val) // $inputData holds input json data
			{
			
				$value = (is_object($val) || is_array($val)) ? mysql_real_escape_string(json_encode($val)) : mysql_real_escape_string($val);
				array_push($updateTable,$key." = '".$value."'");
				
			}
			$updateFields = implode(",",$updateTable);

            $stmt =  $this->db->prepare("UPDATE $table SET $updateFields WHERE 1=1 ".$w);
            $stmt->execute($a);
            $affected_rows = $stmt->rowCount();
            if($affected_rows<=0){
                $response["status"] = "warning";
                $response["message"] = "No row updated";
				$response["data"] = null;
            }else{
                $response["status"] = "success";
                $response["message"] = $affected_rows." row(s) updated in database";
				$response["data"] = null;
            }
        }catch(PDOException $e){
            $response["status"] = "error";
            $response["message"] = "Update Failed: " .$e->getMessage();
			$response["data"] = null;
        }
        return $response;
    }
	
    function delete($table, $where){
        if(count($where)<=0){
            $response["status"] = "warning";
            $response["message"] = "Delete Failed: At least one condition is required";
			$response["data"] = null;
        }else{
            try{
                $a = array();
                $w = "";
                foreach ($where as $key => $value) {
                    $w .= " and " .$key. " = :".$key;
                    $a[":".$key] = $value;
                }
                $stmt =  $this->db->prepare("DELETE FROM $table WHERE 1=1 ".$w);
                $stmt->execute($a);
                $affected_rows = $stmt->rowCount();
                if($affected_rows<=0){
                    $response["status"] = "warning";
                    $response["message"] = "No row deleted";
					$response["data"] = null;
                }else{
                    $response["status"] = "success";
                    $response["message"] = $affected_rows." row(s) deleted from database";
					$response["data"] = null;
                }
            }catch(PDOException $e){
                $response["status"] = "error";
                $response["message"] = 'Delete Failed: ' .$e->getMessage();
				$response["data"] = null;
            }
        }
        return $response;
    }
  
}

?>
