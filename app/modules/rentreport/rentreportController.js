'use strict';

define(['app'], function (app) {
    var injectParams = ['$scope','$rootScope','$injector','$location','$routeParams','dataService','upload','modalService','$notification'];
    
    // This is controller for this view
	var rentreportController = function ($scope,$rootScope,$injector,$location,$routeParams,dataService,upload,modalService,$notification) {
		
	$scope.open = function (size) {
		var modalInstance = $modal.open({
			templateUrl: 'payrentmodal.html',
			controller: 'rentreportController',
			size: size,
		});
		
    console.log("rentreportController");
	};
	// Inject controller's dependencies
	rentreportController.$inject = injectParams;
	// Register/apply controller dynamically
    app.register.controller('rentreportController', rentreportController);
});