'use strict';
define(['app'], function (app) {
    var injectParams = ['$scope', '$injector','$routeParams','$http','$log', 'modalService', '$rootScope','dataService','upload','$notification'];
    // This is controller for this view
	var propertyController = function ($scope, $injector,$routeParams,$http, $log, modalService, $rootScope,dataService,upload,$notification) {
		$rootScope.metaTitle = "Real Estate Properties";
	
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.currentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";		
		$scope.alerts = [];
		$scope.userInfo = {user_id : $rootScope.userDetails.id};
		$scope.currentDate = dataService.currentDate;
		$scope.setrent = {};
		
		//for dynamic tooltip
		$scope.dynamicTooltip = function(status, active, notActive){
			return (status==1) ? active : notActive;
		};	
		
		//code for pagination		
		$scope.pageChanged = function(page) {	
			angular.extend($scope.propertyParam, $scope.userInfo);
			dataService.get("getmultiple/property/"+page+"/"+$scope.pageItems,$scope.propertyParam)
			.then(function(response) {
				$scope.properties = response.data;
				//console.log(response.data);				
			});			
		};//end pagination
		/********************************************************************************************/
		//code for rent setting
		var accountConfig = $rootScope.userDetails.config.rentsetting;
		$scope.config = {
			other_tax : accountConfig.other_tax,
			service_tax : accountConfig.service_tax,
			primary_edu_cess : accountConfig.primary_edu_cess,
			secondary_edu_cess : accountConfig.secondary_edu_cess,
			pan_no : accountConfig.pan_no,
			tds : accountConfig.tds,
			service_tax_no : accountConfig.service_tax_no
		}
		
		// function for edit your profile
		$scope.changeSetting = function(setting){
			console.log(setting);
			if($rootScope.userDetails.config == "") $rootScope.userDetails.config = {};
			$rootScope.userDetails.config.rentsetting = setting;
			
			dataService.put('put/user/'+$rootScope.userDetails.id, {config : $rootScope.userDetails.config}).then(function(response){
				if(response.status == "success"){
					dataService.setUserDetails(JSON.stringify($rootScope.userDetails));
					$rootScope.userDetails = dataService.parse(dataService.userDetails);
				}
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Edit Profile", response.message);
			})
		}	
		/*******************************************************************************************/
		// code for delete button 
			$scope.deleted = function(id, status){
				$scope.deletedData = {status : status};
				dataService.put("put/property/"+id, $scope.deletedData)
				.then(function(response) { 
					if(response.status == 'success'){
						$scope.hideDeleted = 1;
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Delete Property", response.message);
				});
			};			
			
		//search filter function
		$scope.searchFilter = function(statusCol, searchProp) {
			$scope.search = {search: true};
			$scope.filterStatus= {};
			(searchProp =="") ? delete $scope.propertyParam[statusCol] : $scope.filterStatus[statusCol] = searchProp;
			angular.extend($scope.propertyParam, $scope.filterStatus);
			angular.extend($scope.propertyParam, $scope.search);			
			
			dataService.get("/getmultiple/property/1/"+$scope.pageItems, $scope.propertyParam)
			.then(function(response) {  //function for propertylist response
				if(response.status == 'success'){
					$scope.properties = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.properties = {};
					$scope.totalRecords = {};
					$scope.alerts.push({type: response.status, msg: response.message});
				}
			});
		};
/**************************************************************************************/
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
/**************************************************************************************/			
		//upload method for multiple images
		$scope.uploadMultiple = function(files,path,userInfo,picArr){ //this function for uploading files
		console.log(picArr);
			 upload.upload(files,path,userInfo,function(data){
				if(data.status === 'success'){
					console.log(picArr);
					picArr.push(data.data);
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Upload Images", response.message);
				}
			}); 
		};    
/**************************************************************************************/					
		//changevalue function
		$scope.changeValue = function(statusCol,status) {
			$scope.filterStatus= {};
			(status =="") ? delete $scope.propertyParam[statusCol] : $scope.filterStatus[statusCol] = status;
			angular.extend($scope.propertyParam, $scope.filterStatus);
			angular.extend($scope.propertyParam, $scope.search);			
			
			dataService.get("/getmultiple/property/1/"+$scope.pageItems, $scope.propertyParam)
			.then(function(response) {  //function for property response
				if(response.status == 'success'){
					$scope.properties = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.properties = {};
					$scope.totalRecords = {};
					$scope.alerts.push({type: response.status, msg: response.message});
				}				
			});
		};
/*****************************************************************************************/		
	//view single property modal
		$scope.openProperty = function (url, propertyData,EditId) {
			var modalDefaults = {
				templateUrl: url,	// apply template to modal
				size : 'lg'
			};
			var modalOptions = {
				editProperty : EditId,
				propDate  : $scope.currentDate,
				propertyData : propertyData,
				getCustomer : function(modalOptions){
					dataService.get("getmultiple/user/1/500", {status: 1, user_id : $rootScope.userDetails.id}).then(function(customer) {
						modalOptions.customerList = customer.data;
					})
				},
				configData : function(modalOptions){
					dataService.config('config', {config_name : "property"}).then(function(response){
						//console.log(response);
						modalOptions.propertyConfig = response.config_data;
					})
				},
				postData : function(setrent,duration) {
					//calculate duration in months
					//setrent.user_id = $scope.userDetails.id;
					var year = duration.year;
					var month = duration.month;
					
					setrent.duration = parseInt((year * 12) + parseInt(month));
					
					var esc_year = duration.esc_year;
					var esc_month = duration.esc_month;
					
					var escduration = parseInt((esc_year * 12) + parseInt(esc_month));
					setrent.escduration = escduration;
					console.log(escduration);
					
					//calculate leaving date from starting date
					var taken_date = new Date(setrent.taken_date);
			
					console.log('the original date is '+taken_date);
					var leaving_date = new Date(taken_date); //
					leaving_date.setMonth(leaving_date.getMonth() + setrent.duration);
					
					setrent.leaving_date = leaving_date;
					setrent.taken_date = taken_date;
					
					console.log(setrent);
					dataService.post("post/rent/setrent",setrent)
					.then(function(response) {  
						if(response.status == "success"){
							console.log(response.message);
							dataService.put("put/property/"+propertyData.id, {availability : 0}).then(function(response) {
								console.log(response.message);
							})
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Rent Property", response.message);
					});
				},
				addProperty : function(property){
					console.log(property);
				 var userInfo = $rootScope.userDetails.id;
				property.user_id= $rootScope.userDetails.id;
				property.date = $scope.currentDate;
				property : { property_images : []}
				dataService.post("post/property",property,$scope.userInfo)
				.then(function(response) {
					if(response.status=="success"){
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Add record", response.message);
					}else{
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("", response.message);
					}
				}); 
				},
				
				upload : function(files,path,userInfo, picArr){
					upload.upload(files,path,userInfo,function(data){
						if(data.status === 'success'){
							modalOptions.property_images = data.data.file_relative_path;
						}else{
							if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
							$notification[response.status]("", response.message);
						}
					});
					},
					generateThumb : function(files){  
						upload.generateThumbs(files);
					},
				
				updateData : function(property) {
					dataService.put("put/property/"+EditId,property)
					.then(function(response) {
						if(response.status == "success"){
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Add record", response.message);
					});
				}
			};
			if(EditId){
				dataService.get("getsingle/property/"+EditId)
				.then(function(response) {  
					if(response.status == "success"){
						modalOptions.property = {
							title : response.data.title,
							property_description : response.data.property_description,
							category : response.data.category,
							bedrooms : response.data.property_info.bedrooms,
							bathrooms : response.data.property_info.bathrooms,
							property_images : response.data.property_images,
							address : response.data.property_images,
							date : response.data.description
						};
							modalService.show(modalDefaults,modalOptions).then(function (result) {
						});
					}
					console.log(response);
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				});
			}else{
				modalService.show(modalDefaults,modalOptions).then(function (result) {
				});
			}
			//console.log(response.data);
			modalService.showModal(modalDefaults, modalOptions).then(function (result) {
				console.log("modalOpened");
			});
		};
/*****************************************************************************************/			
		//setrent form post data to rent table
		$scope.postData = function(setrent,duration) {
				
			//calculate duration in months
			var year = duration.year;
			var month = duration.month;
			
			setrent.duration = parseInt((year * 12) + parseInt(month));
			
			var esc_year = duration.esc_year;
			var esc_month = duration.esc_month;
			
			var escduration = parseInt((esc_year * 12) + parseInt(esc_month));
			setrent.escduration = escduration;
			console.log(escduration);
			
			//calculate leaving date from starting date
			var taken_date = new Date();
	
			console.log('the original date is '+taken_date);
			var leaving_date = new Date(taken_date); //
			
			$scope.setrent.leaving_date=leaving_date;
			
			leaving_date.setMonth(leaving_date.getMonth() + setrent.duration); // minus the date

			var nd = new Date(leaving_date);
			console.log('the leaving date is '+nd);
			
			dataService.post("post/rent/setrent",setrent)
			.then(function(response) {  
				if(response.status == "success"){
					//$scope.reset();
				}
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Add record", response.message);
			});  
		}  
		$scope.updateData = function(setrent) {
				setrent.modified_date = dataService.currentDate;
				delete setrent.id;
				dataService.put("put/rent/"+$scope.rentId,setrent, {postParams:'setrent'})
				.then(function(response) {
					if(response.status == "success"){
						$scope.reset();
							 $location.path("/dashboard/templates/custometemplates"); 
					 }
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Submit Custom Template", response.message);
				});
		} 
/**************************************************************************************/						
		//date picker
		$scope.today = function() {
			$scope.date = new Date();
		};
		$scope.open = function($event,rentdate){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.rentdate = ($scope.rentdate==true)?false:true;
		}; 
		$scope.opendate = function($event,selectDate){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.selectDate = ($scope.selectDate==true)?false:true;
		};
/**************************************************************************************/				
		//view multiple records
		$scope.propertyParam = {status : 1};			
		angular.extend($scope.propertyParam,$scope.userInfo);
		dataService.get("getmultiple/property/1/"+$scope.pageItems, $scope.propertyParam)
		.then(function(response) { //function for property list response  
			//console.log(response.data);				
				if(response.status == 'success'){
					$scope.totalRecords = response.totalRecords;
					$scope.properties = response.data; 					
					
				}else{
					$scope.alerts.push({type: response.status, msg: response.message});
				}
		});	
			
/***************************************************************************************/
	};
	// Inject controller's dependencies
	propertyController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('propertyController', propertyController);
});
