'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService','$routeParams' ,'$notification', 'dataService'];
    
    // This is controller for this view
	var invoiceController = function ($scope,$rootScope,$injector,modalService, $routeParams,$notification,dataService) {
		
		//global scope objects
		$scope.invoice = true;
		$scope.maxSize = 5;
		$scope.totalRecords = "";
		$scope.currentPage = 1;
		$scope.pageItems = 10;
		$scope.numPages = "";		
		$scope.alerts = [];
		$scope.userInfo = {user_id : $rootScope.userDetails.id}; 
		$scope.currentDate = dataService.currentDate;
/*******************************************************************/
		var curDate = new Date();
		var month = curDate.getMonth() + 1;
		month = (month <= 9) ? '0' + month : month;
		$scope.currentDate = curDate.getFullYear() + "-" + month + "-" + curDate.getDate();
		$scope.rentParams = {};
		
		
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
		
		var dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 10);
		var dueMonth = dueDate.getMonth() + 1;
		dueMonth = (dueMonth <= 9) ? '0' + dueMonth : dueMonth;
		$scope.dueDate = dueDate.getFullYear() + "-" + dueMonth + "-" + dueDate.getDate();
		
		$scope.otherTax = function(rent){
			if($rootScope.userDetails.config.rentsetting.other_tax == 0){ 
				return 0;
			}else{
				return rent * parseInt($rootScope.userDetails.config.rentsetting.other_tax) / 100;
			}
		}
		$scope.tds = function(rent){
			if($rootScope.userDetails.config.rentsetting.tds == 0){ 
				return 0;
			}else{
				return rent * parseInt($rootScope.userDetails.config.rentsetting.tds) / 100;
			}
		}
		$scope.serviceTax = function(rent){
			//console.log(parseFloat($rootScope.userDetails.config.rentsetting.service_tax));
			return rent * parseFloat($rootScope.userDetails.config.rentsetting.service_tax) / 100; // other_tax - secondary_edu_cess - primary_edu_cess
		}
		$scope.primaryEduCess = function(rent){
			return $scope.serviceTax(rent) * parseInt($rootScope.userDetails.config.rentsetting.primary_edu_cess) / 100;
		}
		$scope.secondaryEduCess = function(rent){
			return $scope.serviceTax(rent) * parseInt($rootScope.userDetails.config.rentsetting.secondary_edu_cess) / 100;
		}
		
		$scope.printDiv = function(divName) {
			var printContents = document.getElementById(divName).innerHTML;
			var popupWin = window.open('', '_blank', 'width=1000,height=620');
			popupWin.document.open()
			popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" /><link rel="stylesheet" type="text/css" href="css/style.css" /></head><body onload="window.print()">' + printContents + '</html>');
			popupWin.document.close();
		} 
		
		$scope.rentDate = {};
/***********************************************************************************/
$scope.openGenerateinvoice = function (url,invoice) {
			$scope.rentYear = [];
				var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
				};
				var modalOptions = {
					rentList : invoice,
					rentDate: { date : $scope.currentDate, due_date : $scope.dueDate },
					accountConfig : $rootScope.userDetails.config.rentsetting,
					total_amount : 0,
					rentData : {},
					getTotal : function(rentData, modalOptions){
						if(rentData.perticulars == undefined) rentData.perticulars = {};
						console.log(rentData.perticulars);
						rentData.perticulars.tax = $scope.serviceTax(rentData.rent);
						rentData.perticulars.tds = $scope.tds(rentData.rent);
						rentData.perticulars.other_tax = $scope.otherTax(rentData.rent);
						rentData.perticulars.primaryeducation = $scope.primaryEduCess(rentData.rent);
						rentData.perticulars.secondaryeducation = $scope.secondaryEduCess(rentData.rent);
						
						var rent = parseFloat(rentData.rent);
						var maintenance = (rentData.maintenance) ? rentData.maintenance : 0;
						var electricity_bill = (rentData.electricity_bill) ? rentData.electricity_bill : 0;
						var water_charge = (rentData.water_charge) ? rentData.water_charge : 0;
						
						var totalAmount = ((parseFloat(rent) + parseFloat($scope.serviceTax(rent)) + parseFloat($scope.otherTax(rent)) + parseFloat($scope.primaryEduCess(rent)) + parseFloat($scope.secondaryEduCess(rent)) + parseFloat(maintenance) + parseFloat(electricity_bill) + parseFloat(water_charge))  - parseFloat($scope.tds(rent)));
						modalOptions.service_tax = parseFloat(service_tax);
						modalOptions.other_tar = parseFloat(other_tax);
						modalOptions.total_amount = parseFloat(totalAmount);
					},
					formData : function(rentData, total_amount){
						var due_date = new Date(rentData.generated_date);
						rentData.user_id = modalOptions.rentList.user_id;
						rentData.property_id = modalOptions.rentList.property_id;
						due_date.setDate(due_date.getMonth() + modalOptions.rentList.duration);
						rentData.due_date = due_date;
						rentData.total_amount = total_amount;
						modalOptions.invoice = rentData;
					},
					
				};
				modalService.showModal(modalDefaults,modalOptions).then(function (result) {
					console.log(modalOptions.invoice);
					 dataService.post("post/invoice",modalOptions.invoice)
					.then(function(response) {  
						if(response.status == "success"){
							console.log(response);
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Rent Receipt Generated", response.message);
					});  
				});
		};
/***********************************************************************************/
		$scope.getInvoices = function(page){
			dataService.get("getmultiple/invoice/"+page+"/"+$scope.pageItems, $scope.userInfo)
			.then(function(response) {  
				if(response.status == 'success'){
					$scope.invoices = response.data;
					$scope.total_due = response.total_due;
					$scope.total_amount = response.total_rent;
					$scope.totalRecords = response.totalRecords;
				}else{
					if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
					$notification[response.status]("Get Invoices", response.message);
				}
			});
			}
/***********************************************************/
/*Delete Account Funtion*/
			$scope.deleted = function(id, status){
				$scope.deletedData = {status : status};
				var del = confirm("Are you sure?");
				if(del){
					dataService.put("put/invoice/"+id, $scope.deletedData)
					.then(function(response) { 
						if(response.status == 'success'){
							$scope.hideDeleted = 1;
						}
						if(response.status == undefined) response = {status :"error", message:"Unknown Error"};
						$notification[response.status]("Delete Invoice", response.message);
					});
				}else{
					alert("canceled!");
				}
			};
/**************************************************************/
	};
		
	// Inject controller's dependencies
	invoiceController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('invoiceController', invoiceController);
});