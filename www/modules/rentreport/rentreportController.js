'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService','dataService','$notification'];
    
    // This is controller for this view
	var rentreportController = function ($scope,$rootScope,$injector,modalService,dataService,$notification) {
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.rentListCurrentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";
		$scope.userInfo = {user_id : $rootScope.userDetails.id};
		$scope.userData = $rootScope.userDetails.id ;
		$scope.currentDate = dataService.currentDate;
		console.log($rootScope.userDetails);
		$scope.ok = function () {
			$modalInstance.close();
		};
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		$scope.rentDate = {};
		
		/* //to get year list
		$scope.invoiceyear = [];
		var date = new Date();
		var todayYear = date.getFullYear();
		for (var value = 2010; value <= todayYear;value++){
			$scope.invoiceyear.push(value);
		}
		//to get month list
		$scope.invoicemonth = [];
		for (var value = 1; value <= 12;value++){
			$scope.invoicemonth.push(value);
		}  */
		
		$scope.openRent = function (url,rentId) {
			$scope.rentYear = [];
			dataService.get("getsingle/rent/"+rentId).then(function(response) {
				var modalDefaults = {
						templateUrl: url,	
						size : 'lg'
				};
				var modalOptions = {
					rentList : response.data,
					rentDate:{ date :$scope.currentDate },
					formData : function(rentData){
						rentData.user_id = $scope.userData;
						var d_date = new Date(rentData.due_date); //
						d_date.setDate(d_date.getDate() + 10);
						rentData.due_date = d_date;
					
 						var total = parseInt(rentData.rent ) +  parseInt(rentData.electricity_bill )+  parseInt(rentData.water_charge )+  parseInt(rentData.maintainance);
						rentData.total_amount = total;
						modalOptions.rentReceipt = rentData;
						
					},
				};
				modalService.showModal(modalDefaults,modalOptions).then(function (result) {
					dataService.post("post/rentreceipt",modalOptions.rentReceipt)
					.then(function(response) {  
						if(response.status == "success"){
							
							 console.log(response);
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Rent Receipt Generated", response.message);
					});  
				});
			});
		};
		
		$scope.openInvoice = function (url,receiptId) {
			var curDate = new Date();
			$scope.rentYear = {};
			$scope.rentYear.curYear = curDate.getFullYear();
			$scope.rentYear.curMonth = curDate.getMonth() + 1;
			
			if($scope.rentYear.curMonth <= 10){
				$scope.rentYear.curMonth = '0' + $scope.rentYear.curMonth;
			}
			$scope.generated_date = $scope.rentYear.curYear + "-" + $scope.rentYear.curMonth;
			$scope.rentParams = {property_id : receiptId, user_id : $rootScope.userDetails.id, generated_date : $scope.generated_date};
			dataService.get("getmultiple/rentreceipt/1/1000",$scope.rentParams).then(function(response) {
				var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
				};
				
				var modalOptions = {	
					//receiptList : ,
					receiptList : response.data,
					rentDate:{ date :$scope.currentDate },
					formData : function(receiptList){
						modalOptions.rentReceipt = receiptList;
					},
					getReceiptByMonth : function(generatedDate){
						var generated_date = generatedDate.year + '-' + generatedDate.month;
						angular.extend($scope.rentParams, {generated_date : generated_date});
						dataService.get("getmultiple/rentreceipt/1/1000",$scope.rentParams).then(function(response) {
							console.log(modalOptions.receiptList);
							modalOptions.receiptList = response.data;
							console.log(modalOptions.receiptList);
						});
					}
				};
				modalService.showModal(modalDefaults,modalOptions).then(function (result) {
					
					$scope.ok = function(){
						$modalInstance.close("ok");
					}
				});
				console.log(modalOptions.receiptList);
				
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
		
		//this is global method for filter 
		$scope.changeStatus = function(statusCol, showStatus) {
			$scope.filterStatus= {};
			(showStatus =="") ? delete $scope.user_id[statusCol] : $scope.filterStatus[statusCol] = showStatus;
			angular.extend($scope.user_id, $scope.filterStatus);
			if(statusCol == 'user_id' && showStatus == null) {
				angular.extend($scope.user_id, $scope.userInfo);
			}
			dataService.get("getmultiple/rent/1/"+$scope.pageItems, $scope.user_id)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.rentData = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.rentData = {};
					$scope.totalRecords = {};
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Enquiry List", response.message);
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
		
		/* switch($scope.rentView) {
			case 'invoice':
				openInvoice();
				break;
			default:
				businesslist();
		}; */
	};
		
	// Inject controller's dependencies
	rentreportController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('rentreportController', rentreportController);
});