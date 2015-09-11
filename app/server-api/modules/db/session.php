<?php
require_once('dbHelper.php');
class session {
	
	public function getSession(){
		if (!isset($_SESSION)) {
			session_start();
		}
		$sess = array();
		if(isset($_SESSION['id']))
		{
			foreach($_SESSION as $sessionName => $sessionValue){
				$sess[$sessionName] = $_SESSION[$sessionName];
			}
		}
		else{
			$sess["id"] = '';
			$sess["username"] = 'Guest';
		}
		return $sess;
	}
	public function setSession($sessionData, $period = null){
		if (!isset($_SESSION)) {
			session_start();
		}
		$this->setCookies("auth","true", $period);
		foreach($sessionData as $sessionName => $sessionValue){
			$_SESSION[$sessionName] = $sessionValue;
		}
		
		return $_SESSION;
	}
	public function setCookies($name, $value, $period){
		if($period !== null){
			$cookie_name = $name;
			$cookie_value = $value;
			setcookie($cookie_name, $cookie_value, time() + ($period), "/");
			//print_r($_SESSION);
		}
	}
	
	public function checkActivity(){
		if (!isset($_SESSION)) {
			session_start();
		}
		
		if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 60*30)) {
			// last request was more than 30 minutes ago
			session_regenerate_id(true);
			$this->destroySession();
		}else if(isset($_SESSION['username'])){
			 // update last activity time stamp
			$this->setCookies("auth", "true", 60*30);
		}
		$_SESSION['LAST_ACTIVITY'] = time();
	}
	
    public function destroySession(){
		if (!isset($_SESSION)) {
			session_start();
		}
		if(isSet($_SESSION['id']))
		{
			foreach($_SESSION as $sessionName => $sessionValue){
				unset($_SESSION[$sessionName]);
			}
			session_unset();     // unset $_SESSION variable for the run-time 
			session_destroy();   // destroy session data in storage
			$msg = "Logged Out Successfully...";
		}
		else{
			$msg = "Not logged in...";
		}
		if (isset($_SERVER['HTTP_COOKIE'])) {
			$cookies = explode(';', $_SERVER['HTTP_COOKIE']);
			foreach($cookies as $cookie) {
				$parts = explode('=', $cookie);
				$name = trim($parts[0]);
				setcookie($name, '', time()-3600);
				setcookie($name, '', time()-3600, '/');
			}
		}
		session_regenerate_id(true);
		return $msg;
	}

}

?>
