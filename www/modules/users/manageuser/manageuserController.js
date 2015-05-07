'use strict';

define(['app'], function (app) { 
    var injectParams = ['$scope','$rootScope', '$injector', '$routeParams','$location','dataService','$route','$notification']; 
   
	var manageuserController = function ($scope,$rootScope, $injector, $routeParams,$location,dataService,$route,$notification) {
		$scope.permission = $rootScope.userDetails.permission.user_module;
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.usersGroupCurrentPage = 1;
		$scope.usersListCurrentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";	
		$scope.userList = [];
		$scope.currentDate = dataService.currentDate;
		$scope.userInfo = {user_id : $rootScope.userDetails.id};
		$scope.contries = dataService.config.country;
		$scope.adduser ={};
		$scope.manage_user = dataService.config.manage_user;
		$scope.userViews = $routeParams.userViews;
		//code for accessing json data of users
		$scope.manage_user = {};
		dataService.config('config', {config_name : "manage_user"}).then(function(response){
			$scope.manage_user = response.config_data;
			
		});

		$scope.getData = function(location){
			$scope.readOnly = true;
			$scope.adduser.address.location = location.location;
			$scope.adduser.address.city = location.city;
			$scope.adduser.state = location.state;
			$scope.adduser.country = location.country;
			$scope.adduser.address.area = location.area;
			$scope.adduser.address.pincode = location.pincode;
		}
		$scope.getTypeaheadData = function(table, searchColumn, searchValue){
			var locationParams = {search : {}}
			locationParams.search[searchColumn] = searchValue;
			return dataService.config('locations', locationParams).then(function(response){
				return response;
			});
		}
		
		// for dynamic value of group name
		dataService.get('getmultiple/usergroup/1/200').then(function(response){
			if(response.status=='success'){
				$scope.groups = response.data;
			}else{
				$notification.error("Get User Groups", response.message);
			}
		}) ;
		$scope.changeGroupName = function(group_id, groups){
			var group_name;
			for(var x in groups){
				if(groups[x].id == group_id) group_name = groups[x].group_name;
			}
			return group_name;
		}
		
		$scope.disableGroup = function(group_name){
			if(group_name == ("admin" || "manager") && $rootScope.userDetails.group_name != "admin"){
				return true;
			}
		}
		$scope.disColors = function(color){
		  return color.group_name == 'admin' || color.group_name == 'manager';
		}
		
		//For display by default userslist.html page
		if(!$routeParams.userViews) {
			$location.path('/dashboard/users/userslist');
		}
		
		//change tooltip dynamically
		$scope.dynamicTooltip = function(status, active, notActive){
			return (status==1) ? active : notActive;
		};
		
		//datepicker {sonali}	
		$scope.today = function() {
			$scope.date = new Date();
		};
		
		$scope.open = function($event,opened)
		{
			$event.preventDefault();
			$event.stopPropagation();
			$scope.opened = ($scope.opened==true)?false:true;
		};
		$scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.format = $scope.formats[0];
	
		//code for pagination
		$scope.pageChanged = function(page) {
			if($scope.userViews == 'userslist'){
				dataService.get("getmultiple/user/"+page+"/"+$scope.pageItems, $scope.userInfo).then(function(response){
					if(response.status == "success"){
						$scope.userList = response.data;
						$scope.totalRecords = response.totalRecords;
					}else{
						$notification.error("User Groups", response.message);
					}
				});
				
			}
			if($scope.userViews == 'usersgroup'){
				dataService.get("getmultiple/usergroup/"+page+"/"+$scope.pageItems).then(function(response){
					if(response.status == "success"){
						$scope.usergroupList = response.data;
						$scope.totalRecords = response.totalRecords;
					}else{
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("User Groups", response.message);
					}
					
				});
			}
			
		};	
		
		dataService.get("getmultiple/user/1/100", $scope.userInfo)
		.then(function(response) {
			if(response.status == "success"){
				$scope.selectUsers = response.data;
			}else{
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("User Groups", response.message);
			}
		});	
		
		//code for search filter
		$scope.searchFilter = function(statusCol, colValue) {
			$scope.search = {search: true};
			$scope.userParams = {};
			$scope.usergroupParams = {};
			$scope.filterStatus= {}; 
			(colValue =="") ? delete $scope.userParams[statusCol] : $scope.filterStatus[statusCol] = colValue;
			angular.extend($scope.userParams, $scope.filterStatus, $scope.userInfo, $scope.search);
			angular.extend($scope.usergroupParams, $scope.filterStatus, $scope.search);
			if(colValue.length >= 4 || colValue ==""){
				if($scope.userViews == 'userslist'){
					dataService.get("/getmultiple/user/1/"+$scope.pageItems, $scope.userParams).then(function(response) { 
						if(response.status == 'success'){
							$scope.userList = response.data; // this will change for template
							$scope.totalRecords = response.totalRecords; // this is for pagination
						}else{
							$scope.userList = {};
							$scope.totalRecords = {};
							if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
							$notification[response.status]("Get Users List", response.message);
						}
					});
				}
				if($scope.userViews == 'usersgroup'){
					dataService.get("/getmultiple/usergroup/1/"+$scope.pageItems, $scope.usergroupParams).then(function(response) { 
						if(response.status == 'success'){
							$scope.usergroupList = dataService.parse(response.data); 
							$scope.totalRecords = response.totalRecords; 
						}else{
							$scope.usergroupList = {};
							$scope.totalRecords = {};
							if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
							$notification[response.status]("Get User Group List", response.message);
						}
					});
				}
			}
		};
		
		//global method for change status of particular column 
		$scope.hideDeleted = "";
		$scope.changeStatus = {};
		$scope.changeStatusFn = function(colName, colValue, id){
			$scope.changeStatus[colName] = colValue;
			if($scope.userViews=='userslist'){
				dataService.put("put/user/"+id, $scope.changeStatus)
				.then(function(response) {
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("User Modification", response.message);
				});
			}
			if($scope.userViews=='usersgroup'){
				dataService.put("put/usergroup/"+id, $scope.changeStatus)
				.then(function(response) {
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("User Group Modification", response.message);
				}); 
			}
		};
		
		$scope.editGroupName = function(colName, colValue, id, editStatus){
			$scope.changeStatus[colName] = colValue;
			if(editStatus==0){
				 dataService.put("put/user/"+id,$scope.changeStatus)
				.then(function(response) { 
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Edit Group Name", response.message);
				}); 
			}
		};	
		$scope.showDropDown = function($event,opened){
			$scope.user_groups = []; 				  				
			$event.preventDefault();
			$event.stopPropagation();
			$scope[opened] = ($scope[opened] ===true) ? false : true;
		};
		
		//this is global method for filter 
		$scope.changeStatus = function(statusCol, showStatus) {
			$scope.filterStatus= {};
			(showStatus =="") ? delete $scope.username[statusCol] : $scope.filterStatus[statusCol] = showStatus;
			angular.extend($scope.username, $scope.filterStatus);
			if(statusCol == 'user_id' && showStatus == null) {
				angular.extend($scope.username, $scope.userInfo);
			}
			dataService.get("getmultiple/users/1/"+$scope.pageItems, $scope.username)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.users = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.users = {};
					$scope.totalRecords = {};
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Template List", response.message);
				}
			});
		};
		
		
		
		//code for forgot password
		$scope.forgotPass = function(colName, colValue, id){
			$scope.changeStatus[colName] = colValue;				
				 dataService.post("post/user/forgotpass", $scope.changeStatus)
				.then(function(response) {					
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Reset User's Password", response.message);
			}); 
		};
		
		//function for Users list response
		dataService.get("getmultiple/user/1/500", {status: 1, user_id : $rootScope.userDetails.id})
		.then(function(response) {  
			if(response.status == 'success'){
				$scope.customerList = response.data;
			}else{
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Get Customers", response.message);
			}
		});
		
		
		//code for add user
		var addUsers =	function(){
			$scope.checkuserAvailable = function(fieldName, fieldValue){
				$scope.checkParams = {};
				$scope.checkParams[fieldName] = fieldValue;
				dataService.post("post/user/checkavailability",$scope.checkParams)
				.then(function(response) { 
					if(response.status == 'success'){
						if(fieldName == 'username') $scope.UserAvailable = true;
						if(fieldName == 'email') $scope.EmailAvailable = true;
					}else{
						if(fieldName == 'username') $scope.UserAvailable = false;
						if(fieldName == 'email') $scope.EmailAvailable = false;
					}
					$scope.availabilityMsg = response.message;
				});
			}
			$scope.reset = function() {
				$scope.adduser = {};
			};
			$scope.postData = function(adduser) {
				var register_date = {register_date : $scope.currentDate};
				angular.extend(adduser, register_date,$scope.userInfo);
				dataService.post("post/user/register",adduser)
				.then(function(response) {  
					if(response.status == 'success'){
						$scope.adduser = {};
						$scope.submitted = true;
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Add User", response.message);
				});
			}
			$scope.editUserId = $routeParams.id;
			if($routeParams.id){
				dataService.get("getsingle/user/"+$routeParams.id)
				.then(function(response) {
					if(response.status=="success"){
						$scope.adduser = response.data;
					}else{
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Get User Details", response.message);
					}
				});
				$scope.update = function(adduser){
					dataService.put("put/user/"+$routeParams.id,adduser)
					.then(function(response) {
						if(response.status == 'success'){
							$scope.submitted = true;
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Edit User Details", response.message);
					});
				};
			}
		};			
		
		//create user group
		var usersGroup = function(){
			$scope.usersgroupData = {
				group_permission : {
					user_module : {},
					group_access : {},
					template_module : {},
					business_module : {},
					product_module : {},
					website_module : {},
					enquiry_module : {},
					dashboard : {}
				},
				config:{}
			};
			$scope.editForm = false;
			$scope.reset = function() {
				$scope.usersgroup = angular.copy($scope.usersgroupData);
			};
			$scope.reset();
			$scope.usersgroup.date = $scope.currentDate;
			$scope.postData = function(usersgroup) {
				dataService.post("post/usergroup",usersgroup)
				.then(function(response) {  
					if(response.status == 'success'){
						$scope.reset();
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Add User Group", response.message);
					
				});
			}

			if($routeParams.id){
				$scope.editForm = true;
				dataService.get("getsingle/usergroup/"+$routeParams.id)
				.then(function(response) {
					if(response.status == "success"){
						$scope.usersgroup = dataService.parse(response.data);
						if($scope.usersgroup.config == (undefined || "")) $scope.usersgroup.config = {};
						if($scope.usersgroup.group_permission == (undefined)) $scope.usersgroup.group_permission = {};
						if($scope.usersgroup.group_permission.enquiry_module == (undefined)){
							$scope.usersgroup.group_permission.enquiry_module = {}
						};
					}else{
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Edit User Group", response.message);
					}
				});
				$scope.update = function(usersgroup){
					dataService.put("put/usergroup/"+$routeParams.id,usersgroup)
					.then(function(response) {
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Edit User Group", response.message);
					});
				};
			}
		}	
		
		// code  for users list
		var usersList = function(){
			dataService.get("getmultiple/user/"+$scope.usersListCurrentPage+"/"+$scope.pageItems, $scope.userInfo).then(function(response) {
				if(response.status == 'success'){
					$scope.userList = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Users List", response.message);
				}
			});
		}
		//code for users group list
		var usersgroupList = function(){
			dataService.get("getmultiple/usergroup/"+$scope.usersGroupCurrentPage+"/"+$scope.pageItems).then(function(response) { 
				if(response.status == 'success'){
					$scope.usergroupList = dataService.parse(response.data);
					if($scope.usergroupList.config == (undefined || "")) $scope.usergroupList.config = {};
					$scope.totalRecords = response.totalRecords;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get User Group List", response.message);
				}
			});
		}
		switch($scope.userViews) {
			case 'adduser':
				addUsers();
				break;
				
			case 'createusergroup':
				usersGroup();
				break;
				
			case 'userslist':
				usersList();
				break;
				
			case 'usersgroup':
				usersgroupList();
				break;
				
			default:
				usersList();
		};
	};
	// Inject controller's dependencies
	manageuserController.$inject = injectParams;
	// adduser/apply controller dynamically
    app.register.controller('manageuserController', manageuserController);
});