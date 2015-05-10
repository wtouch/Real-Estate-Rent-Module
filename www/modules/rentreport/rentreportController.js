'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService','dataService'];
    
    // This is controller for this view
	var rentreportController = function ($scope,$rootScope,$injector,modalService,dataService) {
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.rentListCurrentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";
		
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
				console.log("modal opened")	
				
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
		$scope.pageChanged = function(page) {
			//function for Users list response
			dataService.get("getmultiple/rent/1/10", {status: 1, user_id : 1})
			.then(function(response) {  
				$scope.rentData = response.data;
				console.log(response);
				if(response.status == 'success'){
					$scope.rentreport = response.data;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("View rent rteport", response.message);
				}  
			});
		};
		//date picker
		$scope.today = function() {
			$scope.date = new Date();
		};
		$scope.open = function($event,rentdate){
			console.log($event);
			console.log(rentdate);
			
			$event.preventDefault();
			$event.stopPropagation();
			$scope.rentdate = ($scope.rentdate==true)?false:true;
		};
		$scope.opendate = function($event,selectDate){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.selectDate = ($scope.selectDate==true)?false:true;
		};
		dataService.get("getmultiple/rent/1/500", {status: 1, user_id : 1})
			.then(function(response) {  
				$scope.rentData = response.data;
				console.log(response);
				if(response.status == 'success'){
					$scope.rentreport = response.data;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("View rent rteport", response.message);
				}  
		});
		
	};
		
	// Inject controller's dependencies
	rentreportController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('rentreportController', rentreportController);
});