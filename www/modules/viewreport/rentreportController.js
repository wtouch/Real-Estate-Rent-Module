'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','modalService'];
    
    // This is controller for this view
	var viewreportController = function ($scope,$rootScope,$injector,modalService) {
		$scope.ok = function () {
			$modalInstance.close();
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		$scope.openRent = function (url) {
				//date picker
			var modalDefaults = {
					templateUrl: url,	
					size : 'lg'
			};
			
			modalService.showModal(modalDefaults).then(function (result) {
				$scope.ok = function(){
					$modalInstance.close("ok");
				}
			});
		};
	};
		
	// Inject controller's dependencies
	viewreportController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('viewreportController', viewreportController);
});