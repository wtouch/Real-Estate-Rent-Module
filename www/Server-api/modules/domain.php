<?php
	require_once 'db/dbHelper.php';
	$db = new dbHelper();
	$reqMethod = $app->request->getMethod();
	
	//getMethod
	if($reqMethod=="POST"){
		if(!isset($_GET['subdomain'])){
			function sendme($url){
				$curl = curl_init('-k');
				curl_setopt($curl, CURLOPT_URL, $url);
				curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
				curl_setopt($curl, CURLOPT_HEADER, false);
				curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // disable for ssl verification
				$result = curl_exec($curl);
				$error = curl_error ($curl);
				if($error) return $error;
				curl_close($curl);
				return $result;
			}

			$input = json_decode($body,true);
			
			$domainArr = explode('.', $input['domain']);
			
			$domain = $domainArr[0];
			$tlds = (count($domainArr) == 1 ) ? "com" : $domainArr[1];
			
			$url = 'https://test.httpapi.com/api/domains/available.json?auth-userid=435878&api-key=KA4O3YJGiLcc0o86jhKT2vnDdzzCdoCd&domain-name='.$domain.'&tlds='.$tlds;
			//echo $url;
			$response = sendme($url);

			echo $response;
		}else{
			$input = json_decode($body,true);
			//$domainArr = explode('.', $input['domain']);
			$where['domain_name'] = $input['domain'];
			
			$t0 = $db->setTable("website");
			$db->setWhere($where, $t0);
			
			$dbCheck = $db->selectSingle();
			if($dbCheck['status'] != "success"){
				$response['status'] = "success";
				$response['message'] = "Domain Available";
				$response['data'] = $body;
			}else{
				$response['status'] = "error";
				$response['message'] = "Domain Not Available";
				$response['data'] = $body;
			}
			
			echo json_encode($response);
		}
	}
 ?>