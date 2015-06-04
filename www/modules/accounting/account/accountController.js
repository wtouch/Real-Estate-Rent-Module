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
		$scope.openAddaccount = function (url,account) {
			var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
			};
			var modalOptions={
				date : $scope.currentDate,
				account : (account) ? account : {},
				getParty: function(modalOptions){
					dataService.get("getmultiple/user/1/100", {status: 1, user_id : $rootScope.userDetails.id}).then(function(response){
						modalOptions.customerList = (response.data);
					});
				},
				postData : function(account) {
					dataService.post("post/account",account)
					.then(function(response) {  
						if(response.status == "success"){
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Add record", response.message);
					});
			   },
			   updateData : function(id,account) {
					dataService.put("put/account/"+id,account)
					.then(function(response) {
						if(response.status == "success"){
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Add record", response.message);
					});
			   }
			   
			};
			modalService.show(modalDefaults,modalOptions).then(function (result) {
				if(modalOptions.account.id != undefined){
					modalOptions.updateData(modalOptions.account.id, modalOptions.account);
				}else{
					modalOptions.postData(modalOptions.account);
				}
				
			});
		};
/***********************************************************************************/
/*Delete Account Funtion*/
			$scope.deleted = function(id, status){
				 var x = confirm("Do you really want to delete this.");
				 if(x){
				$scope.deletedData = {status : status};
				dataService.delete("delete/account/"+id, $scope.deletedData)
				.then(function(response) { 
					if(response.status == 'success'){
						$scope.hideDeleted = 1;
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("The Account is deleted", response.message);
				});
				 }
				 else{
					 alert("cancelled");
				 }
			};
/**************************************************************/
$scope.changeStatus = function(page, column, value, search) {
			$scope.filterStatus = ($scope.filterStatus) ? $scope.filterStatus : {status: 1, user_id : $rootScope.userDetails.id};
			(value == "none") ? delete $scope.filterStatus[column] : $scope.filterStatus[column] = value;
			
			if(column == 'user_id' && value == null) {
				angular.extend($scope.filterStatus, $scope.userInfo);
			}
			
			if(search == true && value == ""){
				delete $scope.filterStatus.search;
				delete $scope.filterStatus[column];
			}else{
				$scope.filterStatus.search = search;
			}

			if((search == true && value.length <= 3 && value.length != 0)){
				return false;
			}
			
			dataService.get("getmultiple/account/"+page+"/"+$scope.pageItems,$scope.filterStatus)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.accounts = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.accounts = {};
					$scope.totalRecords = {};
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get a List", response.message);
				}
			});
		};
/**************************************************************/
	};
		
	// Inject controller's dependencies
	accountController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('accountController', accountController);
});