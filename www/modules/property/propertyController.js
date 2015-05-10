'use strict';
define(['app'], function (app) {
    var injectParams = ['$scope', '$injector','$routeParams','$http','$log', 'modalService', '$rootScope','dataService','upload'];
    // This is controller for this view
	var propertyController = function ($scope, $injector,$routeParams,$http, $log, modalService, $rootScope,dataService,upload) {
		$rootScope.metaTitle = "Real Estate Properties";
		
		//Code For Pagination
		
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.currentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";		
		$scope.alerts = [];
		$scope.userInfo = {user_id : $rootScope.userDetails.id};
		$scope.currentDate = dataService.currentDate;
		console.log($scope.currentDate);
		$scope.dates ={};
		$scope.dates.date=$scope.currentDate;
		console.log($scope.dates.date);
		$scope.setrent={};
		
			
		
		/* var taken_date = new Date();
		
		console.log('the original date is '+taken_date);
		var leaving_date = new Date(taken_date);

		leaving_date.setMonth(leaving_date.getMonth() + 12); // minus the date

		var nd = new Date(leaving_date);
		console.log('the new date is '+nd); */
		
		 //for alert 		 
		if($scope.status=="warning"){     
			 $scope.alerts.push({type: 'error', msg: "Error to load data"});
			 $scope.closeAlert = function(index) {
				$scope.alerts.splice(index, 1);
			 }; 
		}	 
		//function for close alert
		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		}; 	

		$scope.dynamicTooltip = function(status, active, notActive){
			return (status==1) ? active : notActive;
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
		
		//code for pagination		
		$scope.pageChanged = function(page) {	
			angular.extend($scope.propertyParam, $scope.userInfo);
			dataService.get("getmultiple/property/"+page+"/"+$scope.pageItems,$scope.propertyParam)
			.then(function(response) {
				$scope.properties = response.data;
				//console.log(response.data);				
			});			
		};	//end pagination
		
		
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
				//console.log($scope.properties);
			});
		};

		//upload method for multiple images
		$scope.uploadMultiple = function(files,path,userInfo,picArr){ //this function for uploading files
			 upload.upload(files,path,userInfo,function(data){
				var picArrKey = 0, x;
				for(x in picArr) picArrKey++;
				if(data.status === 'success'){
					picArr.push(data.data);
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Upload Images", response.message);
				}
			}); 
		};    
		

/***************************************************************************************/
		/* $scope.changeStatus = {};
		$scope.changeStatusFn = function(colName, colValue, id){
			$scope.changeStatus[colName] = colValue;				
			//console.log($scope.changeStatus);
			
				 dataService.put("put/property/"+id,$scope.changeStatus)			
				.then(function(response) {					
					if(colName=='title'){					
					}
					$scope.alerts.push({type: response.status,msg: response.message});
				}); 
		}		 */
		
/***************************************************************************************/	
		$scope.changeValue = function(statusCol,status) {
			//console.log($scope.propertyParam);
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
		$scope.open = function (url, propId) {
			dataService.get("getsingle/property/"+ propId)
			.then(function(response) {
				
				console.log(response);
				var modalDefaults = {
					templateUrl: url,	// apply template to modal
					size : 'lg'
				};
				var modalOptions = {
					viewProperty: dataService.parse(response.data)  // assign data to modal
				};
				//console.log(response.data);
				modalService.showModal(modalDefaults, modalOptions).then(function (result) {
					console.log("modalOpened");
				});
			});			
		};
		
		$scope.ok = function () {
			$modalOptions.close('ok');
		};	//end of modal function		
	
		 //setrent
		
		$scope.postData = function(setrent,duration) {
			//console.log(duration);
			
				
				
				//setrent.leaving_date = taken_date + duration;
				
				var year = duration.year;
				var month = duration.month;
				
				setrent.duration = parseInt((year * 12) + parseInt(month));
				
				var esc_year = duration.esc_year;
				var esc_month = duration.esc_month;
				
				var escduration = parseInt((esc_year * 12) + parseInt(esc_month));
				setrent.escduration = escduration;
				console.log(escduration);
				
				//
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
					$scope.alerts.push({type: response.status, msg: response.message});
				});  
		}   
		
			 if($routeParams.id){
					dataService.get("getsingle/property/"+$routeParams.id)
					.then(function(response) {
						if(response.status == "success"){
							$scope.setrent.title = response.data.title;
							$scope.setrent.property_id = response.data.id; 
						}
				})
			} 
		$scope.updateData = function(setrent) {
				setrent.modified_date = dataService.currentDate;
				//console.log($scope.setrent.modified_date);
				delete setrent.id;
				dataService.put("put/rent/"+$scope.rentId,setrent, {postParams:'setrent'})
				.then(function(response) {
					if(response.status == "success"){
						$scope.reset();
						/*setTimeout(function(){*/
							 $location.path("/dashboard/templates/custometemplates"); 
						/*},500); */
					 }
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Submit Custom Template", response.message);
				});
			} 
		//end setrent 
		
				
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
			
	};		
/***************************************************************************************/

/**************************************************************************************/
  /* //update into property
			if($routeParams.id){//Update user
			//$routeParams.id
				console.log($routeParams.id);	
				dataService.get("getsingle/property/"+$routeParams.id)
				.then(function(response) {
						$scope.setrent = response.data;	
						console.log($scope.setrent);					
					});	
					
					$scope.update = function(setrent){				
												
						dataService.put("put/rent/"+$routeParams.id,setrent)
						.then(function(response) { //function for response of request temp
							if(response.status == 'success'){
								$scope.submitted = true;
								if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
								$notification[response.status]("Put Rent", response.message);						
							}else{
								if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
								$notification[response.status]("Put Rent", response.message);
							}	
						});	  
					};	 
			}			   */
	/*********************************************************************/	
	
	
	
	// Inject controller's dependencies
	propertyController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('propertyController', propertyController);
});
