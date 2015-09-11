'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope', '$rootScope','$injector','$routeParams','$location','dataService','upload','modalService', '$notification'];
	
	var websitesController = function ($scope,$rootScope,$injector,$routeParams,$location,dataService,upload,modalService,$notification) {
		//all $scope object goes here
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.webListCurrentPage = 1;
		$scope.reqestSiteCurrentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";
		$scope.currentDate = dataService.currentDate;
		$scope.permission = $rootScope.userDetails.permission.website_module;
		$scope.userInfo = {user_id : $rootScope.userDetails.id}; // these are URL parameters
		$scope.websitePart = $routeParams.websitePart;
		$scope.formPart = 'checkdomainavailable';
		$scope.changeStatus={};
		$scope.showFormPart = function(formPart){
			$scope.formPart = formPart;
		};
		$scope.setFormScope= function(scope){
			$scope.formScope = scope;
		}
		
		$scope.getBusiness = function(user_id){
		// code for get business list
			dataService.get("getmultiple/business/1/100",{user_id:user_id, status : 1})
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.businessList = response.data;
				}else{
					$notification.error("Get Business", "You didn't added any business! Please add business first.");
					
				}
			});
			
			// code for get business list
			dataService.get("getmultiple/mytemplate/1/100",{user_id:user_id, status : 1})
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.templateList = response.data;
				}else{
					
					$notification.error("Get Template", "You didn't have any Template! Please apply free template or buy new template first.");
					
				}
			});
		}
		
		//For display by default website list
		if(!$scope.websitePart) {
			$location.path('/dashboard/websites/websiteslist');
		}
		$scope.checkAvailable = function(domain_name){
			if(domain_name !== undefined){
				dataService.post("post/domain", {domain : domain_name }).then(function(response){
					if(response[domain_name].status == 'available'){
						$scope.formScope.requestsiteForm.domain_name.$setValidity('available', true);
						$scope.domainAvailableMsg = "Domain Available";
					}else{
						$scope.formScope.requestsiteForm.domain_name.$setValidity('available', false);
						$scope.domainAvailableMsg = "Domain not available please select another!";
					}
				})
			}else{
				$scope.formScope.requestsiteForm.domain_name.$setValidity('available', false);
			}
		};
		
		$scope.checkSubsomainAvailable = function(domain_name){
			if(domain_name !== undefined){
				dataService.post("post/domain", {domain : domain_name }, {subdomain : true}).then(function(response){
					if(response.status == 'success'){
						$scope.formScope.requestsiteForm.subdomain.$setValidity('available', true);
						$scope.domainAvailableMsg = "Domain Available";
					}else{
						$scope.formScope.requestsiteForm.subdomain.$setValidity('available', false);
						$scope.domainAvailableMsg = "Domain not available please select another!";
					}
				})
			}else{
				$scope.formScope.requestsiteForm.domain_name.$setValidity('available', false);
			}
		}
		
		//open function for previewing the website
        $scope.open = function (url, webId) {
			dataService.get("getsingle/website/"+webId)
			.then(function(response) {
				var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
				};
				var modalOptions = {
					website: dataService.parse(response.data)
				};
				modalService.showModal(modalDefaults, modalOptions).then(function (result) {
				}); 
			});
		};
		
		// All $scope methods
        $scope.pageChanged = function(page,where) { 
			(where) ? angular.extend($scope.websiteParams, where, $scope.userInfo) : "";
			dataService.get("getmultiple/website/"+page+"/"+$scope.pageItems, $scope.websiteParams)
			.then(function(response) {  
				$scope.website = response.data;
			});
		};
		
		// for users list/customerList
		var userStatus = {status: 1};
		angular.extend(userStatus, $scope.userInfo)
		dataService.get("getmultiple/user/1/500", userStatus)
		.then(function(response) {  
			if(response.status == 'success'){
				$scope.customerList = response.data;
			}else{
				$notification.error("Get Customers", response.message);
			}
		});
		
		//for search filter
		$scope.searchFilter = function(statusCol, showStatus) {
			$scope.search = {search: true};
			$scope.filterStatus = {};
			(showStatus =="") ? delete $scope.websiteParams[statusCol] : $scope.filterStatus[statusCol] = showStatus;
			angular.extend($scope.websiteParams, $scope.filterStatus, $scope.search, $scope.userInfo);
			if(showStatus.length >= 4 || showStatus == ""){
			dataService.get("getmultiple/website/1/"+$scope.pageItems, $scope.websiteParams)
			.then(function(response) { 
				if(response.status == 'success'){
					$scope.website = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.website = {};
					$scope.totalRecords = {};
					$notification.error("Get Website List", response.message);
				}
			});
			}
		}; 
			
		$scope.editDomainName = function(colName, colValue, id, editStatus){
			$scope.changeStatus[colName] = colValue;
				if(editStatus==0){
				 dataService.put("put/website/"+id,$scope.changeStatus)
				.then(function(response) { 
					$notification[response.status]("Edit Domain Name", response.message);
				}); 
			}
		};	 
		$scope.showInput = function($event,opened){
			$scope.websiteParams = {};
			$event.preventDefault();
			$event.stopPropagation();
			$scope[opened] = ($scope[opened] ===true) ? false : true;
		};
		
		//this is global method for filter 
		$scope.changeStatusFn = function(statusCol, showStatus) {
			$scope.filterStatus = {};
			(showStatus =="") ? delete $scope.websiteParams[statusCol] : $scope.filterStatus[statusCol] = showStatus;
			angular.extend($scope.websiteParams, $scope.filterStatus);
			if(statusCol == 'user_id' && (showStatus == null || showStatus == "")) {
				angular.extend($scope.websiteParams, $scope.userInfo);
			}
			dataService.get("getmultiple/website/1/"+$scope.pageItems, $scope.websiteParams)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.website = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.website = {};
					$scope.totalRecords = {};
					$notification.warning("Filter Website List", response.message);
				}
			});
		};  
		
		 // code for request new website 
        var requestnewsite = function(){
			$scope.reqnewsite = { config : {google_map:{}}};
			$scope.postData = function(reqnewsite) { 
			$scope.reqnewsite.date = $scope.currentDate;
				 dataService.post("post/website",reqnewsite)
				.then(function(response) {
					if(response.status == "success"){
						$scope.reqnewsite = {};
						$scope.formScope.requestsiteForm.$setPristine;

						$notification.success("Filter Website List", "Your Request has successfully registered. Kindly check your mailbox for activation status!");
						dataService.progressSteps('requestSite', true);
					}else{
						$notification.error("Request New Site", response.message);
					}
				});   
			}
			
		// Google Map
		$scope.initGoogleMap = function(latitude,longitude, zoom){
			$scope.reqnewsite.config.google_map.latitude = latitude;
			$scope.reqnewsite.config.google_map.longitude = longitude;
			$scope.map = {
				"center": {
					"latitude": latitude,
					"longitude": longitude
				},
				"zoom": zoom
			}; //TODO:  set location based on users current gps location 
			$scope.marker = {
				id: 0,
				coords: {
					latitude: latitude,
					longitude: longitude
				},
				options: { draggable: true },
				events: {
					dragend: function (marker, eventName, args) {
						$scope.reqnewsite.config.google_map.latitude = $scope.marker.coords.latitude;
						$scope.reqnewsite.config.google_map.longitude = $scope.marker.coords.longitude;
						
						$scope.marker.options = {
							draggable: true,
							labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
							labelAnchor: "100 0",
							labelClass: "marker-labels"
						};
					}
				}
			};
		}
		var events = {
			places_changed: function (searchBox) {
				var place = searchBox.getPlaces();
				if (!place || place == 'undefined' || place.length == 0) {
					return;
				}
				$scope.initGoogleMap(place[0].geometry.location.lat(), place[0].geometry.location.lng(), 15);
			}
		};
		$scope.searchbox = { template: 'modules/websites/websettings/searchbox.html', events: events };
		$scope.showPosition = function (position) {
			$scope.initGoogleMap(position.coords.latitude, position.coords.longitude, 5);
			$scope.$apply();
		}
		$scope.showError = function (error) {
			switch (error.code) {
				case error.PERMISSION_DENIED:
					$scope.error = "User denied the request for Geolocation."
					break;
				case error.POSITION_UNAVAILABLE:
					$scope.error = "Location information is unavailable."
					break;
				case error.TIMEOUT:
					$scope.error = "The request to get user location timed out."
					break;
				case error.UNKNOWN_ERROR:
					$scope.error = "An unknown error occurred."
					break;
			}
			$scope.initGoogleMap("19.7514798", "75.71388839999997", 5);
			$notification.error("Location Error", $scope.error);
			$scope.$apply();
		}
		$scope.getLocation = function () {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition($scope.showPosition, $scope.showError);
			}
			else {
				$scope.error = "Geolocation is not supported by this browser.";
			}
		}
		$scope.getLocation();
		//end google map
			
		};
        
		//code for view website list
        var websiteslist = function(){
			$scope.websiteParams = {status: 1}
			angular.extend($scope.websiteParams, $scope.userInfo);
			dataService.get("getmultiple/website/"+$scope.webListCurrentPage+"/"+$scope.pageItems, $scope.websiteParams)
			.then(function(response) { 
			if(response.status == 'success'){
					$scope.website=response.data;
					$scope.totalRecords = response.totalRecords;	
				}else{
					$notification.error("Get Website List", response.message);
				};
			});
			//delete button 
			$scope.deleted = function(id, status, activate){
				if(activate == 2){
					$scope.deletedData = {status : status, registered_date : $scope.currentDate};
				}else{
					$scope.deletedData = {status : status};
				}
				dataService.put("put/website/"+id, $scope.deletedData)
				.then(function(response) { 
					if(response.status == 'success'){
						$notification[response.status]("Delete Website", response.message);
					}
				});
			};
			//Expire button 
			$scope.expire = function(id, expired){
				$scope.expiredData = {expired : expired};
				dataService.put("put/website/"+id, $scope.expiredData)
				.then(function(response) { 
					$notification[response.status]("Website Expiry Status", response.message);
				});
			};
		};
		
		
		//code for requested site list
        var requestedsitelist = function(){
			$scope.websiteParams = {status : 2};
			angular.extend($scope.websiteParams, $scope.userInfo);
			dataService.get("getmultiple/website/"+$scope.reqestSiteCurrentPage+"/"+$scope.pageItems,$scope.websiteParams)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.website=response.data;
					$scope.totalRecords = response.totalRecords;	
				}
				else{
					$notification.error("Requested Website List", response.message);
				};
			});
			
			//This code for apply/buy button
			$scope.dynamicTooltip = function(status, active, notActive){
				return (status==1) ? active : notActive;
			};
		
			//delete button 
			$scope.deleted = function(id, status){
				$scope.deletedData = {status : status};
				dataService.put("put/website/"+id, $scope.deletedData)
				.then(function(response) { 
					if(response.status == 'success'){
						$notification[response.status]("Website Status", response.message);
					}
				});
			};
			//Expire button 
			$scope.expire = function(id, expired){
				$scope.expiredData = {expired : expired};
				dataService.put("put/website/"+id, $scope.expiredData)
				.then(function(response) { 
					$notification[response.status]("Website Expiry Status", response.message);
				});
			};
		};
        
        switch($scope.websitePart) {
			case 'websiteslist':
				websiteslist();
				break;
			case 'requestnewsite':
				requestnewsite();
				break;
			case 'requestedsitelist':
				requestedsitelist();
				break;
			default:
				websiteslist();
		};
	 };
	// Inject controller's dependencies
	websitesController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('websitesController', websitesController);
});
