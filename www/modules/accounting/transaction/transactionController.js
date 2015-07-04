'use strict';
define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService','$routeParams' ,'$notification', 'dataService'];
    
    // This is controller for this view
	var transactionController = function ($scope, $rootScope, $injector, modalService, $routeParams, $notification, dataService) {
		
		//global scope objects
		$scope.transactionView = true;
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.CurrentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";	
		$scope.userInfo = {user_id : $rootScope.userDetails.id}; 
		$scope.currentDate = dataService.currentDate;
		$scope.hideDeleted = "";
		$scope.today = new Date();
		$scope.todayDt = $scope.today.getFullYear() + "-" + ($scope.today.getMonth() + 1) + "-" + $scope.today.getDate();
		$scope.duration = {start : $scope.todayDt};

		$scope.transactionParams = {status: 1, user_id : $rootScope.userDetails.id};
		
		$scope.toDate = function(date){
			return new Date(date);
		}
		//for dynamic tooltip
		$scope.dynamicTooltip = function(status, active, notActive){
			return (status==1) ? active : notActive;
		};	
		
		//Delete button 
		$scope.deleted = function(id, status){
			$scope.deletedData = {status : status};
			dataService.delete("delete/transaction/"+id, $scope.deletedData)
			.then(function(response) {
				if(response.status == 'success'){
					$scope.hideDeleted = 1;
				}
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status](response.message);
			});
		};	
		
		//datepicker
		$scope.open = function($event,rentdate){
			$event.preventDefault();
			$event.stopPropagation();
			$scope[rentdate] = !$scope[rentdate];
		};
		/***********************************************************************************/
		//this is global method for filter 
		$scope.changeStatus = function(statusCol, showStatus) {
			
			(showStatus =="") ? delete $scope.transactionParams[statusCol] : $scope.transactionParams[statusCol] = showStatus;
			
			if(statusCol == 'user_id' && showStatus == null) {
				angular.extend($scope.transactionParams, $scope.userInfo);
			}
			$scope.getTransaction($scope.CurrentPage);
		};
	/******************************************************************************************/
		dataService.config('config', {config_name : "category"}).then(function(response){
			$scope.categoryConfig = response.config_data;
		});
	
	/*****************************************************************************************/
		$scope.getAccount = function(){
			dataService.get("getmultiple/account/1/100", {status: 1, user_id : $rootScope.userDetails.id}).then(function(response){
				if(response.status == 'success'){
						$scope.accountList = response.data;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Customers", response.message);
				}
			});
		} 
	/******************************************************************************************/
		//Modlal For add income form
		$scope.openAddincome = function (url) {
			dataService.config('config', {config_name : "category"}).then(function(response){
			dataService.get("getmultiple/account/1/100", {status: 1, user_id : $rootScope.userDetails.id}).then(function(account){
				var modalDefaults = {
					templateUrl: url,	// apply template to modal
					size : 'lg'
				};
				var modalOptions = {
					incomeDate : { date : $scope.currentDate},
					accountList : account.data,
					addincome : {},
					categoryConfig : response.config_data,
					amount : response.data,
					
					totalAmount : function(modalOptions){
						if(modalOptions.addincome == undefined) modalOptions.addincome = {};
						modalOptions.addincome.balance = Math.round(parseFloat(modalOptions.previousBalance) + parseFloat(modalOptions.addincome.credit_amount));
					},
					postData : function(addincome) {
						 dataService.post("post/transaction",addincome)
						.then(function(response) {  
							if(response.status == "success"){
								
							}
							if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
							$notification[response.status]("Add record", response.message);
						}); 
					},
					getData : function(id, modalOptions) {
						var account = {account : "account_name"};
						 dataService.get("getsingle/transaction/"+id,account)
						.then(function(response) { 
							
							if(response.status == "success"){
								modalOptions.previousBalance = response.data.balance;
								
							}else{
								modalOptions.previousBalance = 0;
								if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
								$notification[response.status]("", response.message);
							}
						});   
					}
				
				}; 
				modalService.show(modalDefaults, modalOptions).then(function (result) {
					
				});
			});
			});
			};
		/*************************************************************************/		
		//Modal for add expence
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
						addexpence :{},
						totalAmount : function(modalOptions){
							if(modalOptions.addexpence == undefined) modalOptions.addexpence = {};
							modalOptions.addexpence.balance = Math.round(parseFloat(modalOptions.previousBalance) - parseFloat(modalOptions.addexpence.debit_amount));
						},
						postDataExpence : function(addexpence) {
							dataService.post("post/transaction",addexpence)
							.then(function(response) {  
								if(response.status == "success"){
									
								}
								if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
								$notification[response.status]("Add record", response.message);
							});   
							console.log(addexpence);
							},
							getData : function(id, modalOptions) {
								var account = {account : "account_name"};
								 dataService.get("getsingle/transaction/"+id,account)
								.then(function(response) { 
									
									if(response.status == "success"){
										modalOptions.previousBalance = response.data.balance;
										
									}else{
										if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
										$notification[response.status]("", response.message);
									}
								});   
							}
					};
					modalService.show(modalDefaults, modalOptions).then(function (result) {
						modalOptions.addexpence.date = dataService.currentDate;
							console.log("modalOpened");
					});	
				});	
			});
		};
