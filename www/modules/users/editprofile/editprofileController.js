
'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope', '$injector','dataService','$location', '$cookieStore', '$cookies','upload','$notification'];
	
	var editprofileController = function ($scope,$rootScope,$injector,dataService,$location, $cookieStore, $cookies,upload,$notification) {
		$scope.userInfo = {user_id : $rootScope.userDetails.id};
		$scope.path = "user/profile/"+$scope.userInfo.user_id; // path to store images on server
		$scope.formats = ['yyyy/MM/dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.format = $scope.formats[0];
		
		$scope.today = function() {
			$scope.dt = new Date();
		};
		$scope.open = function($event){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.opened =true;
		};
		$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
		};
		//function for match password
		$scope.passMatch = function(pass1, pass2){
			$scope.pass = (pass1===pass2) ? true : false;
		}
		//to generate thumb for image
		$scope.generateThumb = function(files){  
			upload.generateThumbs(files);
		};
		
		$scope.getData = function(location){
			$scope.readOnly = true;
			$scope.editprofile.address.location = location.location;
			$scope.editprofile.address.city = location.city;
			$scope.editprofile.state = location.state;
			$scope.editprofile.country = location.country;
			$scope.editprofile.address.area = location.area;
			$scope.editprofile.address.pincode = location.pincode;
		}
		$scope.getTypeaheadData = function(table, searchColumn, searchValue){
			var locationParams = {search : {}}
			locationParams.search[searchColumn] = searchValue;
			return dataService.config('locations', locationParams).then(function(response){
				return response;
			});
		}
		
		//code for change profile 
		dataService.get("getsingle/user/"+$rootScope.userDetails.id)
		.then(function(response) {
			$scope.editprofile = dataService.parse(response.data);
			if($scope.editprofile.user_img == (undefined)) $scope.editprofile.user_img = "";
		});
		
		//Upload Function for uploading files 
		$scope.upload = function(files,path,userInfo,picArr){ // this function for uploading files
			upload.upload(files,path,userInfo,function(response){
				var picArrKey = 0, x;
				for(x in picArr) picArrKey++;
				if(response.status === 'success'){
					$scope.editprofile.user_img = response.data.file_relative_path;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Upload Image", response.message);
				}
			});
		};
		
		// function for edit your profile
		$scope.changeProfile = function(id,editprofile){
			dataService.put("put/user/"+id,editprofile)
			.then(function(response) {
				if(response.status == 'success'){
					$scope.editProfileForm.$setPristine();
					angular.extend($rootScope.userDetails,editprofile);
					console.log($rootScope.userDetails);
					dataService.setUserDetails(($rootScope.userDetails));
					$rootScope.userDetails = dataService.parse(dataService.userDetails);
				}
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Edit Profile", response.message);
			}) 
		}	
		
		//code for change password 
		$scope.changepassword = function(changepasswd) {
			$scope.userID = {user_id : $rootScope.userDetails.id };
			angular.extend(changepasswd, $scope.userID);
			dataService.post("post/user/changepass",changepasswd)
			.then(function(response) {
				if(response.status == 'success'){
					$scope.changepasswd = {};
					$scope.changepassForm.$setPristine();
				}
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Change Password", response.message);
			})  
		}
    };
	// Inject controller's dependencies
	editprofileController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('editprofileController', editprofileController);
});
