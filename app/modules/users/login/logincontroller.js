
'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope', '$injector','dataService','$location', '$cookieStore', '$cookies', '$routeParams','$notification'];

    // This is controller for this view
	var loginController = function ($scope,$rootScope,$injector,dataService,$location, $cookieStore, $cookies,$routeParams,$notification) {
		
		//function to login user
		$scope.insert = function(login){
			dataService.post("post/user/login",$scope.login)
			.then(function(response) {
				if(response.status == 'success'){
					$location.path("/dashboard");
					dataService.setUserDetails(dataService.parse(response.data));
					if($scope.login.remember){
						dataService.rememberPass(true);
					}
					dataService.setAuth(true);
					$rootScope.userDetails = dataService.userDetails;
				}
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Login", response.message);
			})
		}
		
		//function to forgot password
		$scope.forgotpass = function(forgot) {
			dataService.post("post/user/forgotpass",forgot)
			.then(function(response) {
				if(response.status == 'success'){
					$scope.forgot = response.data;
					$location.path("/login");
				}
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Login", response.message);
			})
		} 	
		
		//function to match password
		$scope.passMatch = function(pass1, pass2){
			$scope.pass = (pass1===pass2) ? true : false;
		}
		// function to change password
		$scope.changepasswd = function(changepass) {
			var urlParams = {reset : $routeParams.resetPassKey}
			dataService.post("post/user/changepass",changepass,urlParams)
			.then(function(response) {
				if(response.status == 'success'){
					$scope.changepass = {};
				}
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Login", response.message);
			})  
		}
		
		// Auto activate account
		if($routeParams.activateKey && $routeParams.email){
			$scope.activatePass = ($routeParams.pass) ? JSON.parse($routeParams.pass) : false;
			$scope.changePassword = function(changepass) {
				var urlParams = {activate : $routeParams.activateKey, email : $routeParams.email};
				if(changepass != (undefined || "")) angular.extend(urlParams, changepass);
				dataService.get("login/activate",urlParams)
				.then(function(response) {
					if(response.status == 'success'){
						$scope.changepass = {};
						$scope.activate = true;
					}else{
						$scope.activate = false;
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Login", response.message);
				})  
			}
			if($scope.activatePass == false) $scope.changePassword();
			$scope.resendLink = function(){
			}
		}
	};
	// Inject controller's dependencies
	loginController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('loginController', loginController);
});
