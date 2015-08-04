'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService','$routeParams' ,'$notification', 'dataService'];
    
    // This is controller for this view
	var accountingController = function ($scope,$rootScope,$injector,modalService, $routeParams,$notification,dataService) {
		
		//global scope objects
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.currentPage = 1;
		$scope.rentreportCurrentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";		
		$scope.alerts = [];
		$scope.userInfo = {user_id : $rootScope.userDetails.id}; 
		//$scope.currentDate = dataService.currentDate;
		var curDate = new Date();
		var curMonth = curDate.getMonth() + 1;
		curMonth = (curMonth <= 9) ? '0' + curMonth : curMonth;
		$scope.currentDate = curDate.getFullYear() + "-" + curMonth + "-" + curDate.getDate();
		
		$scope.dates = {};
		$scope.dates.date = $scope.currentDate;
		$scope.today = new Date();
		$scope.todayDt = $scope.today.getFullYear() + "-" + ($scope.today.getMonth() + 1) + "-" + $scope.today.getDate();
		$scope.duration = {start : $scope.todayDt};
/***************************************************************/
		 $scope.getInvoices = function(page){
			 $scope.filterStatus = {status: 1, user_id: $rootScope.userDetails.id, groupBy : 'invoice_id', orderBy : 'due_date', payment_status : 0 };
			dataService.get("getmultiple/invoice/"+page+"/"+$scope.pageItems,$scope.filterStatus)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.invoices = response.data;
					$scope.total_paid = response.total_paid;
					$scope.total_due = response.total_due;
					$scope.total_amount = response.total_rent;
					$scope.totalRecords = response.totalRecords;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$scope.invoices = {};
					$scope.total_paid = 0;
					$scope.total_due = 0;
					$scope.total_amount = 0;
					$scope.totalRecords = response.totalRecords;
				}
			});
			}
/*****************************************************************/	
	//code to get transaction details
	 $scope.getTrans = function(page){
		 $scope.filterStatus = {status: 1, user_id: $rootScope.userDetails.id, groupBy : 'account_no', orderBy : 'type', type: "income" };
		dataService.get("getmultiple/transaction/"+page+"/"+$scope.pageItems,$scope.filterStatus)
		.then(function(response) {  
			if(response.status == 'success'){
				$scope.transdata = response.data;
				console.log(response.data);
				/* $scope.total_paid = response.total_paid;
				$scope.total_due = response.total_due;
				$scope.total_amount = response.total_rent;
				$scope.totalRecords = response.totalRecords; */
			}else{
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$scope.invoices = {};
				console.log(response.message);
			/* 	$scope.total_paid = 0;
				$scope.total_due = 0;
				$scope.total_amount = 0;
				$scope.totalRecords = response.totalRecords; */
			}
		});
	}
	
/******************************************************************/
	
	};
		
	// Inject controller's dependencies
	accountingController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('accountingController', accountingController);
});