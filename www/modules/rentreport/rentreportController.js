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
		$scope.currentDate = dataService.currentDate;
		
		$scope.ok = function () {
			$modalInstance.close();
		};
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		$scope.rentDate = {};
		$scope.openRent = function (url,rentId) {
			$scope.rentYear = [];
				var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
				};
				var modalOptions = {
					rentList : rentId,
					rentDate:{ date :$scope.currentDate },
					accountConfig : $rootScope.userDetails.config.rentsetting,
					formData : function(rentData){
						rentData.user_id = $scope.userData;
						var d_date = new Date(rentData.due_date); //
						d_date.setDate(d_date.getDate() + 10);
						rentData.due_date = d_date;
						rentData.tax = modalOptions.accountConfig.service_tax;
						rentData.tds = modalOptions.accountConfig.tds;
						rentData.other_tax = modalOptions.accountConfig.other_tax;
						var totalRent = parseInt(rentData.rent ) +  parseInt(rentData.electricity_bill )+parseInt(rentData.water_charge )+  parseInt(rentData.maintainance);
						
						var totalservice = totalRent * parseFloat(parseFloat(modalOptions.accountConfig.service_tax)/100);
						var toatltds =  totalRent * parseFloat(parseFloat(modalOptions.accountConfig.tds)/100);
						var othertax =  totalRent * parseFloat(parseFloat(modalOptions.accountConfig.other_tax)/100);
						var totalAmount = parseInt(totalRent + totalservice + toatltds + othertax);
						rentData.total_amount = totalAmount;
						console.log(rentData.total_amount);
						modalOptions.rentReceipt = rentData;
					},
				};
				modalService.showModal(modalDefaults,modalOptions).then(function (result) {
					console.log(modalOptions.rentReceipt);
					/* dataService.post("post/rentreceipt",modalOptions.rentReceipt)
					.then(function(response) {  
						if(response.status == "success"){
							console.log(response);
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Rent Receipt Generated", response.message);
					});   */
				});
		};
		
		// code for generate invoice
		if($routeParams.id) {
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
			$scope.rentParams = {property_id : $routeParams.id, user_id : $rootScope.userDetails.id, generated_date : $scope.generated_date};
			dataService.get("getmultiple/rentreceipt/1/1000",$scope.rentParams).then(function(response) {
				if(response.status == 'success'){
					$scope.receiptList = response.data[0];
					$scope.totalPaid = response.data.total_paid;
					$scope.totalRent = response.data.total_rent;
					$scope.totalDue = response.data.total_due;
						var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
						var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
						var num = $scope.totalRent;
						
						if ((num = num.toString()).length > 9) return 'overflow';
						var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
						if (!n) return; var str = '';
						str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
						str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
						str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
						str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
						str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only! ' : '';
					$scope.amountInWords = str;
					$scope.getReceiptByMonth = function(generatedDate){
						var generated_date = $scope.generatedDate.year + '-' + $scope.generatedDate.month;
						angular.extend($scope.rentParams, {generated_date : generated_date});
						dataService.get("getmultiple/rentreceipt/1/1000",$scope.rentParams).then(function(response) {
							if(response.status == 'success'){
								$scope.receiptList = response.data[0];
							}else{
								if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
								$notification[response.status]("No Data Found", response.message);
							}
						});
					}
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Rent Receipt not generated", response.message);
				}
			});
		};
		$scope.pageChanged = function(page, rentParams) {
			dataService.get("getmultiple/rent/"+page+"/"+$scope.pageItems, $scope.rentParams)
			.then(function(response) { 
				$scope.rentData = response.data;			
			});
		}; 
		
		$scope.rentParams = {status: 1};
		angular.extend($scope.rentParams, $scope.userInfo);
		dataService.get("getmultiple/rent/"+$scope.rentListCurrentPage+"/"+$scope.pageItems, $scope.rentParams)
		.then(function(response) {  
			$scope.rentData = response.data;
			if(response.status == 'success'){
				$scope.rentreport = response.data;
				$scope.totalRecords=response.totalRecords;		
			}else{
				$scope.rentData = {};
				$scope.totalRecords = {};	
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("View rent report", response.message);
			}  
		});
		
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
				angular.extend($scope.rentParams, $scope.userInfo);
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