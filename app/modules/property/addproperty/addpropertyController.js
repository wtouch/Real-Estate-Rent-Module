'use strict';
define(['app'], function (app) {
    var injectParams = ['$scope', '$injector','$routeParams','$http','$rootScope','upload', '$timeout', 'dataService','$location','$notification'];
    // This is controller for this view
	var addpropertyController = function ($scope, $injector,$routeParams,$http,$rootScope, upload, $timeout,
	dataService,$location,$notification) {
		$rootScope.metaTitle = "Add Real Estate Property";
		propertyConfig
		// all $scope object goes here
		$scope.userInfo = {user_id : $rootScope.userDetails.id};
		$scope.currentDate = dataService.currentDate;
		$scope.property = { property_images : []};
		$scope.editId = $routeParams.id;
		
		//function for Users list response
		dataService.get("getmultiple/user/1/500", {status: 1, user_id : $rootScope.userDetails.id})
		.then(function(response) {  
			if(response.status == 'success'){
				$scope.customerList = response.data;
			}else{
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Get Customers", response.message);
			}
		});
	/*****************************************************************************/
		// this function for uploading files
		$scope.upload = function(files,path,userInfo, picArr){
			console.log($scope.property);
			upload.upload(files,path,userInfo,function(data){
				if(data.status === 'success'){
					$scope.property[picArr].push(data.data);
				}else{
					$scope.alerts.push({type: data.status, msg: data.message});
				}
			});
		};
		$scope.generateThumb = function(files){  
			upload.generateThumbs(files);
		};
	/*********************************************************************************/
		// Add Business multi part form show/hide operation from here! 
		$scope.formPart = 'property';
		$scope.showFormPart = function(formPart){
			$scope.formPart = formPart;
		};
		dataService.get('getmultiple/property/1/50', $scope.userInfo).then(function(response){
				$scope.addPropStruct = response.data;				
		});
		/************************************************************************************/
		$scope.openProperty = function (url) {
			dataService.config('config', {config_name : "property"}).then(function(response){
				console.log(response);
				var modalDefaults = {
					templateUrl: url,
					size : 'lg'
				};
				var modalOptions = {
					propertyConfig : response.config_data,
					Date :  $scope.currentDate,
					userInfo : {user_id : $rootScope.userDetails.id},
					property : { property_images : []}
					//property.user_id : $rootScope.userDetails.id
				};
				modalService.show(modalDefaults, modalOptions).then(function (result) {
					
				});
			});
		};
		/************************************************************************************/
		
		//Add property
		$scope.addPropertyFun = function(property){	
			$scope.property.user_id= $rootScope.userDetails.id;
			$scope.property.date = $scope.currentDate;
			dataService.post("post/property",property,$scope.userInfo)
			.then(function(response) {
				if(response.status=="success"){
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Add record", response.message);
					
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("", response.message);
				}
			});
		};
		//update into property
		if($scope.editId){//Update user
			updateData : function(account) {
					dataService.put("put/account/"+EditId,account)
					.then(function(response) {
						if(response.status == "success"){
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Add record", response.message);
					});
			   }
			   
			};
			if(EditId){
				dataService.get("getsingle/account/"+EditId)
				.then(function(response) {  
					if(response.status == "success"){
						modalOptions.account = {
							account_name : response.data.account_name,
							account_no : response.data.account_no,
							category : response.data.category,
							user_id : response.data.user_id,
							id : response.data.id,
							description : response.data.description,
							date : response.data.description
						};
						modalService.show(modalDefaults,modalOptions).then(function (result) {
						});
					}
					console.log(response);
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				});
			}else{
				modalService.show(modalDefaults,modalOptions).then(function (result) {
				});
			}
			$scope.update = function(property){
				dataService.put("put/property/"+$routeParams.id,property)
				.then(function(response) { //function for response of request temp
					if(response.status == 'success'){
						$scope.submitted = true;
						$scope.alerts.push({type: response.status,msg: response.message});						
					}else{
						$scope.alerts.push({type: response.status, msg: response.message});
					}	
				});	  
			};	 
		}			
	};		
	// Inject controller's dependencies
	addpropertyController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('addpropertyController', addpropertyController);
	
});
