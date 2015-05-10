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
		
		$scope.ok = function () {
			$modalInstance.close();
		};
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		
		$scope.openRent = function (url,rentId) {
			dataService.get("getsingle/rent/"+rentId).then(function(response) {
				var modalDefaults = {
						templateUrl: url,	
						size : 'lg'
				};
				var modalOptions = {
					rentList : response.data,
					formData : function(rentList){
						modalOptions.rentList = rentList;
					},
				};
				modalService.showModal(modalDefaults).then(function (result) {
					console.log("modal opened")	
				});
				console.log(modalOptions.rentList);
			});
		};
		
		$scope.open= function (url) {
			var modalDefaults = {
				templateUrl: url,	
				size : 'lg'
			};
			
			$scope.ok = function(){
				$modalInstance.close("ok");
			}
			modalService.showModal(modalDefaults).then(function (result) {
				console.log("modal opened")	
				$scope.ok = function(){
					$modalInstance.close("ok");
				}
			});
		};
		
		$scope.pageChanged = function(page, rentParams) {
			dataService.get("getmultiple/rent/"+page+"/"+$scope.pageItems, $scope.rentParams)
			.then(function(response) { 
				$scope.rentData = response.data;			
			});
		}; 
		
		$scope.today = function() {
			$scope.date = new Date();
		};
		$scope.open = function($event,opened){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.opened = ($scope.opened==true)?false:true;
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