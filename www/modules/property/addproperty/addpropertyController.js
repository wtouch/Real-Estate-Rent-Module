'use strict';
define(['app'], function (app) {
    var injectParams = ['$scope', '$injector','$routeParams','$http','$rootScope','upload', '$timeout', 'dataService'
	,'$location'];
    // This is controller for this view
	var addpropertyController = function ($scope, $injector,$routeParams,$http,$rootScope, upload, $timeout,
	dataService,$location) {
		$rootScope.metaTitle = "Add Real Estate Property";
		
		// all $scope object goes here
		$scope.alerts = [];
		$scope.userInfo = {user_id : $rootScope.userDetails.id};
		$scope.currentDate = dataService.currentDate;
		$scope.property = { property_images : []};
		$scope.editId = $routeParams.id;
		
		dataService.config('config', {config_name : "property"}).then(function(response){
			$scope.propertyConfig = response.config_data;
		});
		
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
		
		// to close alert message
		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		};
		
		// to next button code
			 $scope.status = {
				isFirstOpen: true,
				isFirstDisabled: false,
			};
	
		$scope.getData = function(location){
			$scope.readOnly = true;
			$scope.property.property_location.location = location.location;
			$scope.property.property_location.city = location.city;
			$scope.property.property_location.state = location.state;
			$scope.property.property_location.country = location.country;
			$scope.property.property_location.area = location.area;
			$scope.property.property_location.pincode = location.pincode;
		}
		$scope.getTypeaheadData = function(table, searchColumn, searchValue){
			var locationParams = {search : {}}
			locationParams.search[searchColumn] = searchValue;
			return dataService.config('locations', locationParams).then(function(response){
				return response;
			});
		}
		// this function for uploading files
		$scope.upload = function(files,path,userInfo, picArr){
			console.log($scope.property);
			upload.upload(files,path,userInfo,function(data){
				if(data.status === 'success'){
					$scope.property[picArr].push(data.data);
				}else{
					$scope.alerts.push({type: data.status, msg: data.message});
				}
			});
		};
		$scope.generateThumb = function(files){  
			upload.generateThumbs(files);
		};// end file upload code
		
	
	/*********************************************************************/
		
		// Add Business multi part form show/hide operation from here! {pooja}
		$scope.formPart = 'property';
		$scope.showFormPart = function(formPart){
			$scope.formPart = formPart;
		};

		dataService.get('getmultiple/property/1/50', $scope.userInfo).then(function(response){
				$scope.addPropStruct = response.data;				
		});
		
		/************************************************************************************/
		//Add property
		$scope.addPropertyFun = function(property){	
			$scope.property.user_id= $rootScope.userDetails.id;
			$scope.property.date = $scope.currentDate;
			dataService.post("post/property",property,$scope.userInfo)
			.then(function(response) {
				if(response.status=="success"){
					$scope.alerts.push({type: response.status, msg: response.message});
				}else{
					$scope.alerts.push({type: response.status, msg: response.message});
				}
			});
		};
		//update into property
		if($scope.editId){//Update user
			dataService.get("getsingle/property/"+$routeParams.id)
			.then(function(response) {
				$scope.property = response.data;
				if($scope.property.property_images == "") $scope.property.property_images = [];
				console.log($scope.property);					
			});	

			$scope.update = function(property){
				dataService.put("put/property/"+$routeParams.id,property)
				.then(function(response) { //function for response of request temp
					if(response.status == 'success'){
						$scope.submitted = true;
						$scope.alerts.push({type: response.status,msg: response.message});						
					}else{
						$scope.alerts.push({type: response.status, msg: response.message});
					}	
				});	  
			};	 
		}			
	/*********************************************************************/	
	//display websites-domain into checkbox $scope.userInfo $routeParams.id
	
		dataService.get('getmultiple/website/1/200',$scope.userInfo)
		.then(function(response) {
			var websites = [];
			for(var id in response.data){
				var obj = {id: response.data[id].id, domain_name : response.data[id].domain_name};
				websites.push(obj);
			}
			$scope.websites = websites;
		})  
		$scope.$watchCollection('websites', function(newNames, oldNames) {	
		}); 
		$scope.checkAll = function(websites, checkValue) {			
			if(checkValue){
				$scope.property.domain = angular.copy(websites);
			}
		}; 
	/*********************************************************************/	
		
	};		
	
	// Inject controller's dependencies
	addpropertyController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('addpropertyController', addpropertyController);
	
});
