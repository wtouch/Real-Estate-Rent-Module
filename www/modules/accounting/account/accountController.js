'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService','$routeParams' ,'$notification', 'dataService'];
    
    // This is controller for this view
	var accountController = function ($scope,$rootScope,$injector,modalService, $routeParams,$notification,dataService) {
		
		//global scope objects
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.currentPage = 1;
		$scope.rentreportCurrentPage = 1;
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
			console.log(EditId);
			var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
			};
			var modalOptions={
				editAccount : EditId,
				date : $scope.currentDate,
				account : {},
				postData : function(account) {
					dataService.post("post/account/account",account)
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
							account_no : response.data.account_no,
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
					$notification[response.status]("Add record", response.message);
				});
			}else{
				modalService.show(modalDefaults,modalOptions).then(function (result) {
				});
			}
		};
/***********************************************************************************/
		$scope.pageChanged = function(page, where) {
			dataService.get("getmultiple/account/"+page+"/"+$scope.pageItems,$scope.income_expence_type)
			.then(function(response){ 
				$scope.account = response.data;
			});
		};
		
		$scope.open = function($event,rentdate){
			$event.preventDefault();
			$event.stopPropagation();
			$scope[rentdate] = !$scope[rentdate];
		};
		
		$scope.getUsers = function(){
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
		}
		
		//get data from rent-receipt table
		$scope.getPropertylist = function(userId, reportType){
			if (reportType == 'user') $scope.rentParams = { user_id : userId };
			if (reportType == 'property') $scope.rentParams = {property_id : userId, user_id : $rootScope.userDetails.id };
			
			dataService.get("getmultiple/rentreceipt/1/1000", $scope.rentParams)
				.then(function(response) {
					if(response.status == "success"){
						$scope.receiptList = response.data;
						$scope.total_due = response.total_due;
						$scope.total_paid = response.total_paid;
						$scope.total_rent = response.total_rent;
						console.log($scope.receiptList);
					}else{
						$scope.receiptList="";
					}
			})
		}
/************************************************************/	
		//get data from rent-receipt table
			dataService.get("getmultiple/account/1/1000")
				.then(function(response) {
					if(response.status == "success"){
						$scope.accounts = response.data;
					}else{
						$scope.accounts="";
					}
			});
/***********************************************************/		
	};
		
	// Inject controller's dependencies
	accountController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('accountController', accountController);
});