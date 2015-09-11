<?php
class uploadClass {
	private $path;
	private $relative_path;
	function __construct(){
		$this->path = $_SERVER['DOCUMENT_ROOT'] . "/" ."uploads". "/";
		$this->relative_path = "/" ."uploads". "/";
	}
	
	function set_path($path){
		$this->path = $_SERVER['DOCUMENT_ROOT'] . "/" . $path . "/";
		$this->relative_path = "/" .$path. "/";
		return true;
	}
	
	function get_path(){
		$this->make_dir($this->path);
		return $this->path;
	}
	
	function asBytes($ini_v) {
	   $ini_v = trim($ini_v);
	   $s = array('g'=> 1<<30, 'm' => 1<<20, 'k' => 1<<10);
	   return intval($ini_v) * ($s[strtolower(substr($ini_v,-1))] ?: 1);
	}
	
	function make_dir($dir){
		if (!file_exists($dir)) {
			mkdir($dir, 0777, true);
		}
		return true;
	}
	
	function check_file_exists($file){
		if (file_exists($file)) {
			return true;
		}else{
			return false;
		}
	}
	
	function compare_files($old_file, $file_size){
		$old_file = $this->get_path().$old_file;
		if(filesize($old_file) == $file_size){
			return true;
		}else{
			return false;
		}
	}
	
	function rename_file($file){
		$temp = explode(".",$file);
		$newfilename = $temp[0] . "_" . rand(1,999999) . '.' .end($temp);
		return $newfilename;
	}
	
	function extract_zip($file, $path_to_extract){
		$zip = new ZipArchive;
		$res = $zip->open($file);
		if ($res === TRUE){
			$this->make_dir($this->get_path() . $path_to_extract);
		  $zip->extractTo($this->get_path() . $path_to_extract);
		  $zip->close();
		  return true;
		} else {
		  return $zip;
		}
	}
	
	function upload($file=array()){
		try{
			$file_name = $file['name'];
			$file_size = $file['size'];
			$file_tmp = $file['tmp_name'];
			$file_type = $file['type'];
			$file_exists = $this->check_file_exists($this->get_path().$file_name);
			
			if($file_exists && !$this->compare_files($file_name, $file_size)){
				$file_name = $this->rename_file($file_name);
			}else{
				$file_name = $file_name;
			}
			$file_path = $this->get_path() .$file_name;
			
			
			if($file_size > $this->asBytes(ini_get('upload_max_filesize'))){
				throw new Exception('File size cannot exceed '.ini_get('upload_max_filesize'));
			}else{
				$upload_file = move_uploaded_file($file_tmp, $file_path);
				if(!$upload_file){
					throw new Exception('File upload failed!');
				}
				$fileDetails['file_name'] = $file_name;
				$fileDetails['file_type'] = $file_type;
				$fileDetails['file_size'] = $file_size;
				$fileDetails['file_path'] = $file_path;
				$fileDetails['file_relative_path'] = $this->relative_path.$file_name;
			}
			$response["status"] = "success";
			$response["message"] = $file_name." uploaded successfully!";
			$response['data'] = $fileDetails;
		}catch(Exception $e){
			$response["status"] = "error";
			$response["message"] = 'Error: ' .$e->getMessage();
			$response["data"] = null;
			//echo json_encode($response);
		}
		return $response;
	}
}
?>