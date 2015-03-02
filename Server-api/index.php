<?php

// load required files
require_once 'lib/Slim/Slim.php';

\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim();

$app->response->headers->set('Content-Type', 'application/json');
// this will get input
$body = $app->request->getBody();

/* $app->get('/notfound', function()use ($app, $baseUrl){
	echo "Not Found";
}); */
//use these uri for all get requests {Vilas}
//Use this uri for multiple records with limit {Vilas}
$app->get('/getmultiple/:getRequest/:pageNo(/:records)','getRecords');
// use thi uri for single record {Vilas}
$app->get('/getsingle/:getRequest(/:id)', 'getRecord' );
//use this uri for post new record into database - like create
$app->post('/post/:getRequest', 'postRecord' );
//use this uri for put/update record from database
$app->put('/put/:getRequest/:id', 'putRecord' );
//use this uri for delete record from database
$app->delete('/delete/:getRequest/:id', 'deleteRecord' );

function getRecord($getRequest, $id){
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
        echo "Error: '".$e->getMessage()."'";
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
		echo "Error: '".$e->getMessage()."'";
    }
		
};

function postRecord($getRequest){
	$app = new \Slim\Slim();
	$body = $app->request->getBody();
	// this will get current url
	$posIndex = strpos( $_SERVER['PHP_SELF'], '/index.php');
	$baseUrl = substr( $_SERVER['PHP_SELF'], 0, $posIndex).'/index.php'; 
	
	try{
		if($body===""){
				throw new Exception('There is no input!');
		}else{
			include 'modules/'.$getRequest.'.php';
		}
	}
	catch(Exception $e) {
		echo "Error: '".$e->getMessage()."'";
        //return $app->response()->redirect($baseUrl.'/notfound');
    }
};

function putRecord($getRequest, $id){
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
        echo "Error: '".$e->getMessage()."'";
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
        echo "Error: '".$e->getMessage()."'";
    }
};


$app->run();
 ?>