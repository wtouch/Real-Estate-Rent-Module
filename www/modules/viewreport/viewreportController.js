'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService','$routeParams' ,'$notification', 'dataService'];
    
    // This is controller for this view
	var viewreportController = function ($scope,$rootScope,$injector,modalService, $routeParams,$notification,dataService) {
		
		//global scope objects
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.currentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";		
		$scope.alerts = [];
		$scope.userInfo = {user_id : $rootScope.userDetails.id}; 
		$scope.currentDate = dataService.currentDate;
		$scope.currentDate = dataService.currentDate;
		$scope.dates ={};
		$scope.dates.date = $scope.currentDate;
		
		$scope.ok = function () {
			$modalInstance.close();
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		$scope.openRent = function (url) {
				//date picker
			var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
			};
			
			modalService.showModal(modalDefaults).then(function (result) {
				$scope.ok = function(){
					$modalInstance.close("ok");
				}
			});
		};
		
		$scope.today = function() {
			$scope.date = new Date();
		};
		$scope.open = function($event,rentdate){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.rentdate = ($scope.rentdate==true)?false:true;
		};
		$scope.opendate = function($event,selectDate){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.selectDate = ($scope.selectDate==true)?false:true;
		};
		
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
		
		
		
		$scope.postData = function(addincome) {
				 dataService.post("post/account/addincome",addincome)
				.then(function(response) {  
					if(response.status == "success"){
						//$scope.reset();
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Add record", response.message);
				});   
				console.log(addincome);
		}   
		
		 $scope.postDataExpence = function(addexpence) {
				 dataService.post("post/account/addexpence",addexpence)
				.then(function(response) {  
					if(response.status == "success"){
					
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Add record", response.message);
				});   
				console.log(addexpence);
		}   
		
		dataService.get("/getmultiple/account/1/"+$scope.pageItems)
			.then(function(response) {  //function for property response
				if(response.status == 'success'){
					$scope.account = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.account = {};
					$scope.totalRecords = {};
					$scope.alerts.push({type: response.status, msg: response.message});
				}				
			});
			
		
		//function for Users list response
		dataService.get("getmultiple/account/1/500", {status: 1, user_id : 1})
		.then(function(response) {  
		//console.log(response)
			/* if(response.status == 'success'){
				$scope.rentreport = response.data;
			}else{
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("View rent rteport", response.message);
			} */
		});
	};
		
	// Inject controller's dependencies
	viewreportController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('viewreportController', viewreportController);
});