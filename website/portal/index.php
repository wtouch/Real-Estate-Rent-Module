<?php

require $config['root_path'].'/server-api/lib/Slim/Slim.php';
require $config['root_path'].'/server-api/lib/Twig/Autoloader.php';
require $config['root_path'].'/server-api/modules/db/dbHelper.php';
require_once $config['root_path'].'/server-api/lib/PHPMailer/PHPMailerAutoload.php';
require 'models/portalManager.php';

Slim\Slim::registerAutoloader();
Twig_Autoloader::register();
$app = new Slim\Slim();
$portal = new portalManager($config);
$loader = new Twig_Loader_Filesystem("website/portal/views");
$twig = new Twig_Environment($loader);
$body = $app->request->getBody();

$app->get('/(/:city)', function($city=null) use($app, $config, $twig, $portal) {
	$response = $portal->getCategories($city);
	print_r($response);
	if($response['status'] == "success"){
		$template = $twig->loadTemplate("home.html");
	}else{
		$template = $twig->loadTemplate("error.html");
	}
	//$template->display($response);
	//$template = $twig->loadTemplate("home.html");
	$template->display($response);
});
$app->post('/enquiry', function() use($app, $config, $twig, $portal, $body) {
	$response = $portal->sendEnquiry($body);
});

$app->get('/search/:city', function($city,$keyword,$search) use($app, $config, $twig, $portal) {
	// this will replace [-] with [space]
	//to add [-] from template use - replace({' ' : '-'}) as a filter
	foreach($_GET as $key => $value){
		$keyword[$key] = $value;
	}
	$response = $portal->getDataByKeyword($city, $keyword, true);
	$app->response->headers->set('Content-Type', 'application/json');
	echo json_encode($response);
});

$app->get('/search/:city/:keyword(/:business_name)', function($city, $keyword,$business_name=null) use($app, $config, $twig, $portal) {
	// this will replace [-] with [space]
	//to add [-] from template use - replace({' ' : '-'}) as a filter
	$keyword = $portal->decodeUrl($keyword);
	//$business_name = $portal->decodeUrl($business_name);
	$response = $portal->getDataByKeyword($city, $keyword);
	if($response['status'] == "success"){
		$template = $twig->loadTemplate("business.html");
	}else{
		$template = $twig->loadTemplate("error.html");
	}
	$template->display($response);
});

$app->get('/:city/:category', function($city,$category) use($app, $config, $twig, $portal) {
	$category = $portal->decodeUrl($category); 
	$response = $portal->getCategoryTypes($city,$category);
	$template = $twig->loadTemplate("categorytypes.html");
	$template->display($response);
});

$app->get('/:city/:category/:type', function($city,$category, $type) use($app, $config, $twig, $portal) {
	$category = $portal->decodeUrl($category);
	$type = $portal->decodeUrl($type);
	$response = $portal->getBusinessList($city,$category, $type);
	if($response['status'] == "success"){
		$template = $twig->loadTemplate("business.html");
	}else{
		$template = $twig->loadTemplate("error.html");
	} 
	$template->display($response);
});

$app->get('/:city/:category/:type/:business/:id', function($city, $category, $type, $business,$id) use($app, $config, $twig, $portal) {
	$category = $portal->decodeUrl($category);
	$type = $portal->decodeUrl($type);
	$city = $portal->decodeUrl($city);
	$business = $portal->decodeUrl($business);
	$response = $portal->getBusiness($city,$category, $type, $business,$id);
	print_r($response);
	 if($response['status'] == "success"){
		$template = $twig->loadTemplate("viewbusiness.html");
	}else{
		$template = $twig->loadTemplate("error.html");
	} 
	$template->display($response);
});

$app->run();
?>