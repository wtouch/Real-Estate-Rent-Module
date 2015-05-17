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
		$scope.rentParams = {};
		
		var dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 10);
		var dueMonth = dueDate.getMonth() + 1;
		dueMonth = (dueMonth <= 9) ? '0' + dueMonth : dueMonth;
		$scope.dueDate = dueDate.getFullYear() + "-" + dueMonth + "-" + dueDate.getDate();
		
		$scope.printDiv = function(divName) {
			var printContents = document.getElementById(divName).innerHTML;
			var popupWin = window.open('', '_blank', 'width=1000,height=620');
			popupWin.document.open()
			popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" /><link rel="stylesheet" type="text/css" href="css/style.css" /></head><body onload="window.print()">' + printContents + '</html>');
			popupWin.document.close();
		} 
		
		$scope.rentDate = {};
		$scope.openRent = function (url,rent_data) {
			$scope.rentYear = [];
				var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
				};
				var modalOptions = {
					rentList : rent_data,
					rentDate: { date : $scope.currentDate, due_date : $scope.dueDate },
					accountConfig : $rootScope.userDetails.config.rentsetting,
					total_amount : 0,
					getTotal : function(rentData, modalOptions){
						rentData.tax = modalOptions.accountConfig.service_tax;
						rentData.other_tax = modalOptions.accountConfig.other_tax;
						var totalRent = parseInt(rentData.rent ) +  parseInt(rentData.electricity_bill )+parseInt(rentData.water_charge )+  parseInt(rentData.maintainance);
						
						var totalservice = totalRent * parseFloat(parseFloat(modalOptions.accountConfig.service_tax)/100);
						
						var othertax =  totalRent * parseFloat(parseFloat(modalOptions.accountConfig.other_tax)/100);
						var totalAmount = parseInt(totalRent + totalservice + othertax);
						modalOptions.total_amount = totalAmount;
					},
					formData : function(rentData, total_amount){
						var due_date = new Date(rentData.generated_date);
						rentData.user_id = modalOptions.rentList.user_id;
						rentData.property_id = modalOptions.rentList.property_id;
						due_date.setDate(due_date.getMonth() + modalOptions.rentList.duration);
						rentData.due_date = due_date;
						rentData.total_amount = total_amount;
						console.log(rentData);
						modalOptions.rentReceipt = rentData;
					},
					
				};
				modalService.showModal(modalDefaults,modalOptions).then(function (result) {
					console.log(modalOptions.rentReceipt);
					 dataService.post("post/rentreceipt",modalOptions.rentReceipt)
					.then(function(response) {  
						if(response.status == "success"){
							console.log(response);
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Rent Receipt Generated", response.message);
					});  
				});
		};
		
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
			dataService.get("getmultiple/rentreceipt/1/1000",$scope.rentParams).then(function(response) {
				if(response.status == 'success'){
					console.log($rootScope.userDetails.config.rentsetting);
					$scope.receiptList = response.data[0];
					$scope.serviceTax = function(rent){
						return rent * parseInt($rootScope.userDetails.config.rentsetting.service_tax) / 100; // other_tax - secondary_edu_cess - primary_edu_cess
					}
					$scope.primaryEduCess = function(rent){
						return $scope.serviceTax(rent) * parseInt($rootScope.userDetails.config.rentsetting.primary_edu_cess) / 100;
					}
					$scope.secondaryEduCess = function(rent){
						return $scope.serviceTax(rent) * parseInt($rootScope.userDetails.config.rentsetting.secondary_edu_cess) / 100;
					}
					$scope.totalRent = function(){
						var rent = $scope.receiptList.rent;
						var maintainance = ($scope.receiptList.maintainance) ? $scope.receiptList.maintainance : 0;
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
						dataService.get("getmultiple/rentreceipt/1/1000",$scope.rentParams).then(function(response) {
							if(response.status == 'success'){
								$scope.receiptList = response.data[0];
								$scope.totalPaid = response.data[0].paid;
								$scope.totalRent = response.data[0].total_amount;
								$scope.totalDue = response.data[0].due_amount;
								$scope.inWords($scope.totalRent);
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
		
		$scope.pageChanged = function(page, rentParams) {
			dataService.get("getmultiple/rent/"+page+"/"+$scope.pageItems, rentParams)
			.then(function(response) { 
				$scope.rentData = response.data;			
			});
		}; 
		$scope.getRentData = function() {
			var rentParams = {user_id : $rootScope.userDetails.id};
			dataService.get("getmultiple/rent/1/"+$scope.pageItems, rentParams)
			.then(function(response) { 
				$scope.rentData = response.data;			
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
		$scope.changeStatus = function(statusCol, colValue) {
			$scope.filterStatus= {};
			(colValue == "") ? delete $scope.rentParams[statusCol] : $scope.filterStatus[statusCol] = colValue;
			angular.extend($scope.rentParams, $scope.filterStatus);
			if(statusCol == 'user_id' && colValue == null) {
				angular.extend($scope.rentParams,  $scope.userInfo);
			}
			dataService.get("getmultiple/rent/1/"+$scope.pageItems, $scope.rentParams)
			.then(function(response) {  //function for templatelist response
				if(response.status == 'success'){
					$scope.rentData = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.rentData = {};
					$scope.totalRecords = {};
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Rent", response.message);
				}
			});
		};
		
		
		//function to search filter
		$scope.searchFilter = function(statusCol, colValue) {
			$scope.search = {search: true};
			$scope.filterStatus= {};
			(colValue =="") ? delete $scope.rentParams[statusCol] : $scope.filterStatus[statusCol] = colValue;
			angular.extend($scope.rentParams, $scope.filterStatus, $scope.search);
			if(colValue.length >= 4 || colValue ==""){
				dataService.get("getmultiple/rent/1/"+$scope.pageItems, $scope.rentParams)
				.then(function(response) {  
					if(response.status == 'success'){
						$scope.rentData = response.data;
						$scope.totalRecords = response.totalRecords;
					}else{
						$scope.rentData = {};
						$scope.totalRecords = {};
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Rent Filter", response.message);
					}
				});
			}
		};
		
	};
		
	// Inject controller's dependencies
	rentreportController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('rentreportController', rentreportController);
});