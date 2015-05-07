'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','$location','$routeParams','dataService','upload','modalService','$notification'];
    
    // This is controller for this view
	var mytemplatesController = function ($scope,$rootScope,$injector,$location,$routeParams,dataService,upload,modalService,$notification) {
		// all $scope object goes here
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.tempListCurrentPage = 1;
		$scope.myTempCurrentPage = 1;
		$scope.customTempCurrentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";
		$scope.currentDate = dataService.currentDate;
		$scope.userInfo = {user_id : $rootScope.userDetails.id};
		$scope.permission = $rootScope.userDetails.permission.template_module;
		$scope.tempPart = $routeParams.tempPart;//for display form parts
		$scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.format = $scope.formats[0];
		$scope.temp = dataService.config.template;
		$scope.path = "template/"; // path to store images on server
		$scope.userinfo = $scope.userInfo;
		$scope.reqtemp = {
			scrible : []
		};
		
		//code for accessing json data of template
		$scope.temp = {};
		dataService.config('config', {config_name : "template"}).then(function(response){
			$scope.temp = response.config_data;
		});
		
		//code for apply/buy button
		$scope.dynamicTooltip = function(status, active, notActive){
			return (status==1) ? active : notActive;
		};
		// function to generate thumbnails of images
		$scope.generateThumb = function(files){  
			upload.generateThumbs(files);
		};
		// code for datepicker 	
		$scope.today = function() {
			$scope.date = new Date();
		};
		$scope.open = function($event,opened){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.opened = ($scope.opened==true)?false:true;
		};
		
		$scope.addToObject = function(data, object, resetObj){
			var dtlObj = JSON.stringify(data.desc);
			object[data.heading] = JSON.parse(dtlObj);
			$scope.headingDisabled = false;
			$scope.temp = false;
			$scope.imgRemoved = false;
			$scope[resetObj] = { desc : { image  : {} }};
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
				$scope[resetObj] = { desc : { image  : {} }};
			}
		}
		
		//Function to Update template 
		$scope.update = function(businessData){				
			dataService.put("put/mytemplate/"+ $scope.template_id, templateData)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.submitted = true;
				}
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Update Template", response.message);
			});
		};

		//code for edit the price of template
		$scope.changeStatusf={};
		$scope.editTemplatePrice = function(colName, colValue, id, editStatus){
			$scope.changeStatusf[colName] = colValue;
			if(editStatus==0){
				 dataService.put("put/mytemplate/"+id,$scope.changeStatusf)
				.then(function(response) { 
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Edit Template Price", response.message);
				}); 
			}
		};	
		
		//code for show template_price
		$scope.showInput = function($event,opened){
			$scope.template_price = []; 				  				
			$event.preventDefault();
			$event.stopPropagation();
			$scope[opened] = ($scope[opened] ===true) ? false : true;
		};
		
		$scope.changePrice = function(id, prices){
			var template_price;
			for(var x in prices){
				if(prices[x].id == id) template_price = prices[x].template_price;
			}
			return template_price;
		}
		
		//code for select development status
		$scope.changeStatusf={};
		$scope.editDevelopmentStatus = function(colName, colValue, id, editStatus){
			$scope.changeStatusf[colName] = colValue;
			if(editStatus==0){
				 dataService.put("put/mytemplate/"+id,$scope.changeStatusf)
				.then(function(response) { 
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Change Development Status", response.message);
				}); 
			}
		};	 
		
		//code for show development status
		$scope.showInput = function($event,opened) 		{
			$scope.development_status = []; 				  				
			$event.preventDefault();
			$event.stopPropagation();
			$scope[opened] = ($scope[opened] ===true) ? false : true;
		};
		
		//code for change development  status
		$scope.changeDevelopmentStatus = function(id, development){
			var development_status;
			for(var x in development){
			if(development[x].id == id) development_status = development[x].development_status;
			}
			return development_status;
		}

		$scope.pageChanged = function(page, where) {
			dataService.get("getmultiple/mytemplate/"+page+"/"+$scope.pageItems, $scope.template_type)
			.then(function(response){ 
				$scope.templates = response.data;
			});
		};
	
		$scope.changeScope = function(value, object){
			$scope.website.userDetails = value.id;
			$scope.changeScopeObject($scope.domain_name);
		}
		
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
		
		//this is global method for filter 
		$scope.changeStatus = function(statusCol, showStatus) {
			$scope.filterStatus= {};
			(showStatus =="") ? delete $scope.template_type[statusCol] : $scope.filterStatus[statusCol] = showStatus;
			angular.extend($scope.template_type, $scope.filterStatus);
			if(statusCol == 'user_id' && showStatus == null) {
				angular.extend($scope.template_type, $scope.userInfo);
			}
			dataService.get("getmultiple/mytemplate/1/"+$scope.pageItems, $scope.template_type)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.templates = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.templates = {};
					$scope.totalRecords = {};
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Template List", response.message);
				}
			});
		};
		
		//code for change status 	
		$scope.changeStatusf = {};
		$scope.changeStatusFn = function(colName, colValue, id){
		$scope.changeStatusf[colName] = colValue;    
			dataService.put("put/mytemplate/"+id,$scope.changeStatusf)   
			.then(function(response) {     
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Modify Template Status", response.message);
			}); 
		}
	
		//code for search filter
		$scope.searchFilter = function(statusCol, showStatus) {
			$scope.search = {search: true};
			$scope.filterStatus= {};
			$scope.webParam={};
			(showStatus =="") ? delete $scope.webParam[statusCol] : $scope.filterStatus[statusCol] = showStatus;
			angular.extend($scope.webParam, $scope.filterStatus);
			angular.extend($scope.webParam, $scope.search);
			if(showStatus.length >= 4 || showStatus == ""){
			dataService.get("getmultiple/mytemplate/1/"+$scope.pageItems, $scope.webParam)
			.then(function(response) {  //function for websitelist response
				if(response.status == 'success'){
					$scope.templates = response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					$scope.templates = {};
					$scope.totalRecords = {};
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Search Template", response.message);
				}
			});
			}
		}; 
		
		//This code for active/delete button 
		$scope.feature = function(id, featured){
			$scope.featuredData = {featured : featured};
			dataService.put("put/mytemplate/"+id, $scope.featuredData)
			.then(function(response) { //function for businesslist response
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Feature Template", response.message);
			});
		};
		//This code for reject/order_placed button 
		$scope.reject = function(id, development_status){
			$scope.featuredData = {development_status : development_status};
			dataService.put("put/mytemplate/"+id, $scope.featuredData)
			.then(function(response) { 
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Reject Template", response.message);
			});
		};
		
		//delete button for change status for template
			$scope.deleted = function(id, status){
				$scope.deletedData = {status : status};
				dataService.put("put/mytemplate/"+id, $scope.deletedData)
				.then(function(response) { 
					if(response.status == 'success'){
						$scope.hideDeleted = 1;
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Delete Template", response.message);
				});
			};			
		
		//delete for my template
		$scope.deletedmytemp = function(id, status){
				$scope.deletedData = {status : status};
				dataService.put("put/mytemplate/"+id, $scope.deletedData)
				.then(function(response) { 
					if(response.status == 'success'){
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Delete Template", response.message);
				});
			};			
		$scope.apply = function(id, applied){
			$scope.appliedData = {applied : applied};
			dataService.put("put/mytemplate/"+id, $scope.appliedData)
			.then(function(response) { 
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Apply Template", response.message);
			});
		} ;
		
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
		
		// fuction for display mytemplate list
		var mytemplates = function(){
			$scope.template_type = {status:1};
			angular.extend($scope.template_type, $scope.userInfo);
			dataService.get("getmultiple/mytemplate/"+$scope.myTempCurrentPage+"/"+$scope.pageItems, $scope.template_type)
			.then(function(response) { 
			if(response.status == 'success'){
					$scope.templates=response.data;
					$scope.totalRecords = response.totalRecords;	
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Templates List", response.message);
				};
			});
			
			//open model for My template image
			$scope.openMyTemp = function (url, tempId) {
				dataService.get("getsingle/mytemplate/"+tempId)
				.then(function(response) {
					var modalDefaults = {
							templateUrl: url,	
							size : 'lg'
						};
						 var modalOptions = {
							tempLists: dataService.parse(response.data)  
						}; 
					modalService.show(modalDefaults, modalOptions).then(function (result) {
					});
				});
			};
			
		//this code block for modal
		$scope.editTempParamsModel = function (url, tempId) {
			dataService.get("getsingle/mytemplate/"+tempId)
			.then(function(response) {
				var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
				};
				var modalOptions = {
					editTemplate: dataService.parse(response.data),
					myTemplateData : {},
					slider : {},
					editIndex : {},
					files : {},
					path : $scope.path,
					userInfo : $scope.userInfo,
					tempId : $scope.tempId,
					formData : function(templateData){
						
						modalOptions.myTemplateData = templateData;
					},
					deleteSlide : function(index,object){
						var index = object.indexOf(index);
						object.splice(index, 1); 
					},
					addSlide : function(data, array){
						var pushdata = JSON.stringify(data);
						array.push(JSON.parse(pushdata));
						modalOptions.slider = {};
						for(var x in data){
							delete data[x];
						}
					},
					upload : function(files,path,userInfo,picArr){
						upload.upload(files,path,userInfo,function(data){
							if(data.status === 'success'){
								modalOptions.slider.image = data.data.file_relative_path;
							}else{
								if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
								$notification[response.status]("Upload Image", response.message);
							}
					
					}); 
					},
					generateThumb : function(files){  
						upload.generateThumbs(files);
					},
					
					updateSlide : function(index, array, data){
						var pushdata = JSON.stringify(data);
						array[index.index] = JSON.parse(pushdata);
						for(var x in data){
							delete data[x];
						}
						delete index['index'];
					}
				};
				modalService.showModal(modalDefaults, modalOptions).then(function (result) {
					dataService.put("put/mytemplate/"+tempId,modalOptions.myTemplateData).then(function(response) {
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Update Template Details", response.message);
					});
				});
			});
		};
		$scope.ok = function () {
			$modalOptions.close('ok');
		};
		
		$scope.mypageChanged = function(page, where) {
			dataService.get("getmultiple/mytemplate/"+page+"/"+$scope.pageItems, $scope.template_type)
			.then(function(response){ 
				$scope.templates = response.data;
			});
		};

		};
	
		//function to display list of templates
		var listoftemplates = function(){
			$scope.template_type = {template_type : 'public', status:1};
			dataService.get("getmultiple/mytemplate/"+$scope.tempListCurrentPage+"/"+$scope.pageItems, $scope.template_type)
				.then(function(response) {  
					if(response.status == 'success'){
					$scope.templates=response.data;
					$scope.totalRecords = response.totalRecords;
				}
				else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Templates List", response.message);
				};
			});
			
			//open model for template image
			$scope.openTemp = function (url, tempId) {
				dataService.get("getsingle/mytemplate/"+tempId)
				.then(function(response) {
					var modalDefaults = {
						templateUrl: url,
						size : 'lg'
					};
					 var modalOptions = {
						tempList: dataService.parse(response.data)  
					}; 
					modalService.show(modalDefaults, modalOptions).then(function (result) {
					});
					
				});
			};
			$scope.ok = function () {
				$modalOptions.close('ok');
			};
			
			//this code block for modal
			$scope.openModel = function (url, tempId) {
				dataService.get("getsingle/mytemplate/"+tempId)
				.then(function(response) {
					dataService.get("getmultiple/user/1/500", {status: 1, user_id : $rootScope.userDetails.id})
					.then(function(user) {  
						var modalDefaults = {
							templateUrl: url,	
							size : 'lg'
						};
						var modalOptions = {
							userDetails : $rootScope.userDetails,
							tempList : dataService.parse(response.data),
							customerList : (user.data),
							myTemplateData : {},
							slider : {},
							editIndex : {},
							files : {},
							path : $scope.path,
							userInfo : $scope.userInfo,
							formData : function(templateData){
								modalOptions.myTemplateData = templateData;
							},
							deleteSlide : function(index,object){
								var index = object.indexOf(index);
								object.splice(index, 1); 
							},
							addSlide : function(data, array){
								var pushdata = JSON.stringify(data);
								array.push(JSON.parse(pushdata));
								modalOptions.slider = {};
								for(var x in data){
									delete data[x];
								}
							},
							upload : function(files,path,userInfo,picArr){
								upload.upload(files,path,userInfo,function(data){
									if(data.status === 'success'){
										modalOptions.slider.image = data.data.file_relative_path;
									}else{
									if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
									$notification[response.status]("Upload Images", response.message);
								}
							}); 
							},
							generateThumb : function(files){  
								upload.generateThumbs(files);
							},
							
							updateSlide : function(index, array, data){
								var pushdata = JSON.stringify(data);
								array[index.index] = JSON.parse(pushdata);
								for(var x in data){
									delete data[x];
								}
								delete index['index'];
							}
						};
						modalService.showModal(modalDefaults, modalOptions).then(function (result) {
							dataService.post("post/mytemplate",modalOptions.myTemplateData).then(function(response) {
								if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
								$notification[response.status]("Apply Template", response.message);
								dataService.progressSteps('chooseTemplate', true);
							}); 
						
						});
					});
				});
			};
			$scope.ok = function () {
				$modalOptions.close('ok');
			};
		};
		
		//function for view custom template list
		var custometemplates = function(){
			$scope.template_type = {custom:1};
			angular.extend($scope.template_type, $scope.userInfo);
			dataService.get("getmultiple/mytemplate/"+$scope.customTempCurrentPage+"/"+$scope.pageItems, $scope.template_type)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.templates=response.data;
					$scope.totalRecords = response.totalRecords;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Custom Templates List", response.message);
				};
			});
	
			//open model for template image
			$scope.openTemp = function (url, tempId) {
				dataService.get("getsingle/mytemplate/"+tempId)
				.then(function(response) {
					var modalDefaults = {
						templateUrl: url,	
						size : 'lg'
					};
					 var modalOptions = {
						tempList: dataService.parse(response.data)  
					}; 
						modalService.show(modalDefaults, modalOptions).then(function (result) {
					});
				
				});
			};
			$scope.ok = function () {
				$modalOptions.close('ok');
			}; 
			
			//modal for open scrible details.
			$scope.openTab = function (url, tempId) {
				dataService.get("getsingle/mytemplate/"+tempId)
				.then(function(response) {
					var modalDefaults = {
						templateUrl: url,	
						size : 'lg'
					};
					var modalOptions = {
						tempList: dataService.parse(response.data)  
					};
					modalService.showModal(modalDefaults, modalOptions).then(function (result) {
					});
				});
			};
			$scope.ok = function () {
				$modalOptions.close('ok');
			};
		}
		
		//fuction for request custom template
		var requestcustomtemplates = function(){
			$scope.reset = function() {
				$scope.reqtemp = {};
			};
			$scope.reqtemp.date = $scope.currentDate;
			$scope.postData = function(reqtemp) { 
				 dataService.post("post/template",reqtemp)
				.then(function(response) {  
					if(response.status == "success"){
						$scope.reset();
						/* setTimeout(function(){
							$location.path("/dashboard/templates/mytemplates");
						},500); */
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Submit Template", response.message);
				});
			}
		}
	
		//post method for add template form
		var addtemplate = function(){
			$scope.tempId = $routeParams.id;
			$scope.zipPath = 'zip_templates';
			if($scope.tempId){
				dataService.get("getsingle/mytemplate/"+$scope.tempId)
				.then(function(response) {
					$scope.reset = function() {
						$scope.addtemplate = {
							template_params : {},
							template_image : [],
							created_by : $rootScope.userDetails.id,
							development_status : 'completed'
						};
					angular.extend(response.data, $scope.addtemplate);
					$scope.addtemplate = response.data;
				};
				$scope.reset();
			})
			}else{
				$scope.reset = function() {
					$scope.addtemplate = {
						date : $scope.currentDate,
						template_params : {},
						template_image : [],
						created_by : $rootScope.userDetails.id,
						development_status : 'completed'
					};
				};
				$scope.reset();
			}
			
			$scope.uploadZip = function(files,path,userDetails,picArr){ 
				upload.upload(files,path,userDetails,function(data){
					var picArrKey = 0, x;
					for(x in $scope.addtemplate.template_image) picArrKey++;
					if(data.status === 'success'){
						if(picArr == "zip"){
							$scope.addtemplate.template_zip = data.data;
						}else{
							$scope.addtemplate.template_image.push(data.data);
						}
					}else{
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Upload Zip", response.message);
					}
				});
			};
			$scope.updateData = function(addtemplate) {
				delete addtemplate.id;
				dataService.put("put/mytemplate/"+$scope.tempId,addtemplate, {postParams:'addtemplate'})
				.then(function(response) {
					if(response.status == "success"){
						$scope.reset();
						/*setTimeout(function(){
							$location.path("/dashboard/templates/mytemplates");
						},500);*/
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Upload", response.message);
				});
			}
			$scope.postData = function(addtemplate) {
				dataService.post("post/mytemplate/addtemplate",addtemplate)
				.then(function(response) {
					if(response.status == "success"){
						$scope.reset();
						/* setTimeout(function(){
							$location.path("/dashboard/templates/mytemplates");
						},500); */
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Add Template", response.message);
				});
			}
		}
		
		switch($scope.tempPart) {
			case 'listoftemplates':
				listoftemplates();
				break;
			case 'mytemplates':
				mytemplates();
				break;
			case 'custometemplates':
				custometemplates();
				break;
			case 'requestcustomtemplates':
				requestcustomtemplates();
				break;	
			case 'addtemplate':
				addtemplate();
				break;
			default:
				mytemplates();
		};
    
	};
	// Inject controller's dependencies
	mytemplatesController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('mytemplatesController', mytemplatesController);
});