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
		//$scope.currentDate = dataService.currentDate;
		$scope.today = new Date();
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
			service_tax_no : accountConfig.service_tax_no,
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
			dataService.get("getmultiple/account/1/100", {status: 1, user_id : $rootScope.userDetails.id}).then(function(account){
			$scope.rentYear = [];
				var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
				};
				if(invoice){
					var genDate = (invoice.generated_date) ? new Date(invoice.generated_date) : {};
				}
				var modalOptions = {
					accountList : account.data,
					rentList : (invoice) ? invoice : {},
					rentDate: { date : $scope.currentDate, due_date : $scope.dueDate },
					total_amount : 0,
					accountConfig : $rootScope.userDetails.config.rentsetting,
					taxes :[
						{'name':'other_tax', 'value':accountConfig.other_tax},
						{'name':'service_tax', 'value':accountConfig.service_tax},
						{'name':'tds', 'value':accountConfig.tds}
					],
					perticulars : [],
					rentData : (invoice) ? {
						'id':invoice.id,
						'user_id':invoice.user_id,
						'property_id':invoice.property_id,
						'due_date':invoice.due_date,
						'previous_due':invoice.previous_due,
						'subtotal':invoice.subtotal,
						'tax':invoice.tax,
						'total_amount':invoice.total_amount,
						'duration':invoice.duration,
						'generated_date':invoice.generated_date,
						'particulars':invoice.particulars,
						'remark':invoice.remark,
						'payment_status':invoice.payment_status,
						'status':invoice.status
					} : {},
					inWords : (invoice) ? $scope.inWords(invoice.total_amount) : "",
					generated_date : (genDate) ? {month : genDate.getMonth(), year : genDate.getFullYear()} : {},
					generatedDate : {month : curMonth, year : curDate.getFullYear()},
					subTotal : 0,
					taxTotal : 0,
					totalCalculate : function(modalOptions){
						modalOptions.subTotal = 0;
						modalOptions.total = 0;
						modalOptions.tax = {service_tax:0,other_tax:0,tds:0};
						for(var x in modalOptions.rentData.particulars){
							modalOptions.tax = dataService.calculateTax(modalOptions.rentData.particulars[x].tax, modalOptions.rentData.particulars[x].amount,modalOptions.tax);
							modalOptions.subTotal += modalOptions.rentData.particulars[x].amount;
							modalOptions.total = modalOptions.subTotal + modalOptions.tax.service_tax + modalOptions.tax.other_tax - modalOptions.tax.tds;
						}
						return modalOptions;
					},
					singleparticular : {},
					add : function(modalOptions){
						modalOptions.rentData.particulars = (modalOptions.rentData.particulars) ? modalOptions.rentData.particulars : [];
						
						var dtlObj = JSON.stringify(modalOptions.singleparticular);
						modalOptions.rentData.particulars.push(JSON.parse(dtlObj));
						
						var subTotal = modalOptions.totalCalculate(modalOptions);
						
						modalOptions.singleparticular = { label : " ", price : 0, quantity : 1};
					},
					remove : function(item, modalOptions) {
						console.log(modalOptions);
						var index = modalOptions.rentData.particulars.indexOf(item);
						modalOptions.rentData.particulars.splice(index, 1);   
						var subTotal = modalOptions.totalCalculate(modalOptions);
					},
					getParty: function(modalOptions){
					dataService.get("getmultiple/user/1/100", {status: 1, user_id : $rootScope.userDetails.id}).then(function(response){
						modalOptions.customerList = (response.data);
					});
					},
					printDiv : function(divName) {
						var printContents = document.getElementById(divName).innerHTML;
						var popupWin = window.open('', '_blank', 'width=1000,height=620');
						popupWin.document.open()
						popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" /><link rel="stylesheet" type="text/css" href="css/style.css" /></head><body onload="window.print()">' + printContents + '</html>');
						popupWin.document.close();
					},
					getTotal : function(rentData, modalOptions, input, tax){
						if(rentData.perticulars == undefined) rentData.perticulars = {};
						var rent = parseFloat(rentData.perticulars.rent);
						var serviceTax = (rentData.perticulars.service_tax) ? rentData.perticulars.tax : 0;
						var pEduCess = (rentData.perticulars.primaryeducation) ? rentData.perticulars.primaryeducation : 0;
						
						var sEduCess = (rentData.perticulars.secondaryeducation) ? rentData.perticulars.secondaryeducation : 0;
						
						rentData.perticulars.tax = $scope.serviceTax(rent);
						rentData.perticulars.tds = $scope.tds(rent);
						rentData.perticulars.other_tax = $scope.otherTax(rent);
						rentData.perticulars.primaryeducation = $scope.primaryEduCess(rent);
						rentData.perticulars.secondaryeducation = $scope.secondaryEduCess(rent);
						
						var maintenance = (rentData.perticulars.maintenance) ? rentData.perticulars.maintenance : 0;
						var electricity_bill = (rentData.perticulars.electricity_bill) ? rentData.perticulars.electricity_bill : 0;
						var water_charge = (rentData.perticulars.water_charge) ? rentData.perticulars.water_charge : 0;
						
						var totalAmount = ((parseFloat(rent) + parseFloat($scope.serviceTax(rent)) + parseFloat($scope.otherTax(rent)) + parseFloat($scope.primaryEduCess(rent)) + parseFloat($scope.secondaryEduCess(rent)) + parseFloat(maintenance) + parseFloat(electricity_bill) + parseFloat(water_charge))  - parseFloat($scope.tds(rent)));
						modalOptions.service_tax = parseFloat(rentData.perticulars.tax);
						modalOptions.other_tar = parseFloat(rentData.perticulars.other_tax);
						modalOptions.total_amount = parseFloat(totalAmount);
					},
					
					postData : function(invoice){
							dataService.post("post/invoice",invoice)
							.then(function(response) {  
							if(response.status == "success"){
								console.log(response);
								$scope.getInvoices($scope.currentPage);
							}
							if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
							$notification[response.status]("Rent Receipt Generated", response.message);
						});
					},
					formData : function(rentData,total_amount,subtotal,tax){
						if(modalOptions.rentList.property_id) rentData.property_id = modalOptions.rentList.property_id;
						rentData.user_id
						rentData.total_amount = total_amount;
						rentData.subtotal = subtotal;
						rentData.tax = tax;
						modalOptions.invoice = rentData;
					},
					getData : function(id, modalOptions) {
						var account = {account : "account_name"};
						 dataService.get("getsingle/transaction/"+id,account)
						.then(function(response) { 
							
							if(response.status == "success"){
								modalOptions.previousBalance = response.data.balance;
								modalOptions.totalAmount(modalOptions);
							}else{
								modalOptions.previousBalance = 0;
								if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
								$notification[response.status]("", response.message);
							}
						});   
					},
					totalAmount : function(modalOptions){
						if(modalOptions.invoicePayment == undefined) modalOptions.invoicePayment = {};
						modalOptions.invoicePayment.balance = Math.round(parseFloat(modalOptions.previousBalance) + parseFloat(modalOptions.invoicePayment.credit_amount));
					},
					updateData : function(id,invoice){
							dataService.put("put/invoice/"+id,invoice)
							.then(function(response) {  
							if(response.status == "success"){
								console.log(response);
								$scope.getInvoices($scope.currentPage);
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
								payment.type = 'invoice_payment';
								payment.category = 'invoice';
								dataService.post("post/transaction",payment)
								.then(function(response) {  
									if(response.status == "success"){
										console.log(response);
										dataService.put("put/invoice/"+invoice.id,paymentStatus)
										.then(function(response) {
											if(response.status == "success"){
												console.log(response);
												$scope.getInvoices($scope.currentPage);
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
			});
		};
/*************************************************************************************/
/*Receipt Generation Modal*/

	$scope.viewReceipt = function (url,invoice) {
		var getParams = {user_id : $rootScope.userDetails.id,invoice_id :invoice.id,groupBy :invoice.id};
		dataService.get("getmultiple/invoice/1/1000",getParams)
			.then(function(response) {
			var modalDefaults = {
							templateUrl: url,	
							size : 'lg'
						};
			var modalOptions = {
				invoice	: (invoice) ? invoice : {},
				receiptList : (response.data),
				inWords : function(total_amount){
					return $scope.inWords(total_amount);
				},
				accountConfig : $rootScope.userDetails.config.rentsetting,
				printDiv : function(divName) {
						var printContents = document.getElementById(divName).innerHTML;
						var popupWin = window.open('', '_blank', 'width=1000,height=620');
						popupWin.document.open()
						popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" /><link rel="stylesheet" type="text/css" href="css/style.css" /></head><body onload="window.print()">' + printContents + '</html>');
						popupWin.document.close();
					},
				};
			modalService.show(modalDefaults,modalOptions).then(function (result) {
				
				
			});
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
/*******************************************************************************************/
		$scope.getInvoices = function(page, column, value, search){
			$scope.filterStatus = ($scope.filterStatus) ? $scope.filterStatus : {status: 1, user_id : $rootScope.userDetails.id, groupBy : 'invoice_id' };
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
/**************************************************************/
$scope.orderBy = function(column, value, orderBy) {
			if(orderBy){
				$scope.filterStatus.orderBy = value;
			}
			if(orderBy && value == ""){
				delete $scope.filterStatus['orderBy'];
			}
			
			$scope.getInvoices($scope.currentPage, $scope.filterStatus);
	};
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
							$scope.getInvoices($scope.currentPage);
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