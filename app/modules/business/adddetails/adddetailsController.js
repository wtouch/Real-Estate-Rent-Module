'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope', '$injector','$routeParams','$location','dataService','upload','modalService', '$rootScope', '$cookies', '$cookieStore'];

    // This is controller for this view
	var adddetailsController = function ($scope, $injector,$routeParams,$location,dataService,upload,modalService, $rootScope, $cookies, $cookieStore)
	{ 
		dataService.get("getsingle/business/"+$routeParams.id)
		.then(function(response) {
			$scope.businessData = dataService.parse(response.data);
			if($scope.businessData.infrastructure == "") $scope.businessData.infrastructure = {};
			if($scope.businessData.testimonials == "") $scope.businessData.testimonials = {};
			if($scope.businessData.news_coverage == "") $scope.businessData.news_coverage = {};
			if($scope.businessData.gallery == "") $scope.businessData.gallery = {};
			if($scope.businessData.job_careers == "") $scope.businessData.job_careers = {};
		});	
		
		// all $scope object goes here
		$scope.alerts = [];
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.pageItems = 10;
		$scope.numPages = "";
		$scope.userInfo = {user_id : $rootScope.userDetails.id};
		$scope.currentDate = dataService.currentDate;
		$scope.business_id = $routeParams.id;
		$scope.userinfo = $scope.userInfo; // this is for uploading credentials
		$scope.path = "business/"+$scope.userInfo.user_id; // path to store images on server
		$scope.infrastructure = { desc : { }};
		$scope.testimonials = { desc : { }};
		$scope.news_coverage = { desc : {  }};
		$scope.job_careers = { desc : {  }};
		$scope.gallery = { desc : {  }};
		//$scope.today();
		$scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.format = $scope.formats[0];
		//code for accessing json data of business	
		$scope.biz = {};
		dataService.config('config', {config_name : "business"}).then(function(response){
			$scope.biz = response.config_data;
		});
		
		$scope.today = function() {
			$scope.date = new Date();
		};
		$scope.open = function($event,testimonialdate){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.testimonialdate = ($scope.testimonialdate==true)?false:true;
		};
		$scope.opendate = function($event,selectDate){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.selectDate = ($scope.selectDate==true)?false:true;
		};
		// config data for business form
		$scope.biz = dataService.config.business;
		
		// Add Business multi part form show/hide operation from here!
		$scope.formPart = ($cookies.bizFormPart) ? $cookieStore.get("bizFormPart") : 'infrastructure';
		
		//function for close alert
		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		};
		$scope.infra = false;
		$scope.imgRemoved = false;
		
		// Scope  Global methods
		$scope.showFormPart = function(formPart){
			$cookieStore.put("bizFormPart", formPart);
			$scope.formPart = $cookieStore.get("bizFormPart");
			$scope.headingDisabled = false;
			$scope.infra = false;
		};
		
		$scope.addToObject = function(data, object, resetObj){
			var dtlObj = JSON.stringify(data.desc);
			object[data.heading] = JSON.parse(dtlObj);
			$scope.headingDisabled = false;
			$scope.infra = false;
			$scope[resetObj] = { desc : { }};
		}
		
		$scope.removeObject = function(key, object){
			$scope.imgRemoved = true;
			delete object[key];
		}
		$scope.editObject = function(key, object, FormObj){
			$scope.headingDisabled = true;
			$scope.imgRemoved = true;
			var dtlObj = JSON.stringify(object[key]);
			FormObj['desc'] = JSON.parse(dtlObj);
			FormObj['heading'] = key;
		}
		
		$scope.showForm = function(obj, resetObj){
			$scope[obj] = !$scope[obj];
			if(resetObj){
				$scope.headingDisabled = false;
				$scope.imgRemoved = true;
				$scope[resetObj] = { desc : {}};
			}
		}
		
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
		
		//Upload Functions for uploading files 
		$scope.upload = function(files,path,userInfo, picArr){ 
			upload.upload(files,path,userInfo,function(data){
					if(data.status === 'success'){
						$scope.infrastructure.desc.image = data.data;
					}else{
						$scope.alerts.push({type: data.status, msg: data.message});
					}
			}); 
		}; 
		$scope.uploadtesti = function(files,path,userInfo, picArr){ 
			upload.upload(files,path,userInfo,function(data){
					if(data.status === 'success'){
						$scope.testimonials.desc.image = data.data;
					}else{
						$scope.alerts.push({type: data.status, msg: data.message});
					}
			}); 
		}; 
		
		$scope.uploadnews = function(files,path,userInfo, picArr){ 
			upload.upload(files,path,userInfo,function(data){
					if(data.status === 'success'){
						$scope.news_coverage.desc.image = data.data;
					}else{
						$scope.alerts.push({type: data.status, msg: data.message});
					}
			}); 
		}; 
		$scope.uploadgallery = function(files,path,userInfo, picArr){ 
			upload.upload(files,path,userInfo,function(data){
					if(data.status === 'success'){
						$scope.gallery.desc.image = data.data;
					}else{
						$scope.alerts.push({type: data.status, msg: data.message});
					}
			}); 
		}; 
		// to generate thumbnail of image
		$scope.generateThumb = function(files){ 
			upload.generateThumbs(files);
		};
			
		//Update business form code here
		$scope.update = function(businessData){				
			dataService.put("put/business/"+ $scope.business_id, businessData)  
			 .then(function(response) { 
				if(response.status == 'success'){
					$scope.submitted = true;
					$scope.alerts.push({type: response.status,msg: response.message});
					if($rootScope.userDetails.config.addProducts == false) $location.path("/dashboard/business/products");
					dataService.progressSteps('addbusinessDetails', true);
				}else{
					$scope.alerts.push({type: response.status,msg: response.message});
				}
			});
		};
    };
	
	// Inject controller's dependencies
	adddetailsController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('adddetailsController', adddetailsController);

});
