'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService','$routeParams' ,'$notification', 'dataService'];
    
    // This is controller for this view
	var stockController = function ($scope,$rootScope,$injector,modalService, $routeParams,$notification,dataService) {
		
		//global scope objects
		$scope.invoice = true;
		$scope.type = "year";
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.Currentpage = 1;
		$scope.pageItems = 10000;
		$scope.numPages = "";		
		$scope.userInfo = {user_id : $rootScope.userDetails.id}; 
		$scope.currentDate = dataService.currentDate;
		
		$scope.currentDate = dataService.currentDate;
		$scope.hideDeleted = "";
		$scope.today = new Date();
		$scope.todayDt = $scope.today.getFullYear() + "-" + ($scope.today.getMonth() + 1) + "-" + $scope.today.getDate();
		$scope.duration = {start : $scope.todayDt};

		$scope.transactionParams = {status: 1, user_id : $rootScope.userDetails.id, group_by : 'account_no'};
		
		$scope.toDate = function(date){
			return new Date(date);
		}
		
		$scope.openAddstock = function (url,addstock) {
		var modalDefaults = {
				templateUrl: url,	// apply template to modal
				size : 'lg'
			};
			var modalOptions = {
				date : $scope.currentDate,
				addstock : (addstock) ? addstock : {},
				postData : function(addstock) {
					 dataService.post("post/stock",addstock)
					.then(function(response) {  
						if(response.status == "success"){
							$scope.getStock($scope.Currentpage)
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Add record", response.message);
					}); 
				},
				getData : function(id, modalOptions) {
					var stock = {stock : "goods_name"};
					 dataService.get("getsingle/stock/"+id,stock)
					.then(function(response) { 
						
						if(response.status == "success"){
							modalOptions.previousBalance = response.data.balance;
							
						}else{
							modalOptions.previousBalance = 0;
							if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
							$notification[response.status]("", response.message);
						}
					});   
				},
				updateData : function(id,addstock) {
					dataService.put("put/stock/"+id,addstock)
					.then(function(response) {
						if(response.status == "success"){
							/*$scope.getStock($scope.Currentpage)*/
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Add record", response.message);
					});
			   }
			};
			modalService.showModal(modalDefaults, modalOptions).then(function (result) {
			modalOptions.addstock.date = dataService.currentDate; 
				console.log("modalOpened");
		
		});	
		};
		
/***************************************************************/
	$scope.getStock = function(page){
		dataService.get("getmultiple/stock/"+page+"/"+$scope.pageItems)
		.then(function(response) {
			if(response.status == 'success'){
				$scope.addstock = response.data;
				$scope.totalRecords = response.totalRecords;
			}else{
				$scope.addstock = [];
				$scope.totalRecords = 0;
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Get Transactions", response.message);
			}
		});
	}	
/************************************************************/
	$scope.deleted = function(id, status){
		 var x = confirm("Do you really want to delete this.");
		 if(x){
		$scope.deletedData = {status : status};
		dataService.delete("delete/stock/"+id, $scope.deletedData)
		.then(function(response) { 
			console.log(response);
			if(response.status == 'success'){
				//$scope.hideDeleted = 1;
			}
			if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
			$notification[response.status]("The Account is deleted", response.message);
		});
		 }
		 else{
			 alert("cancelled");
		 }
	};
/******************************************************************************/
//Print function for printing purpose		
		$scope.printDiv = function(divName) {
			var printContents = document.getElementById(divName).innerHTML;
			var popupWin = window.open('', '_blank', 'width=1000,height=620');
			popupWin.document.open()
			popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" /><link rel="stylesheet" type="text/css" href="css/style.css" /></head><body onload="window.print()">' + printContents + '</html>');
			popupWin.document.close();
		}
/*******************************************************************/
		$scope.getTransaction = function(page, transactionParams, group_by){
			transactionParams = (transactionParams) ? transactionParams : $scope.transactionParams;

			dataService.get("getmultiple/transaction/1/10000", transactionParams)
			.then(function(response) {
				if(response.status == 'success'){
					$scope.transaction = response.data;
					$scope.credit = response.credit_amount;
					$scope.debit = response.debit_amount;
					$scope.balance = $scope.credit - $scope.debit;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.transaction = [];
					$scope.totalRecords = 0;
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Transactions", response.message);
				}
			});
		}
		
		$scope.getReceivables = function(){
			var Params = {user_id : $rootScope.userDetails.id};
			
			dataService.get("getmultiple/invoice/1/10000", Params)
			.then(function(response) {
				if(response.status == 'success'){
					$scope.totalReceivables = 0;
					for(var x in response.data){
						$scope.totalReceivables += parseFloat(response.data[x].due_amount);
					}
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.transaction = [];
					$scope.totalRecords = 0;
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Transactions", response.message);
				}
			});
		}
/***************************************************************************************/
		$scope.calcDuration = function(type, duration){
			//console.log(type, duration);
			var curDate = new Date();
			if(type == 'year'){
				duration = parseInt(duration);
				var today = new Date();
				var start = new Date(duration, 3, 1);
				var endt = new Date(duration + 1, 3, 1);
				
				var startDt = start.getFullYear() +"-" + (start.getMonth() + 1) + "-"+start.getDate();
				var endtDt = endt.getFullYear() +"-" + (endt.getMonth() + 1) + "-"+ (endt.getDate());
			}
			
			$scope.transactionParams.endtDt = endtDt;
			$scope.transactionParams.startDt = startDt;
			$scope.getTransaction($scope.page, $scope.transactionParams);
		}
/**************************************************************/
	};
		
	// Inject controller's dependencies
	stockController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('stockController', stockController);
});