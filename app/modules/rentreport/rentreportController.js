'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService'];
    
    // This is controller for this view
	var rentreportController = function ($scope,$rootScope,$injector,modalService) {
		$scope.ok = function () {
			$modalInstance.close();
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		$scope.openRent = function (url) {
			var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
			};
			
			modalService.showModal(modalDefaults).then(function (result) {
				console.log("modal opened")	
				$scope.ok = function(){
					$modalOption.close("ok");
				}
			});
		};
		
		$scope.open= function (url) {
			var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
			};
			
			modalService.showModal(modalDefaults).then(function (result) {
				console.log("modal opened")	
				$scope.ok = function(){
					$modalOption.close("ok");
				}
			});
		};
	};
		
	// Inject controller's dependencies
	rentreportController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('rentreportController', rentreportController);
});