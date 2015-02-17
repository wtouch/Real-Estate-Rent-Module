

'use strict';

define(['angular',
	'angularRoute',
	'routeResolver',
	'bootstrap',
	'breadcrumbs',
	'css!../css/bootstrap.min','css!../css/style'
], function(angular, angularRoute) {
	// Declare app level module which depends on views, and components
	var app =  angular.module('smallBusiness', [
	  'ngRoute',
	   'routeResolverServices','ui.bootstrap','ng-breadcrumbs'
	]);
	app.config(['$routeProvider', 'routeResolverProvider', '$controllerProvider',
                '$compileProvider', '$filterProvider', '$provide', '$httpProvider', 
				function($routeProvider, routeResolverProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $httpProvider) {
				
				//Change default views and controllers directory using the following:
				routeResolverProvider.routeConfig.setBaseDirectories('modules/', 'modules/');
				
				app.register =
				{
					controller: $controllerProvider.register,
					directive: $compileProvider.directive,
					filter: $filterProvider.register,
					factory: $provide.factory,
					service: $provide.service
				};
				
				//Define routes - controllers will be loaded dynamically
				var route = routeResolverProvider.route;
				
				
				$routeProvider
                
                .when('/', route.resolve({controller:'login', template: 'login', label:"home"}, 'login/'))
				.when('/login', route.resolve({controller:'login', template: 'login', label: 'Login'}, 'login/'))
				
                .when('/dashboard', route.resolve({controller:'dashboard', template: 'dashboard'}, 'dashboard/'))
				
				.when('/dashboard/businessprofile', route.resolve({controller:'addnewbusi', template: 'businessprofile'}, 'mybusiness/addnewbusi/'))
				
				.when('/contactprofile', route.resolve({controller:'addnewbusi', template: 'contactprofile'}, 'mybusiness/addnewbusi/'))
				
				.when('/editprofile', route.resolve({controller:'addnewbusi', template: 'editprofile'}, 'mybusiness/addnewbusi/'))
				
				.when('/testimonials', route.resolve({controller:'addnewbusi', template: 'testimonials'}, 'mybusiness/addnewbusi/'))
				
				.when('/newbusi/:new?', route.resolve({controller:'addnewbusi', template: 'newbusi', label: "New Business"}, 'mybusiness/addnewbusi/'))
				
				.when('/infrastructure', route.resolve({controller:'addnewbusi', template: 'infrastructure'}, 'mybusiness/addnewbusi/'))
				
				.when('/jobsandcareers', route.resolve({controller:'addnewbusi', template: 'jobsandcareers'}, 'mybusiness/addnewbusi/'))
				
				.when('/products', route.resolve({controller:'addnewbusi', template: 'products'}, 'mybusiness/addnewbusi/'))
				
				.when('/busilist', route.resolve({controller:'busilist', template: 'busilist'}, 'mybusiness/list/'))
				
				.when('/dashboard/enquiry/:id?', route.resolve({controller:'enquiry', template: 'enquiry'}, 'enquiries/'))
				
				.when('/requestnewsite', route.resolve({controller:'mywebsite', template: 'requestnewsite'}, 'mywebsite/'))
				
				.when('/websitelist', route.resolve({controller:'mywebsite', template: 'websitelist'}, 'mywebsite/'))
				
				.when('/managetemp', route.resolve({controller:'managetemp', template: 'managetemp'}, 'managetemp/'))
				
				.when('/template', route.resolve({controller:'managetemp', template: 'template'}, 'managetemp/'))
				
				.when('/requestedsitelist', route.resolve({controller:'mywebsite', template: 'requestedsitelist'}, 'mywebsite/'))
                .otherwise({ redirectTo: '/' });
	}]);
	
		
	app.run(['$location', '$rootScope', 'breadcrumbs', function($location, $rootScope, breadcrumbs) {
		$rootScope.breadcrumbs = breadcrumbs;
		$rootScope.title = "DEFAULT Title";
	}]);
	return app;
});