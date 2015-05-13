'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService','$routeParams' ,'$notification', 'dataService'];
    
    // This is controller for this view
	var viewreportController = function ($scope,$rootScope,$injector,modalService, $routeParams,$notification,dataService) {
		
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
		
		//code for search filter
		$scope.searchFilter = function(statusCol, showStatus) {
			$scope.search = {search: true};
			$scope.filterStatus= {};
			$scope.rentParam={};
			(showStatus =="") ? delete $scope.rentParam[statusCol] : $scope.filterStatus[statusCol] = showStatus;
			angular.extend($scope.rentParam, $scope.filterStatus);
			angular.extend($scope.rentParam, $scope.search);
			if(showStatus.length >= 4 || showStatus == ""){
			dataService.get("getmultiple/account/1/"+$scope.pageItems, $scope.rentParam)
			.then(function(response) {  //function for websitelist response
				if(response.status == 'success'){
					$scope.account = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.account = {};
					$scope.totalRecords = {};
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Search Account Data", response.message);
				}
			});
			}
		}; 
		$scope.pageChanged = function(page, where) {
			dataService.get("getmultiple/account/"+page+"/"+$scope.pageItems,$scope.income_expence_type)
			.then(function(response){ 
				$scope.account = response.data;
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
		
		//get data from rent-receipt table
		$scope.getPropertylist = function(userId){
			var user_id = {user_id : userId};
			dataService.get("getmultiple/rentreceipt/1/1000", user_id)
				.then(function(response) {
					if(response.status == "success"){
						$scope.receiptList = response.data;
					}
			})
		}
		
		//get data from rent-receipt table
	
			dataService.get("getmultiple/property/1/1000", $scope.userInfo)
				.then(function(response) {
					console.log(response);
					if(response.status == "success"){
						$scope.propertyList = response.data;
						console.log($scope.propertyList);
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
		
		
		$scope.getIncome = function(dateRange){
			var expenseParams = {balancesheet_type : 'income'};
			angular.extend(expenseParams, dateRange);
			dataService.get("getmultiple/account/1/"+$scope.pageItems, expenseParams)
			.then(function(response) {  //function for property response
				if(response.status == 'success'){
					
					$scope.income = response.data;
					
					var total = 0;
					for(var i = 0; i < response.data.length; i++){
						var product = response.data[i];
						total += parseInt(product.amount);
					}
					$scope.incomTotal = total;
					
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.income = [];
					$scope.incomTotal = "";
					$scope.totalRecords = {};
					$scope.alerts.push({type: response.status, msg: response.message});
				}				
			});
		}

		$scope.getExpense = function(dateRange){
			var expenseParams = {balancesheet_type : 'expence'};
			angular.extend(expenseParams, dateRange);
			dataService.get("getmultiple/account/1/"+$scope.pageItems, expenseParams)
			.then(function(response) {  //function for property response
				if(response.status == 'success'){
					var total = 0;
					for(var i = 0; i < response.data.length; i++){
						var product = response.data[i];
						total += parseInt(product.amount);
					}
					$scope.expenceTotal = total;
					$scope.expence = response.data;
					$scope.totalRecords = response.totalRecords;
					console.log($scope.expence);
				}else{
					$scope.expence = [];
					$scope.expenceTotal = "";
					$scope.totalRecords = {};
					$scope.alerts.push({type: response.status, msg: response.message});
				}
			});
		}
		
		$scope.calcDuration = function(type, duration){
			//console.log(type, duration);
			if(type == 'custom'){
				var dateS = new Date(duration.start);
				var dateE = new Date(duration.end);
				var startDt = dateS.getFullYear() + "-" + (dateS.getMonth() + 1) + "-" + dateS.getDate();
				var endtDt = dateE.getFullYear() + "-" + (dateE.getMonth() + 1) + "-" + dateE.getDate();
			}
			if(type == 'daily'){
				var dateS = new Date(duration.start);
				var startDt = dateS.getFullYear() + "-" + (dateS.getMonth() + 1) + "-" + dateS.getDate();
				var endtDt = dateS.getFullYear() + "-" + (dateS.getMonth() + 1) + "-" + dateS.getDate();
			}
			if(type == 'month'){
				duration = parseInt(duration);
				var today = new Date();
				var start = new Date(today.getFullYear(), (duration - 1), 1);
				var endt = new Date(today.getFullYear(), (duration - 1) + 1, 0);
				
				var startDt = start.getFullYear() +"-" + (start.getMonth() + 1) + "-"+start.getDate();
				var endtDt = endt.getFullYear() +"-" + (endt.getMonth() + 1) + "-"+ endt.getDate();
			}
			if(type == 'year'){
				duration = parseInt(duration);
				var today = new Date();
				var start = new Date(duration, 3, 1);
				var endt = new Date(duration + 1, 2 + 1, 0);
				
				var startDt = start.getFullYear() +"-" + (start.getMonth() + 1) + "-"+start.getDate();
				var endtDt = endt.getFullYear() +"-" + (endt.getMonth() + 1) + "-"+ endt.getDate();
			}
			$scope.getIncome({startDt : startDt, endtDt : endtDt});
			$scope.getExpense({startDt : startDt, endtDt : endtDt});
			
		}
		$scope.today = new Date();
		$scope.today = $scope.today.getFullYear() + "-" + ($scope.today.getMonth() + 1) + "-" + $scope.today.getDate();
		$scope.calcDuration('daily', {start : $scope.today});
		
	};
		
	// Inject controller's dependencies
	viewreportController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('viewreportController', viewreportController);
});