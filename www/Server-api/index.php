<?php

// load required files
require_once 'lib/Slim/Slim.php';
require_once 'lib/PHPMailer/PHPMailerAutoload.php';
require_once 'modules/db/session.php';

\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim();

$sessionObj = new session();
$sessionObj->checkActivity();

$app->response->headers->set('Content-Type', 'application/json');
// this will get input
$body = $app->request->getBody();

/* $app->get('/notfound', function()use ($app, $baseUrl){
	echo "Not Found";
}); */
//use these uri for all get requests {Vilas}
$app->post('/upload(/:postParams)', 'uploadFiles' );
$app->post('/sendmail(/:postParams)', 'sendMail' );

//Use this uri for multiple records with limit {Vilas}
$app->get('/getmultiple/:getRequest/:pageNo(/:records)','getRecords');

$app->get('/login/:getRequest','login');

// use thi uri for single record {Vilas}
$app->get('/getsingle/:getRequest(/:id)', 'getRecord' );
//use this uri for post new record into database - like create
$app->post('/post/:getRequest(/:postParams)', 'postRecord' );
//use this uri for put/update record from database
$app->put('/put/:getRequest/:id', 'putRecord' );
//use this uri for delete record from database
$app->delete('/delete/:getRequest/:id', 'deleteRecord' );

function login($getRequest){
	$app = new \Slim\Slim();
	$body = $app->request->getBody();
	// this will get current url
	/* $posIndex = strpos( $_SERVER['PHP_SELF'], '/index.php');
	$baseUrl = substr( $_SERVER['PHP_SELF'], 0, $posIndex).'/index.php'; */ 
	
	try{
			include 'modules/user.php';
	}
	catch(Exception $e) {
       $response["status"] = "error";
        $response["message"] = "Error: '".$e->getMessage()."'";
        $response["data"] = null;
		echoResponse(200, $response);
    }
};

function getRecord($getRequest, $id=null){
	$app = new \Slim\Slim();
	$body = $app->request->getBody();
	// this will get current url
	/* $posIndex = strpos( $_SERVER['PHP_SELF'], '/index.php');
	$baseUrl = substr( $_SERVER['PHP_SELF'], 0, $posIndex).'/index.php'; */ 
	
	$id = (int)$id;
	
	try{
		if($id === 0){
			if($id === 0){
				throw new Exception('Please Use proper id for record.');
			}
		}else{
			include 'modules/'.$getRequest.'.php';
		}
	}
	catch(Exception $e) {
        $response["status"] = "error";
        $response["message"] = "Error: '".$e->getMessage()."'";
        $response["data"] = null;
		echoResponse(200, $response);
    }
};

//this function will help to add modules & fetch records from database {vilas}
function getRecords($getRequest, $pageNo=1, $records = 10){
	$app = new \Slim\Slim();
	$body = $app->request->getBody();
	// this will get current url
	/* $posIndex = strpos( $_SERVER['PHP_SELF'], '/index.php');
	$baseUrl = substr( $_SERVER['PHP_SELF'], 0, $posIndex).'/index.php';  */
	
	$pageNo = (int)$pageNo;
	$records = (int)$records;
	try{
		if($pageNo === 0 || $records === 0){
			if($pageNo === 0){
				throw new Exception('Page No is not a number');
			}
			if($records===0){
				throw new Exception('Records is not a number');
			}
		}else{
			include 'modules/'.$getRequest.'.php';
		}
	}
	catch(Exception $e) {
        //return $app->response()->redirect($baseUrl.'/notfound');
		$response["status"] = "error";
        $response["message"] = "Error: '".$e->getMessage()."'";
        $response["data"] = null;
		echoResponse(200, $response);
    }
		
};

function postRecord($getRequest, $postParams=null){
	$app = new \Slim\Slim();
	$body = $app->request->getBody();
	// this will get current url
	$posIndex = strpos( $_SERVER['PHP_SELF'], '/index.php');
	$baseUrl = substr( $_SERVER['PHP_SELF'], 0, $posIndex).'/index.php'; 
	
	try{
		if(!isset($_SESSION['username']) && $postParams != ("login" || "forgotpass" || "changepass")){
			throw new Exception('You are not logged in!');
		}
		if($body===""){
			throw new Exception('There is no input!');
		}else{
			include 'modules/'.$getRequest.'.php';
		}
	}
	catch(Exception $e) {
		$response["status"] = "error";
        $response["message"] = "Error: '".$e->getMessage()."'";
        $response["data"] = null;
		echoResponse(200, $response);
    }
};

function uploadFiles($postParams = null){
	$app = new \Slim\Slim();
	$body = $app->request->getBody();

	try{
		if(!isset($_FILES)){
				throw new Exception('There is no file input!');
		}else{
			include 'modules/upload.php';
		}
	}
	catch(Exception $e) {
		$response["status"] = "error";
        $response["message"] = "Error: '".$e->getMessage()."'";
        $response["data"] = null;
		echoResponse(200, $response);
    }
}
function sendMail($postParams = null){
	$app = new \Slim\Slim();
	$body = $app->request->getBody();

	try{
			include 'modules/mail.php';
	}
	catch(Exception $e) {
		$response["status"] = "error";
        $response["message"] = "Error: '".$e->getMessage()."'";
        $response["data"] = null;
		echoResponse(200, $response);
    }
}
function putRecord($getRequest, $id){
	$app = new \Slim\Slim();
	$body = $app->request->getBody();
	// this will get current url
	$posIndex = strpos( $_SERVER['PHP_SELF'], '/index.php');
	$baseUrl = substr( $_SERVER['PHP_SELF'], 0, $posIndex).'/index.php'; 
	
	$id = (int)$id;
	try{
		if(!isset($_SESSION['username'])){
			throw new Exception('You are not logged in!');
		}
		if($id === 0 || $getRequest===null){
			if($id === 0){
				throw new Exception('Please Use proper id for record.');
			}
			if($getRequest===null){
				throw new Exception('Please Use proper Module Name for record.');
			}
		}else{
			include 'modules/'.$getRequest.'.php';
		}
	}
	catch(Exception $e) {
        $response["status"] = "error";
        $response["message"] = "Error: '".$e->getMessage()."'";
        $response["data"] = null;
		echoResponse(200, $response);
    }
};

function deleteRecord($getRequest, $id){
	$app = new \Slim\Slim();
	$body = $app->request->getBody();
	// this will get current url
	$posIndex = strpos( $_SERVER['PHP_SELF'], '/index.php');
	$baseUrl = substr( $_SERVER['PHP_SELF'], 0, $posIndex).'/index.php'; 
	
	$id = (int)$id;
	try{
		if($id === 0 || $getRequest===null){
			if($id === 0){
				throw new Exception('Please Use proper id for record.');
			}
			if($getRequest===null){
				throw new Exception('Please Use proper Module Name for record.');
			}
		}else{
			include 'modules/'.$getRequest.'.php';
		}
	}
	catch(Exception $e) {
       $response["status"] = "error";
        $response["message"] = "Error: '".$e->getMessage()."'";
        $response["data"] = null;
		echoResponse(200, $response);
    }
};
function echoResponse($status_code, $response) {
    $app = \Slim\Slim::getInstance();
    // Http response code
    $app->status($status_code);

    // setting response content type to json
    $app->contentType('application/json');

    echo json_encode($response);
}

$app->run();
 ?>