'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService','$routeParams' ,'$notification', 'dataService'];
    
    // This is controller for this view
	var invoiceController = function ($scope,$rootScope,$injector,modalService, $routeParams,$notification,dataService) {
		
		//global scope objects
		$scope.invoice = true;
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.currentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";		
		$scope.alerts = [];
		$scope.userInfo = {user_id : $rootScope.userDetails.id}; 
		$scope.currentDate = dataService.currentDate;
/*******************************************************************/
		var curDate = new Date();
		var curMonth = curDate.getMonth() + 1;
		curMonth = (curMonth <= 9) ? '0' + curMonth : curMonth;
		$scope.currentDate = curDate.getFullYear() + "-" + curMonth + "-" + curDate.getDate();

		$scope.rentParams = {};
		
		
		var accountConfig = $rootScope.userDetails.config.rentsetting;
		$scope.config = {
			other_tax : accountConfig.other_tax,
			service_tax : accountConfig.service_tax,
			primary_edu_cess : accountConfig.primary_edu_cess,
			secondary_edu_cess : accountConfig.secondary_edu_cess,
			pan_no : accountConfig.pan_no,
			tds : accountConfig.tds,
			service_tax_no : accountConfig.service_tax_no
		}
		
		var dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 10);
		var dueMonth = dueDate.getMonth() + 1;
		dueMonth = (dueMonth <= 9) ? '0' + dueMonth : dueMonth;
		$scope.dueDate = dueDate.getFullYear() + "-" + dueMonth + "-" + dueDate.getDate();
		
		$scope.otherTax = function(rent){
			if($rootScope.userDetails.config.rentsetting.other_tax == 0){ 
				return 0;
			}else{
				return rent * parseInt($rootScope.userDetails.config.rentsetting.other_tax) / 100;
			}
		}
		$scope.tds = function(rent){
			if($rootScope.userDetails.config.rentsetting.tds == 0){ 
				return 0;
			}else{
				return rent * parseInt($rootScope.userDetails.config.rentsetting.tds) / 100;
			}
		}
		$scope.serviceTax = function(rent){
			//console.log(parseFloat($rootScope.userDetails.config.rentsetting.service_tax));
			return rent * parseFloat($rootScope.userDetails.config.rentsetting.service_tax) / 100; // other_tax - secondary_edu_cess - primary_edu_cess
		}
		$scope.primaryEduCess = function(rent){
			return $scope.serviceTax(rent) * parseInt($rootScope.userDetails.config.rentsetting.primary_edu_cess) / 100;
		}
		$scope.secondaryEduCess = function(rent){
			return $scope.serviceTax(rent) * parseInt($rootScope.userDetails.config.rentsetting.secondary_edu_cess) / 100;
		}
		
		$scope.printDiv = function(divName) {
			var printContents = document.getElementById(divName).innerHTML;
			var popupWin = window.open('', '_blank', 'width=1000,height=620');
			popupWin.document.open()
			popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" /><link rel="stylesheet" type="text/css" href="css/style.css" /></head><body onload="window.print()">' + printContents + '</html>');
			popupWin.document.close();
		} 
		
		$scope.inWords = function(totalRent){
			var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
			var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
			var num = totalRent;
			
			if ((num = num.toString()).length > 9) return 'overflow';
			var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
			if (!n) return; var str = '';
			str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
			str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
			str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
			str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
			str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only! ' : '';
			return str;
		}
		
		/***********************************************************************************/
		$scope.openGenerateinvoice = function (url,invoice) {

			$scope.rentYear = [];
				var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
				};
				if(invoice){
					var genDate = (invoice.generated_date) ? new Date(invoice.generated_date) : {};
				}
				var modalOptions = {
					rentList : (invoice) ? invoice : {},
					rentDate: { date : $scope.currentDate, due_date : $scope.dueDate },
					accountConfig : $rootScope.userDetails.config.rentsetting,
					total_amount : 0,
					rentData : (invoice) ? invoice : {},
					inWords : (invoice) ? $scope.inWords(invoice.total_amount) : "",
					generated_date : (genDate) ? {month : genDate.getMonth(), year : genDate.getFullYear()} : {},
					generatedDate : {month : curMonth, year : curDate.getFullYear()},
					printDiv : function(divName) {
						var printContents = document.getElementById(divName).innerHTML;
						var popupWin = window.open('', '_blank', 'width=1000,height=620');
						popupWin.document.open()
						popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" /><link rel="stylesheet" type="text/css" href="css/style.css" /></head><body onload="window.print()">' + printContents + '</html>');
						popupWin.document.close();
					},
					getTotal : function(rentData, modalOptions){
						if(rentData.perticulars == undefined) rentData.perticulars = {};
						var rent = parseFloat(rentData.perticulars.rent);
						
						rentData.perticulars.tax = $scope.serviceTax(rent);
						rentData.perticulars.tds = $scope.tds(rent);
						rentData.perticulars.other_tax = $scope.otherTax(rent);
						rentData.perticulars.primaryeducation = $scope.primaryEduCess(rent);
						rentData.perticulars.secondaryeducation = $scope.secondaryEduCess(rent);
						
						var maintenance = (rentData.perticulars.maintenance) ? rentData.perticulars.maintenance : 0;
						var electricity_bill = (rentData.perticulars.electricity_bill) ? rentData.perticulars.electricity_bill : 0;
						var water_charge = (rentData.perticulars.water_charge) ? rentData.perticulars.water_charge : 0;
						
						var totalAmount = ((parseFloat(rent) + parseFloat($scope.serviceTax(rent)) + parseFloat($scope.otherTax(rent)) + parseFloat($scope.primaryEduCess(rent)) + parseFloat($scope.secondaryEduCess(rent)) + parseFloat(maintenance) + parseFloat(electricity_bill) + parseFloat(water_charge))  - parseFloat($scope.tds(rent)));
						modalOptions.service_tax = parseFloat(service_tax);
						modalOptions.other_tar = parseFloat(other_tax);
						modalOptions.total_amount = parseFloat(totalAmount);
					},
					formData : function(rentData, total_amount){
						var due_date = new Date(rentData.generated_date);
						rentData.id = modalOptions.rentList.id;
						rentData.user_id = modalOptions.rentList.user_id;
						rentData.property_id = modalOptions.rentList.property_id;
						due_date.setDate(due_date.getMonth() + modalOptions.rentList.duration);
						rentData.due_date = due_date;
						rentData.total_amount = total_amount;
						modalOptions.invoice = rentData;
					},
					updateData : function(id,invoice){
							dataService.put("put/invoice/"+id,invoice)
							.then(function(response) {  
							if(response.status == "success"){
								console.log(response);
							}
							if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
							$notification[response.status]("Rent Receipt Generated", response.message);
						});
					},
					postData : function(invoice, total_amount){
							invoice.total_amount = total_amount;
							dataService.post("post/invoice",invoice)
							.then(function(response) {  
							if(response.status == "success"){
								console.log(response);
							}
							if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
							$notification[response.status]("Rent Receipt Generated", response.message);
						});
					},
					payInvoice : function(payment){
							if(modalOptions.rentList.due_amount - payment.credit_amount <= 0){
								var paymentStatus = { payment_status : 1};
								}else{
									var paymentStatus = { payment_status : 2};
								}
								dataService.post("post/transaction",payment)
								.then(function(response) {  
									if(response.status == "success"){
										console.log(response);
										dataService.put("put/invoice/"+invoice.id,paymentStatus)
										.then(function(response) {
											if(response.status == "success"){
												console.log(response);
											}
										});
									}
									if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
									$notification[response.status]("Rent Receipt Generated", response.message);
								});
					}
					
				};
				modalService.show(modalDefaults,modalOptions).then(function (result) {
					if(modalOptions.invoice.id){modalOptions.updateData(modalOptions.invoice.id,modalOptions.invoice);}
					else{modalOptions.postData(modalOptions.invoice);}
				});
		};
