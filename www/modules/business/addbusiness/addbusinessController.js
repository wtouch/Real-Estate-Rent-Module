'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope', '$injector','$routeParams','$location','dataService','upload','modalService', '$rootScope','$notification'];

    // This is controller for this view
	var addbusinessController = function ($scope, $injector,$routeParams,$location,dataService,upload,modalService, $rootScope,$notification)
	{
		// all $scope object goes here
		
		$scope.estyear = [];
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.pageItems = 10;
		$scope.numPages = "";
		$scope.userInfo = {user_id : $rootScope.userDetails.id};
		$scope.currentDate = dataService.currentDate;
		$scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.format = $scope.formats[0];
		$scope.readOnly = false;
		$scope.formPart = 'home';	
		$scope.addbusiness= {};
		$scope.formSteps = 0;
		$scope.reset = function() {
			$scope.addbusiness = {
				created_date : $scope.currentDate,
				contact_profile : {},
				business_profile : { establishment : 2014}
			};
		};
		// to add establish year in combobox
		var date = new Date();
		var todayYear = date.getFullYear();
		for (var value =1900; value <= todayYear;value++){
			$scope.estyear.push(value);
		}
		
		//code for datepicker
		$scope.today = function(){
			$scope.newsDate = new Date();
		};
		$scope.open = function($event,opened){
			$event.preventDefault();
			$event.stopPropagation();
			$scope[opened] = ($scope[opened]===true) ? false : true;
		};
		
		// Add Business multi part form show/hide operation from here! {Vilas}
		$scope.showFormPart = function(formPart, formSteps){
			$scope.formPart = formPart;
			if(formSteps != undefined ) $scope.formSteps = formSteps;
		};
		//code for accessing json data of business	
		$scope.biz = {};
		dataService.config('config', {config_name : "business"}).then(function(response){
			$scope.biz = response.config_data;
		});
		$scope.getData = function(location){
			$scope.readOnly = true;
			$scope.addbusiness.location = location.location;
			$scope.addbusiness.city = location.city;
			$scope.addbusiness.state = location.state;
			$scope.addbusiness.country = location.country;
			$scope.addbusiness.area = location.area;
			$scope.addbusiness.pincode = location.pincode;
		}
		$scope.getTypeaheadData = function(table, searchColumn, searchValue){
			var locationParams = {search : {}}
			locationParams.search[searchColumn] = searchValue;
			return dataService.config('locations', locationParams).then(function(response){
				return response;
			});
		}
		$scope.searchCategory = function(searchValue){
			var categoryParms = {search : {}}
			categoryParms.search.category_name = searchValue;
			return dataService.config('business_category',categoryParms).then(function(response){
				return response;
			});
		}
		$scope.setCategoryType = function(item){
			$scope.addbusiness.category = item.id;
			$scope.getTypes(item.id);
			$scope.addbusiness.type = item.type_id;
			$scope.getKeywords(item.type_id);
		}
		$scope.getCategory = function(filterColumn){
			if(filterColumn){
				var locationParams = {filter : {parent_id : filterColumn}, groupBy: 'category_name'};
			}else{
				var locationParams = {filter : {parent_id : 0}, groupBy: 'category_name'};
			}
			dataService.config('business_category',locationParams).then(function(response){
				$scope.businessCategories = response;
			});
		}
		$scope.getCategory(0);
		$scope.getTypes = function(filterColumn){
			var locationParams = {filter : {parent_id : filterColumn}, groupBy: 'type'};
			dataService.config('business_category',locationParams).then(function(response){
				$scope.businessTypes = response;
			});
		}
		$scope.getKeywords = function(filterColumn){
			var locationParams = {filter : {parent_id : filterColumn}};
			dataService.config('business_category',locationParams).then(function(response){
				$scope.businessKyewords = response;
			});
		}
		
		 //function for websitelist response
		dataService.get("getmultiple/user/1/500", {status: 1, user_id : $rootScope.userDetails.id})
		.then(function(response) { 
			if(response.status == 'success'){
				$scope.customerList = response.data;
			}else{
				$notification.error("Get Customers", response.message);
			}
		});
		
		$scope.path = "business/"; 
		$scope.userinfo = $scope.userInfo; // this is for uploading credentials	
		$scope.upload = function(files,path,userInfo, picArr){ 
			upload.upload(files,path,userInfo,function(data){
				if(data.status === 'success'){
					if(picArr == "business_logo"){
						$scope.addbusiness.business_logo = data.data;
					}
					if(picArr == "contact_photo"){
						$scope.addbusiness.contact_profile.contact_photo = data.data;
					}
				}else{
					$notification.error("Upload Image", data.message);
				}
			});
		};
		//to generate thumbnail
		$scope.generateThumb = function(files){  
			upload.generateThumbs(files);
		};
		//to add business code
		$scope.postData = function(addbusiness) {
			dataService.post("post/business",addbusiness)
			.then(function(response) { 
				if(response.status == "success"){
					if($rootScope.userDetails.config.addbusinessDetails != true)  $location.path("/dashboard/business/adddetails/"+response.data);
					dataService.progressSteps('addbusiness', true);
					dataService.progressSteps('addbusinessDetails', response.data);
				}
				if(response.status == undefined){
					$notification.error("Add Business", response.message);
				}else{
					$notification[response.status]("Add Business", response.message);
				}
				
			});
		}
		
		//code for get data from business
		if($routeParams.id){
			$scope.id=$routeParams.id
			dataService.get("getsingle/business/"+$routeParams.id)
			.then(function(response) {
				if(response.status == 'success'){
					$scope.addbusiness = (response.data);
					$scope.getTypes($scope.addbusiness.category);
					$scope.getKeywords($scope.addbusiness.type);
				}else{
					if(response.status == undefined){
						$notification.error("Edit Business", response.message);
					}else{
						$notification[response.status]("Edit Business", response.message);
					}
				}
			});
			$scope.updateData = function(addbusiness) {
				dataService.put("put/business/"+$routeParams.id,addbusiness)
				.then(function(response) {
					if(response.status == "success"){
						$location.path("/dashboard/business/businesslist");
					}
					if(response.status == undefined){
						$notification.error("Edit Business", response.message);
					}else{
						$notification[response.status]("Edit Business", response.message);
					}
					
				});
			}
		}
    };
	// Inject controller's dependencies
	addbusinessController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('addbusinessController', addbusinessController);

});
