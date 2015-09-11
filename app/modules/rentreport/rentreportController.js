'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','$routeParams','modalService','dataService','$notification'];
    
    // This is controller for this view
	var rentreportController = function ($scope,$rootScope,$injector,$routeParams,modalService,dataService,$notification) {
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.rentListCurrentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";
		$scope.userInfo = {user_id : $rootScope.userDetails.id};
		$scope.userData = $rootScope.userDetails.id ;
		var curDate = new Date();
		var month = curDate.getMonth() + 1;
		month = (month <= 9) ? '0' + month : month;
		$scope.currentDate = curDate.getFullYear() + "-" + month + "-" + curDate.getDate();
		$scope.rentParams = {status : 1, user_id : $rootScope.userDetails.id, orderBy : '-leaving_date'};
		$scope.leaving_date = '-leaving_date';
		
		$scope.disableInvoice = function(leaving_date){
			var CurDt = new Date();
			var leavDt = new Date(leaving_date);
			if(leavDt <= CurDt){
				
				return true;
			}
			return false;
		}
		
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
			return rent * parseFloat($rootScope.userDetails.config.rentsetting.service_tax) / 100; 
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
/****************************************************************************/
var generatedMonth = new Date($scope.currentDate);
						var month = new Array();
						month[0] = "January";
						month[1] = "February";
						month[2] = "March";
						month[3] = "April";
						month[4] = "May";
						month[5] = "June";
						month[6] = "July";
						month[7] = "August";
						month[8] = "September";
						month[9] = "October";
						month[10] = "November";
						month[11] = "December";
						var monthName = month[generatedMonth.getMonth()];
					
		$scope.getParticulars = function(invoice){
			var particulars = [];
			if(invoice.rent){
				var rent = {
					"label" : "Licence Fee",
					"price" : invoice.rent,
					"quantity" : 1,
					"amount" : parseFloat(invoice.rent),
					"tax" : [{
						"name" : "service_tax",
						"value" : $scope.config.service_tax
					}]
				}
				particulars.push(rent);
			}
			if(invoice.electricity_bill != 0){
				var rent = {
					"label" : "Electricity Bill",
					"price" : invoice.electricity_bill,
					"quantity" : 1,
					"amount" : parseFloat(invoice.electricity_bill)
				}
				particulars.push(rent);
			}
			
			if(invoice.water_charge != 0){
				var rent = {
				"label" : "Water Bill",
				"price" : invoice.water_charge,
				"quantity" : 1,
				"amount" : parseFloat(invoice.water_charge)
				}
				particulars.push(rent);
			}
			if(invoice.maintenance != 0){
				var rent = {
				"label" : "Maintenance",
				"price" : invoice.maintenance,
				"quantity" : 1,
				"amount" : parseFloat(invoice.maintenance)
				}
				particulars.push(rent);
			}
			return particulars;
		}
/**************************************************************************/
/*Generate Invoice Modal function Open Rent*/
		$scope.openRent = function (url,invoice) {
			console.log(invoice);
			$scope.rentYear = [];
				var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
				};
				var modalOptions = {
					rentList : invoice,
					/* getParty: function(modalOptions){
						dataService.get("getmultiple/user/1/100", {status: 1, user_id : $rootScope.userDetails.id}).then(function(response){
							modalOptions.customerList = (response.data);
						});
					}, */
					accountConfig : $rootScope.userDetails.config.rentsetting,
					taxes :[{'name':'other_tax', 'value':accountConfig.other_tax},
						{'name':'service_tax', 'value':accountConfig.service_tax},
						{'name':'tds', 'value':accountConfig.tds
					}],
					rentData: {
						remark : "Being Invoice for " + monthName + "-" + generatedMonth.getFullYear()+ " " + "Licence Fee & Maintenance Charges against Agr. for" + " "+ invoice.title + " "+invoice.address.address + ", premise area " + invoice.address.area + ", " + invoice.address.city + ", "+ invoice.address.location + "-" + invoice.address.pincode,
						particulars : $scope.getParticulars(invoice)
					},
					totalCalculate : function(modalOptions){
						modalOptions.subTotal = 0;
						modalOptions.total = 0;
						modalOptions.tax = {service_tax:0,other_tax:0,tds:0};
						for(var x in modalOptions.rentData.particulars){
							modalOptions.tax = dataService.calculateTax(modalOptions.rentData.particulars[x].tax, modalOptions.rentData.particulars[x].amount, modalOptions.tax);
							modalOptions.subTotal += modalOptions.rentData.particulars[x].amount;
							modalOptions.total = modalOptions.subTotal + modalOptions.tax.service_tax + modalOptions.tax.other_tax - modalOptions.tax.tds;
						}
						return modalOptions;
					},
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
					rentDate: { date : $scope.currentDate, due_date : $scope.dueDate },
					total_amount : 0,
					formData : function(rentData, total_amount){
						rentData.user_id = modalOptions.rentList.user_id;
						rentData.property_id = modalOptions.rentList.property_id;
						rentData.total_amount = total_amount;
						modalOptions.invoice = rentData;
					},
					
				};
				modalService.showModal(modalDefaults,modalOptions).then(function (result) {
					console.log(modalOptions.invoice);
					 dataService.post("post/invoice",modalOptions.invoice)
					.then(function(response) {  
						if(response.status == "success"){
							console.log(response);
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Rent Receipt Generated", response.message);
					});
				});
		};
/**************************************************************************************************/
/*Property Release Function*/
		$scope.propertyRelease = function (data){
			var curLeavingDate = new Date();
			
			var leavingDt = {leaving_date : curLeavingDate.getFullYear() + "-" + (curLeavingDate.getMonth() + 1) + "-" + curLeavingDate.getDate()};
			var available = {availability : 1};
			dataService.put("put/rent/"+data.id,leavingDt)
			.then(function(response) {
				if(response.status == "success"){
					dataService.put("put/property/"+data.property_id,available)
					.then(function(response) {
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Property Availability", response.message);
						$scope.getRentData($scope.rentListCurrentPage, $scope.rentParams);
					});
				}
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Release Property", response.message);
			});
		}
/**************************************************************************************************/		
		// code for generate invoice
		if($routeParams.propertyId) {
			$scope.invoiceyear = [];
			$scope.invoicemonth = [];			
			var curDate = new Date();
			$scope.rentYear = {};
			$scope.receiptList ={};
			$scope.rentYear.curYear = curDate.getFullYear();
			for (var value = $scope.rentYear.curYear-5; value <= $scope.rentYear.curYear; value++){
				$scope.invoiceyear.push(value);
			}
			$scope.rentYear.curMonth = curDate.getMonth()+1 ;
			for (var value = 1; value <= 12; value++){
				if(value<10){
					$scope.invoicemonth.push('0' + value);
				}
				else{
					$scope.invoicemonth.push(value);
				}
			}
			if($scope.rentYear.curMonth <= 10){
				$scope.rentYear.curMonth = '0' + $scope.rentYear.curMonth;
			}
			$scope.generated_date = $scope.rentYear.curYear + "-" + $scope.rentYear.curMonth;
			$scope.rentParams = {property_id : $routeParams.propertyId, user_id : $routeParams.userId, generated_date : $scope.generated_date};
			dataService.get("getmultiple/invoice/1/1000",$scope.rentParams).then(function(response) {
				if(response.status == 'success'){
					$scope.receiptList = response.data[0];
					
					$scope.totalRent = function(){
						var rent = $scope.receiptList.rent;
						var maintainance = ($scope.receiptList.maintainance) ? $scope.receiptList.maintainance : 0;
						var service_tax_no = ($scope.receiptList.service_tax_no) ? $scope.receiptList.service_tax_no : 0;
						var electricity_bill = ($scope.receiptList.electricity_bill) ? $scope.receiptList.electricity_bill : 0;
						var water_charge = ($scope.receiptList.water_charge) ? $scope.receiptList.water_charge : 0;
						return Math.round(parseFloat(rent) + parseFloat($scope.serviceTax(rent)) + parseFloat($scope.primaryEduCess(rent)) + parseFloat($scope.secondaryEduCess(rent)) + parseFloat(maintainance) + parseFloat(electricity_bill) + parseFloat(water_charge)) ;
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
						$scope.amountInWords = str;
					}
					$scope.inWords($scope.totalRent());
					$scope.getReceiptByMonth = function(generatedDate){
						var generated_date = $scope.generatedDate.year + '-' + $scope.generatedDate.month;
						angular.extend($scope.rentParams, {generated_date : generated_date});
						dataService.get("getmultiple/invoice/1/1000",$scope.rentParams).then(function(response) {
							if(response.status == 'success'){
								$scope.receiptList = response.data[0];
								$scope.totalPaid = response.data[0].paid;
								//$scope.totalRent = $scope.totalRent();
								$scope.totalDue = response.data[0].due_amount;
								$scope.inWords($scope.totalRent());
							}else{
								$scope.receiptList = [];
								$scope.totalPaid = 0;
								$scope.totalRent = 0;
								$scope.totalDue = 0;
								if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
								$notification[response.status]("No Data Found", response.message);
							}
						});
					}
				}else{
					$scope.receiptList = [];
					$scope.totalPaid = 0;
					$scope.totalRent = 0;
					$scope.totalDue = 0;
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Rent Receipt not generated", response.message);
				}
			});
		};
			
		
		$scope.getRentData = function(page, rentParams) {
			dataService.get("getmultiple/rent/"+page+"/"+$scope.pageItems, rentParams)
			.then(function(response) {  //function for templatelist response
				if(response.status == 'success'){
					$scope.rentData = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.rentData = [];
					$scope.totalRecords = 0;
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Rent", response.message);
				}
			});
		}; 
		
		// code for show User list
		dataService.get("getmultiple/user/1/500", {status: 1, user_id : $rootScope.userDetails.id})
		.then(function(response) {  
			if(response.status == 'success'){
				$scope.userList = response.data;
			}else{
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Get Users", response.message);
			}
		});
		
		//global method for filter 
		$scope.changeStatus = function(column, value, search) {
			if(search){
				$scope.rentParams.search = true;
			}
			if(search && value == ""){
				delete $scope.rentParams['search'];
			}
			
			(value == "") ? delete $scope.rentParams[column] : $scope.rentParams[column] = value;
			
			if(column == 'user_id' && value == null) {
				angular.extend($scope.rentParams,  $scope.userInfo);
			}
			if(search && (value.length >= 4 || value =="")){
				$scope.getRentData($scope.rentListCurrentPage, $scope.rentParams);
			}else{
				$scope.getRentData($scope.rentListCurrentPage, $scope.rentParams);
			}
		};
		//global method for filter 
		$scope.orderBy = function(column, value, orderBy) {
			if(orderBy){
				$scope.rentParams.orderBy = value;
			}
			if(orderBy && value == ""){
				delete $scope.rentParams['orderBy'];
			}
			
			$scope.getRentData($scope.rentListCurrentPage, $scope.rentParams);
		};
	};
		
	// Inject controller's dependencies
	rentreportController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('rentreportController', rentreportController);
});