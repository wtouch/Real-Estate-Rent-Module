'use strict';

require.config({
	paths: {
		angular: '../lib/angular/angular.min',
		lodash: '../lib/lodash',
		googleMap: '../lib/google-map/angular-google-maps.min',
		googleMapApi: '../lib/google-map/angular-google-maps.min',
		ngSanitize: '../lib/angular/angular-sanitize',
		ngCookies: '../lib/angular/angular-cookies.min',
		upload: '../lib/upload/angular-file-upload.min',
		uploadShim: '../lib/upload/angular-file-upload-shim.min',
		breadcrumbs: '../lib/angular/ng-breadcrumbs',
		routeResolver: '../js/routeResolver',
		directives: '../js/directives', 
		services: '../js/services',
		filters: '../js/filters',
		jquery: '../lib/jquery/jquery',
		tinymce: '../lib/tinymce/tinymce.min',
		angularRoute: '../lib/angular/angular-route',
		angularMocks: '../lib/angular/angular-mocks',
		text: '../lib/requirejs-text/text',
		bootstrap: '../lib/bootstrap/ui-bootstrap',
		css: '../lib/css/css.min',
		modules: '../modules',
	},
	shim: {
		'angular' : {'exports' : 'angular'},
		'routeResolver': { "deps": ['angular', 'angularRoute'] },
		'breadcrumbs':  { "deps": ['angular', 'angularRoute'] },
		'bootstrap': { "deps": ['angular'] },
		'googleMap': { "deps": ['angular', 'lodash'] },
		'filters':  { "deps": ['angular'] },
		'services':  { "deps": ['angular'] },
		'directives':  { "deps": ['angular'] },
		'upload':  { "deps": ['angular'] },
		'uploadShim':  { "deps": ['angular'] },
		'angularRoute': ['angular'],
		'ngCookies': ['angular'],
		'ngSanitize': ['angular'],
		'angularMocks': {
			deps:['angular'],
			'exports':'angular.mock'
		}
	},
	priority: [
		"angular"
	],
	
	
});

require([
	'angular',
	'angularRoute',
	'app'
	], function(angular, angularRoute, app) {
		var $html = angular.element(document.getElementsByTagName('html')[0]);
		angular.element().ready(function() {
			// bootstrap the app manually
			angular.bootstrap(document, ['smallBusiness']);
		});
	}
);