'use strict';
define(['app'], function (app) {
var injectParams = ['$scope', '$injector','$routeParams','$rootScope','dataService','modalService'];
  // This is controller for this view
	var projectController = function ($scope, $injector,$routeParams,$rootScope,dataService,modalService) {
		$rootScope.metaTitle = "Real Estate Project";
	
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.projectListCurrentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";		
		$scope.user_id = {user_id : $rootScope.userDetails.id}; 
		$scope.alerts = [];
		
		// function to close alert
		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		};
		
		//for dynamic tooltip
		$scope.dynamicTooltip = function(status, active, notActive){
			return (status==1) ? active : notActive;
		};
		//Code For Pagination
		$scope.pageChanged = function(page) { 
			angular.extend($scope.projectParam, $scope.user_id);
			dataService.get("getmultiple/project/"+page+"/"+$scope.pageItems,$scope.projectParam).then(function(response){
				$scope.projects = response.data;
			
			});
		};
		
		// for delete button
			$scope.deleted = function(id, delstatus){
				$scope.deletedData = {status : delstatus};
				//$scope.featuredData = {featured : 0};
				dataService.put("put/project/"+id, $scope.deletedData)
				.then(function(response) { 
					if(response.status == 'success'){
						$scope.projects=response.data;
						$scope.alerts.push({type: response.status, msg: response.message});
					}
				});
			};		
		
		$scope.searchFilter = function(statusCol, showStatus) {
			$scope.search = {search: true};
			$scope.filterStatus= {};
			$scope.projectParam={};
			(showStatus =="") ? delete $scope.projectParam[statusCol] : $scope.filterStatus[statusCol] = showStatus;
			angular.extend($scope.projectParam, $scope.filterStatus);
			angular.extend($scope.projectParam, $scope.search);
			if(showStatus.length >= 4 || showStatus == ""){
			dataService.get("getmultiple/project/1/"+$scope.pageItems, $scope.projectParam)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.projects = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.projects = {};
					$scope.totalRecords = {};
					$scope.alerts.push({type: response.status, msg: response.message});
				}
			});
			}
		}; 
		
		// code for filter data as per satus (delete/active)		
		$scope.changeStatus = function(statusCol, showStatus) {
			$scope.filterStatus= {};
			(showStatus =="") ? delete $scope.projectParam[statusCol] : $scope.filterStatus[statusCol] = showStatus;
			angular.extend($scope.projectParam, $scope.filterStatus);
			dataService.get("getmultiple/project/1/"+$scope.pageItems, $scope.projectParam)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.projects = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.projects = {};
					$scope.totalRecords = {};
					$scope.alerts.push({type: response.status, msg: response.message});
				}
			});
		};
		
		// code for change status when user delete/ active the project
		$scope.changeValue = function(statusCol,status) {
			$scope.filterStatus= {};
			(status =="") ? delete $scope.projectParam[statusCol] : $scope.filterStatus[statusCol] = status;
			angular.extend($scope.projectParam, $scope.filterStatus);
			angular.extend($scope.projectParam, $scope.search);			
			
			dataService.get("/getmultiple/project/1/"+$scope.pageItems, $scope.projectParam)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.projects = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.projects = {};
					$scope.totalRecords = {};
					$scope.alerts.push({type: response.status, msg: response.message});
				}				
			});
		};
		// code to access domain names dynamically
		$scope.userinfo={user_id:$rootScope.userDetails.id,status :1}
		dataService.get('getmultiple/website/1/200', $scope.userinfo).then(function(response){
				var domains = [];
				for(var id in response.data){
					var obj = {id: response.data[id].id, domain_name : response.data[id].domain_name};
					domains.push(obj);
				}
				$scope.domains = domains;
		});
		
		// code for open model in preview button
		$scope.open = function (url, projectId) {
			dataService.get("getsingle/project/"+projectId)
			.then(function(response) {
				var oldObj = response.data[0];
				var newObj = {};
				angular.forEach(oldObj, function(value, key) {
				  this[key] = (value.slice(0, 1) == "{" || value.slice(0, 1) == "[" ) ? JSON.parse(value) : value;
				}, newObj);
				
				var modalDefaults = {
					templateUrl: url,	// apply template to modal
					size : 'lg'
				};
				var modalOptions = {
					project: newObj // assign data to modal
				};
			
				modalService.showModal(modalDefaults, modalOptions).then(function (result) {
					
				});
			});
		};
		$scope.ok = function () {
			$modalOptions.close('ok');
		};
		
		// code for view project details
		$scope.projectParam = {status : 1};			
		angular.extend($scope.projectParam,$scope.user_id);
		dataService.get("/getmultiple/project/"+$scope.projectListCurrentPage+"/"+$scope.pageItems, $scope.projectParam)
		.then(function(response) {  
			$scope.totalRecords = response.totalRecords;
			$scope.projects = response.data;
		});
		
	/***********************************************************************************/	
			//update single record
			
			if($routeParams.id){//Update user			
			dataService.get("getsingle/project/"+$routeParams.id)
			.then(function(response) {
					$scope.projects = response.data;	
					console.log(projects);					
				});				
			$scope.update = function(projects){				
				console.log(projects);	
				
				/*  dataService.put("put/project/"+$routeParams.id ,projects)
				.then(function(response) { 	//function for response of request project
					if(response.status == 'success'){
						$scope.submitted = true;
						$scope.alerts.push({type: response.status,msg: response.message});						
					}else{
						
						$scope.alerts.push({type: response.status,msg: response.message});
					}	
				});	 */ 
			};	
	/***********************************************************************************/	
	 };		 
	// Inject controller's dependencies
	projectController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('projectController', projectController);
});