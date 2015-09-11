
'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$injector','dataService','$notification'];

	var registerController = function ($scope,$injector,dataService,$notification) {
		$scope.currentDate = dataService.currentDate;
		$scope.alerts = [];
		$scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.format = $scope.formats[0];
		$scope.register = {address:{}};
		$scope.register.register_date = $scope.currentDate;
		$scope.submitted = false;
		
		$scope.today = function() {
			$scope.date = new Date();
		};
		$scope.open = function($event,opened){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.opened = ($scope.opened==true)?false:true;
		};
		//match password
		$scope.passMatch = function(pass1, pass2){
			$scope.pass = (pass1===pass2) ? true : false;
		}
		//check availability
		$scope.checkuserAvailable = function(fieldName, fieldValue){
			$scope.checkParams = {};
			$scope.checkParams[fieldName] = fieldValue;
			if(fieldValue != undefined && fieldValue.length >= 5){
				dataService.post("post/user/checkavailability",$scope.checkParams)
				.then(function(response) {  
					if(response.status == 'success'){
						$scope.registerForm[fieldName].$setValidity('available', true);
					}else{
						$scope.registerForm[fieldName].$setValidity('available', false);
					}
					$scope.availabilityMsg = response.message;
				});
			}
		}
		$scope.getData = function(location){
			$scope.readOnly = true;
			$scope.register.address.location = location.location;
			$scope.register.address.city = location.city;
			$scope.register.state = location.state;
			$scope.register.country = location.country;
			$scope.register.address.area = location.area;
			$scope.register.address.pincode = location.pincode;
		}
		$scope.getTypeaheadData = function(table, searchColumn, searchValue){
			var locationParams = {search : {}}
			locationParams.search[searchColumn] = searchValue;
			return dataService.config('locations', locationParams).then(function(response){
				return response;
			});
		}
		
		
		//code to register user
		$scope.insert = function(register){
			$scope.params = {url:'login'};
			dataService.post("post/user/register", register)
			.then(function(response) {
				if(response.status == 'success'){
					$scope.submitted = true;
				}
				$notification[response.status]("Registration", response.message);
			});
		}	
	 };
	// Inject controller's dependencies
	registerController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('registerController', registerController);
});
