'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService','$routeParams' ,'$notification', 'dataService'];
    
    // This is controller for this view
	var transactionController = function ($scope,$rootScope,$injector,modalService, $routeParams,$notification,dataService) {
		
		//global scope objects
		$scope.transaction = true;
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
		$scope.dates = {};
		$scope.dates.date = $scope.currentDate;
		$scope.today = new Date();
		$scope.todayDt = $scope.today.getFullYear() + "-" + ($scope.today.getMonth() + 1) + "-" + $scope.today.getDate();
		$scope.duration = {start : $scope.todayDt};
		//addincome.description.payment_type.date
		$scope.openRent = function (url) {
				//date picker
			var modalDefaults = {
				templateUrl: url,	
				size : 'lg'
			};
			
			modalService.showModal(modalDefaults).then(function (result) {
			});
		};
		
		var account = {account : "HDFC"};
		dataService.get("getsingle/transaction/9", account)
		.then(function(response){ 
			console.log(response);
		});
		
		$scope.open = function($event,rentdate){
			$event.preventDefault();
			$event.stopPropagation();
			$scope[rentdate] = !$scope[rentdate];
		};
		
	//Modlal For add income form
/************************************************************/
	$scope.incomeDate = {};
	$scope.openAddincome = function (url) {
		dataService.get("getmultiple/user/1/500", {status: 1, user_id : $rootScope.userDetails.id})
			.then(function(user) {  
		dataService.config('config', {config_name : "category"}).then(function(response){
		
		dataService.get("getmultiple/account/1/100", {status: 1, user_id : $rootScope.userDetails.id})
			.then(function(account) { 
			var modalDefaults = {
				templateUrl: url,	// apply template to modal
				size : 'lg'
			};
			var modalOptions = {
				incomeDate: { date : $scope.currentDate},
				customerList : (user.data),
				accountList : (account.data),
				categoryConfig : response.config_data,
				postData : function(addincome) {
					//$scope.addincome.user_id= $rootScope.userDetails.id;
					 dataService.post("post/transaction/addincome",addincome)
					.then(function(response) {  
						if(response.status == "success"){
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Add record", response.message);
					});   
					console.log(addincome);
				} // 

			}; 
		modalService.show(modalDefaults, modalOptions).then(function (result) {
			modalOptions.addincome.date = dataService.currentDate;
				console.log("modalOpened");
		
		});	
		
		});
		});
		});
		
		};
/*************************************************************************/		
		//Modal for add expence
		$scope.expenseDate = {};
		$scope.openAddexpense = function (url) {
		dataService.config('config', {config_name : "category"}).then(function(response){
		dataService.get("getmultiple/account/1/100", {status: 1, user_id : $rootScope.userDetails.id})
			.then(function(account) { 
		var modalDefaults = {
				templateUrl: url,	// apply template to modal
				size : 'lg'
			};
		var modalOptions = {
			expenseDate: { date : $scope.currentDate},
			categoryConfig : response.config_data,
			accountList : (account.data),
			postDataExpence : function(addexpence) {
				//$scope.addexpence.user_id= $rootScope.userDetails.id;
				 dataService.post("post/transaction/addexpence",addexpence)
				.then(function(response) {  
					if(response.status == "success"){
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Add record", response.message);
				});   
				console.log(addexpence);
				} // 
		};
		modalService.show(modalDefaults, modalOptions).then(function (result) {
			modalOptions.addexpence.date = dataService.currentDate;
				console.log("modalOpened");
		
		});	
		});	
		});
		};
		
		/***************************************************************/
		$scope.getTransaction = function(page){
			if(!page) page = 1;
			var transactionParams = {status: 1, user_id : $rootScope.userDetails.id};
			dataService.get("getmultiple/transaction/"+page+"/"+$scope.pageItems, transactionParams)
			.then(function(response) {
				if(response.status == 'success'){
					$scope.transaction = response.data;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Transactions", response.message);
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
		}
		
		
	};
		
	// Inject controller's dependencies
	transactionController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('transactionController', transactionController);
});