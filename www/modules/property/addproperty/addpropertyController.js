'use strict';
define(['app'], function (app) {
    var injectParams = ['$scope', '$injector','$routeParams','$http','$rootScope','upload', '$timeout', 'dataService'];
    // This is controller for this view
	var addpropertyController = function ($scope, $injector,$routeParams,$http,$rootScope, upload, $timeout,dataService) {
		$rootScope.metaTitle = "Add Real Estate Property";
		
		// all $scope object goes here
		$scope.alerts = [];
		$scope.userinfo = {user_id : $rootScope.userDetails.id};
		$scope.currentDate = dataService.currentDate;
		$scope.property = dataService.config.property;
		$scope.property={};
		
		//$scope.property = {};
		dataService.config('config', {config_name : "property"}).then(function(response){
			$scope.property = response.config_data;
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
			
			// this function for uploading files
			$scope.upload = function(files,path,userinfo, picArr){ 
				upload.upload(files,path,userinfo,function(data){
					var picArrKey = 0, x;
					for(x in picArr) picArrKey++;
					if(data.status === 'success'){
						picArr[picArrKey] = data.details;
						
					}else{
						$scope.alerts.push({type: data.status, msg: data.message});
					}
					
				}); 
			};
			$scope.generateThumb = function(files){  
				upload.generateThumbs(files);
			};// end file upload code
		
	/**********************************************************************/
		//display records from config.js to combo
		
		$scope.propertyConfig = dataService.config.property;					
		
		
	/*********************************************************************/
		
		// Add Business multi part form show/hide operation from here! {pooja}
		$scope.formPart = 'property';
		$scope.showFormPart = function(formPart){
			$scope.formPart = formPart;
		};
	/*********************************************************************/
		
	//dynamic dropdwnlist of country,state & city
	
		$scope.contries = dataService.config.country;
		
		 $scope.getState = function(country){
			var states = [];
			for (var x in $scope.contries){
				if($scope.contries[x].country_name == country){
					for(var y in $scope.contries[x].states){
						states.push($scope.contries[x].states[y])
					}
				}
			}
			$scope.states = states;
		};
		
		
		$scope.getCities = function(state){
			var cities = [];
			for (var x in $scope.states){
				if($scope.states[x].state_name == state){
					for(var y in $scope.states[x].cities){
						cities.push($scope.states[x].cities[y])
					}
				}
			}
			$scope.cities = cities;
		}; 
		
	/*********************************************************************/
	
	//display dynamic list from project table 
		dataService.get('getmultiple/project/1/50', $scope.userinfo)
			.then(function(response){
												
				$scope.addProjName = response.data;				
			});

         
		dataService.get('getmultiple/property/1/50', $scope.userinfo)
			.then(function(response){
												
				$scope.addPropStruct = response.data;				
		}); 
			
	/************************************************************************************/		
		
		 //Add property
		$scope.addPropertyFun = function(property){	
			
			$scope.property.date = $scope.currentDate;
			dataService.post("post/property",property,$scope.userinfo)
			.then(function(response) {
				
				if(response.status=="success"){
					$scope.alerts.push({type: response.status, msg: response.message});
				}else{
					$scope.alerts.push({type: response.status, msg: response.message});
				}				
			}); 
			/********************************************************************************/
			//update into property
			};
			 if($routeParams.id){//Update user
				console.log($routeParams.id);	
				dataService.get("getsingle/property/"+$routeParams.id)
				.then(function(response) {
						$scope.property = response.data;	
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
	//display websites-domain into checkbox $scope.userinfo $routeParams.id
	
		dataService.get('getmultiple/website/1/200',$scope.userinfo)
		.then(function(response) {
			var websites = [];
			for(var id in response.data){
				var obj = {id: response.data[id].id, domain_name : response.data[id].domain_name};
				websites.push(obj);
			}
			$scope.websites = websites;
		})  
		 /* $scope.websites = [
			{id:1, domain_name:"google.com"},
			{id:2, domain_name:"wtouch.in"},
		]; */
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
