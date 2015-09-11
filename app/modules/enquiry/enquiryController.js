'use strict';

define(['app'], function (app) { 
    var injectParams = ['$scope','$rootScope', '$injector', '$routeParams','$location','dataService','upload','$route','$notification']; 
   
	var enquiryController = function ($scope,$rootScope, $injector, $routeParams,$location,dataService,upload,$route,$notification) {
		$scope.permission = $rootScope.userDetails.permission.enquiry_module;
		
		//Code For Pagination
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.mailListCurrentPage = 1;
		$scope.sentmailListCurrentPage = 1;
		$scope.delmailListCurrentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";
		$scope.mailList = [];
		$scope.mailId = $routeParams.mailId;
		
		$scope.tinymceConfig = {};
		$scope.currentDate = dataService.currentDate;
		$scope.user_id = { user_id : dataService.userDetails.id };
		$scope.hideDeleted = "";
		
		//For display by default mails.html page
		if(!$routeParams.mailId) {
			$location.path('/dashboard/enquiry/mails');
		}
		
		// code for refresh page
		$scope.refreshpage=function(){
			$route.reload();
		}
		//reset function
		$scope.reset = function() {
			$scope.composemail = {};
		};
		// code for pagination
		$scope.pageChanged = function(page, where) {
			dataService.get("getmultiple/enquiry/"+page+"/"+$scope.pageItems, where).then(function(response){
				$scope.mailList = dataService.parse(response.data);
			});
		};
		
		//to change status of read and unread mails
		$scope.changestatus = function(id, read_status, index){
			if(read_status==0){
				$scope.statusParam = {read_status : 1};
				dataService.put("put/enquiry/"+id, $scope.statusParam).then(function(response) { 
					
					$scope.mailList[index].read_status = 1
				});
			}
		};
		
		//code for get user list
		dataService.get("getmultiple/user/1/500", {status: 1, user_id : $rootScope.userDetails.id})
		.then(function(response) {  
			if(response.status == 'success'){
				$scope.customerList = response.data;
			}else{
				
				if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
				$notification[response.status]("Get Customer List", response.message);
			}
		});

		//code for delete single mail
		$scope.deletemail = function(id, status, index){
			if(status==1){
				$scope.status = {status : 0};
				dataService.put("put/enquiry/"+id, $scope.status)
				.then(function(response) {
					if(response.status == "success"){
						$scope.mailList[index].status = 0
						$scope.hideDeleted = 1;
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Delete Mail", response.message);
 				});
			}
		};
		
		//code for search filter
		$scope.searchFilter = function(statusCol, colValue) {
			$scope.searchObj = {search: true, subject : colValue};
			angular.extend($scope.searchObj, $scope.statusParam);
			if(colValue.length >= 4){
				dataService.get("/getmultiple/enquiry/1/"+$scope.pageItems, $scope.searchObj)
				.then(function(response) { 
					if(response.status=="warning" || response.status=='error' ){
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Search Enquiries", response.message);
					}else{
						$scope.mailList = dataService.parse(response.data);
						$scope.totalRecords = response.totalRecords;
					}
				});
			}
		};
		
		//function for view maillist
		var inboxmailList = function(){
			$scope.statusParam = {status : 1};
			angular.extend($scope.statusParam, $scope.user_id);
			dataService.get("getmultiple/enquiry/"+$scope.mailListCurrentPage+"/"+$scope.pageItems, $scope.statusParam).then(function(response) { 
				if(response.status == 'success'){
					$scope.mailList = dataService.parse(response.data);
					$scope.totalRecords = response.totalRecords;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("New Enquiries", response.message);
				}
			});
		}
		
		//function for sent mail list
		var sentmailList = function(){
			$scope.statusParam = {status : 2};
			angular.extend($scope.statusParam, $scope.user_id);
			dataService.get("getmultiple/enquiry/"+$scope.sentmailListCurrentPage+"/"+$scope.pageItems, $scope.statusParam).then(function(response){
				if(response.status=="success"){
						$scope.mailList = dataService.parse(response.data);
						$scope.totalRecords = response.totalRecords;
					}else{
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Send Mail", response.message);
					}
			});
		}
		
		//function to delete maillist
		var deletemailList = function(){
			$scope.statusParam = {status : 0};
			angular.extend($scope.statusParam, $scope.user_id);
			dataService.get("getmultiple/enquiry/"+$scope.delmailListCurrentPage+"/"+$scope.pageItems, $scope.statusParam).then(function(response){
				if(response.status=="warning" || response.status=='error' ){
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Deleted Enquiries", response.message);
				}else{
					$scope.mailList = dataService.parse(response.data);
					$scope.totalRecords = response.totalRecords;
				}
			});
		}
		
		//function to view single mail 
		var mailview = function(){
			$scope.mailSingleId = ($routeParams.id) ? $routeParams.id : "";
			$scope.prevmail=function(){
				$scope.mailSingleId = $scope.mailSingleId - 1;
				$location.path('/dashboard/enquiry/mailview/'+$scope.mailSingleId);
			}
			$scope.nextmail=function(){
				$scope.mailSingleId = parseInt($scope.mailSingleId) + 1;
				$location.path('/dashboard/enquiry/mailview/'+$scope.mailSingleId);
			}
			if($scope.mailSingleId != ""){
				dataService.get("getsingle/enquiry/"+$scope.mailSingleId)
				.then(function(response) {
					if(response.status=="success"){
						$scope.singlemail = dataService.parse(response.data);
						$scope.singlemail.date = $scope.singlemail.date;
						$scope.totalRecords = response.totalRecords;
						$scope.replyMsg = ($scope.singlemail.reply_message!="") ? $scope.singlemail.reply_message : {message:""};
						$scope.replyMail = {
							reply_message : {
								subject : "RE: "+$scope.singlemail.subject,
								message : $scope.replyMsg.message
							},
							reply_date : $scope.currentDate
						};
						if($scope.singlemail.reply_status == 1){
							$scope.tinymceConfig = {
								readonly: true,
							}
						}
						$scope.update = function(id,replyMail){
							dataService.put("put/enquiry/"+id,replyMail)
							.then(function(response) {
								if(response.status == "success"){
									$scope.singlemail.reply_status = 1;
									setTimeout(function(){
										$location.path("/dashboard/enquiry/mails");
									},500);
								}
								if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
								$notification[response.status]("Reply Mail", response.message);
							});
						};
					}else{
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Enquiry View", response.message);
					}
				});
			}	
		}
		
		//function to compose mail
		var composeMail = function(){
			$scope.composemail = {
				user_id: $rootScope.userDetails.id,
				from_email : {from : $rootScope.userDetails.email, cc : ""},
				name : $rootScope.userDetails.username
			};
			$scope.composemail.date = $scope.currentDate;
			$scope.path = "mail/"; // path to store images on server
			$scope.composemail.Attachment = []; // uploaded images will store in this array
			$scope.upload = function(files,path,userinfo){
				upload.upload(files,path,userinfo,function(data){
					if(data.status !== 'error'){
						$scope.composemail.Attachment.push(JSON.stringify(data.details));
					}else{
						
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Attachment", response.message);
					}
				});
			};
			$scope.generateThumb = function(files){  
				upload.generateThumbs(files);
			};
			
			//code for send mail
			$scope.postData = function(composemail) {
				dataService.post("/post/enquiry",composemail)
				.then(function(response) {  
					if(response.status=="success"){
						
						setTimeout(function(){
							$location.path("/dashboard/enquiry/mails");
						},1000);
					}
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Send Mail", response.message);
				});
			}
		}
		
		switch($scope.mailId) {
			case 'mails':
				inboxmailList();
				break;
			case 'sentmail':
				sentmailList();
				break;
			case 'delete':
				deletemailList();
				break;
			case 'composemailview':
				composeMail();
				break;
			case 'mailview':
				mailview();
				break;
			default:
				inboxmailList();
		};
	};
	// Inject controller's dependencies
	enquiryController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('enquiryController', enquiryController);
});