/***************************************************************/
		$scope.transfer = function (url) {
			dataService.get("getmultiple/account/1/100", {status: 1, user_id : $rootScope.userDetails.id}).then(function(response){
			var modalDefaults = {
					templateUrl: url,	// apply template to modal
					size : 'lg'
				};
			var modalOptions = {
				accountList : response.data,
				 date : $scope.currentDate,
				 getFrom : function(id, modalOptions) {
						var account = {account : "account_name"};
						 dataService.get("getsingle/transaction/"+id,account)
						.then(function(response) { 
							if(response.status == "success"){
								modalOptions.previousBalancefrom = response.data.balance;
							}else{
								modalOptions.previousBalancefrom = 0;
								if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
								$notification[response.status]("", response.message);
							}
						});   
					},
					totalAmount : function(modalOptions){
							if(modalOptions.amount == undefined) modalOptions.amount = {};
							modalOptions.balance1 = Math.round(parseFloat(modalOptions.previousBalancefrom) - parseFloat(modalOptions.amount));
							modalOptions.balance2 = Math.round(parseFloat(modalOptions.previousBalanceto) + parseFloat(modalOptions.amount));
							console.log(modalOptions.balance1);
							console.log(modalOptions.balance2);
					},
					getTo : function(id, modalOptions) {
						var account = {account : "account_name"};
						 dataService.get("getsingle/transaction/"+id,account)
						.then(function(response) {
							if(response.status == "success"){
								modalOptions.previousBalanceto = response.data.balance;
							}else{
								modalOptions.previousBalanceto = 0;
								if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
								$notification[response.status]("", response.message);
							}
						});   
					},
				postData: function(modalOptions) {
					var debitTransfer = angular.copy(modalOptions.transfer);
					debitTransfer.debit_amount = modalOptions.amount;
					debitTransfer.account_no = modalOptions.transfer_from;
					debitTransfer.balance = modalOptions.balance1;
					console.log(debitTransfer);
						dataService.post("post/transaction",debitTransfer)
						.then(function(response) {  
							if(response.status == "success"){
								
							}
							if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
							$notification[response.status]("Debited", response.message);
						});
					var creditTransfer = angular.copy(modalOptions.transfer);
					creditTransfer.credit_amount = modalOptions.amount;
					creditTransfer.account_no = modalOptions.transfer_to;
					creditTransfer.balance = modalOptions.balance2;
					console.log(creditTransfer);
					dataService.post("post/transaction",creditTransfer)
					.then(function(response) {  
						if(response.status == "success"){
							
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Credited", response.message);
					});
				},
			};
			modalService.show(modalDefaults, modalOptions).then(function (result) {
			});
			});
		};
/***************************************************************/
		$scope.getTransaction = function(page,transactionParams){
			transactionParams = (transactionParams) ? transactionParams : $scope.transactionParams;
			
			dataService.get("getmultiple/transaction/"+page+"/"+$scope.pageItems, transactionParams)
			.then(function(response) {
				if(response.status == 'success'){
					$scope.transaction = response.data;
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
			if(type == 'custom'){
				var dateS = new Date(duration.start);
				var dateE = new Date(duration.end);
				var startDt = dateS.getFullYear() + "-" + (dateS.getMonth() + 1) + "-" + dateS.getDate();
				var endtDt = dateE.getFullYear() + "-" + (dateE.getMonth() + 1) + "-" + (dateE.getDate() + 1 );
			}
			if(type == 'daily'){
				var dateS = new Date(duration.start);
				var startDt = dateS.getFullYear() + "-" + (dateS.getMonth() + 1) + "-" + dateS.getDate();
				var endtDt = dateS.getFullYear() + "-" + (dateS.getMonth() + 1) + "-" + (dateS.getDate() + 1);
			}
			if(type == 'month'){
				duration = parseInt(duration);
				var today = new Date();
				var start = new Date(today.getFullYear(), (duration - 1), 1);
				var endt = new Date(today.getFullYear(), (duration - 1) + 1, 0);
				
				var startDt = start.getFullYear() +"-" + (start.getMonth() + 1) + "-"+start.getDate();
				var endtDt = endt.getFullYear() +"-" + (endt.getMonth() + 1) + "-"+ (endt.getDate() + 1);
			}
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
			
			$scope.getTransaction($scope.CurrentPage, $scope.transactionParams);
		}
	};
		
	// Inject controller's dependencies
	transactionController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('transactionController', transactionController);
});