/*************************************************************************************/
	$scope.getCustomer = function(){
			dataService.get("getmultiple/user/1/100", {status: 1, user_id : $rootScope.userDetails.id}).then(function(response){
				if(response.status == 'success'){
						$scope.customerList = response.data;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Customers", response.message);
				}
			});
		} 
/***********************************************************************************/
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
/************************************************************************************/
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
			
			dataService.get("getmultiple/invoice/"+page+"/"+$scope.pageItems,$scope.filterStatus)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.invoices = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.invoices = {};
					$scope.totalRecords = {};
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get a List", response.message);
				}
			});
		};
/*******************************************************************************************/
		$scope.getInvoices = function(page){
			var invouceParams = {groupBy : 'id' , user_id : $scope.userInfo.user_id};
			dataService.get("getmultiple/invoice/"+page+"/"+$scope.pageItems, invouceParams)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.invoices = response.data;
					$scope.total_paid = response.total_paid;
					$scope.total_due = response.total_due;
					$scope.total_amount = response.total_rent;
					$scope.totalRecords = response.totalRecords;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Invoices", response.message);
				}
			});
			}
/***********************************************************/
/*Delete Account Funtion*/
			$scope.deleted = function(id, status){
				$scope.deletedData = {status : status};
				var del = confirm("Do you really want to delete this?");
				if(del){
					dataService.delete("delete/invoice/"+id, $scope.deletedData)
					.then(function(response) { 
						if(response.status == 'success'){
							$scope.hideDeleted = 1;
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Delete Invoice", response.message);
					});
				}else{
					alert("canceled!");
				}
			};
/**************************************************************/
	};
		
	// Inject controller's dependencies
	invoiceController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('invoiceController', invoiceController);
});