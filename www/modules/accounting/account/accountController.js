'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService','$routeParams' ,'$notification', 'dataService'];
    
    // This is controller for this view
	var accountController = function ($scope,$rootScope,$injector,modalService, $routeParams,$notification,dataService) {
		
		//global scope objects
		$scope.account = true;
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
		$scope.today = new Date();
		$scope.todayDt = $scope.today.getFullYear() + "-" + ($scope.today.getMonth() + 1) + "-" + $scope.today.getDate();
		$scope.duration = {start : $scope.todayDt};
		//addincome.description.payment_type.date
/***********************************************************************************/
/*Addaccount Model*/
		$scope.openAddaccount = function (url,EditId) {
			dataService.get("getmultiple/user/1/500", {status: 1, user_id : $rootScope.userDetails.id})
			.then(function(response) {
			var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
			};
			var modalOptions={
				editAccount : EditId,
				customerList : (response.data),
				date : $scope.currentDate,
				account : {},
				postData : function(account) {
					dataService.post("post/account",account)
					.then(function(response) {  
						if(response.status == "success"){
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Add record", response.message);
					});
			   },
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
			});
		};
/***********************************************************************************/
		$scope.getAccounts = function(page){
			dataService.get("getmultiple/account/"+page+"/"+$scope.pageItems, $scope.userInfo)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.accounts = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Customers", response.message);
				}
			});
			}
/***********************************************************/
/*Delete Account Funtion*/
			$scope.deleted = function(id, status){
				$scope.deletedData = {status : status};
				dataService.put("put/account/"+id, $scope.deletedData)
				.then(function(response) { 
					if(response.status == 'success'){
						$scope.hideDeleted = 1;
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Delete Property", response.message);
				});
			};
/**************************************************************/
	};
		
	// Inject controller's dependencies
	accountController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('accountController', accountController);
});