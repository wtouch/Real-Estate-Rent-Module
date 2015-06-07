'use strict'; 

define(['angular',
	'angularRoute',
	'ngCookies',
	'ngSanitize',
	'routeResolver',
	'bootstrap',
	'directives',
	'services', 
	'filters',
	'googleMap',
	'upload','uploadShim',
	'css!../css/bootstrap.min','css!../css/style'
], function(angular, angularRoute, ngCookies) {
	// Declare app level module which depends on views, and components
	var app =  angular.module('smallBusiness', [
	  'ngRoute', 'routeResolverServices', 'ui.bootstrap', 'customDirectives', 'customServices', 'customFilters', 'angularFileUpload', 'ngCookies', 'ngSanitize','uiGmapgoogle-maps'
	]);
	app.config(['$routeProvider', 'routeResolverProvider', '$controllerProvider',
                '$compileProvider', '$filterProvider', '$provide', '$httpProvider', 'uiGmapGoogleMapApiProvider',
				function($routeProvider, routeResolverProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $httpProvider, uiGmapGoogleMapApiProvider) {
					
				uiGmapGoogleMapApiProvider.configure({
					// key: 'your api key',
					v: '3.17',
					libraries: 'places' // Required for SearchBox.
				});
				
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
                
                .when('/', route.resolve({controller:'login', template: 'login', label:"Home"}, 'users/login/')) 
				// Always home url is '/' so please don't change this. In future home view can be changed.
				
				.when('/login', route.resolve({controller:'login', template: 'login', label: 'Login'}, 'users/login/'))
				
				.when('/logout', route.resolve({controller:'login', template: 'logout', label: 'Logout'}, 'users/login/'))
				
				.when('/changepass',route.resolve({controller: 'editprofile',template: 'changepass',label: "Change Password"
                }, 'users/editprofile/')) 
				
				.when('/changepass/:resetPassKey',route.resolve({controller: 'login',template: 'changepass',label: "Change Password"
                }, 'users/login/'))
				
				.when('/activate/:activateKey/:email/:pass?',route.resolve({controller: 'login',template: 'activate',label: "Activate Account"
                }, 'users/login/'))
				
				.when('/register', route.resolve({controller:'register', template: 'register', label: 'Register'}, 'users/register/'))
				
				.when('/forgotpass', route.resolve({controller:'login', template: 'forgotpass', label: 'Forgot Password'}, 'users/login/'))
				
				.when('/editprofile', route.resolve({controller:'editprofile', template: 'editprofile',label:"Edit Profile"}, 'users/editprofile/'))
	
				
                .when('/dashboard', route.resolve({controller:'dashboard', template: 'dashboard', label: "Dashboard"}, 'dashboard/'))
				
				.when('/dashboard/users', route.resolve({controller:'manageuser', template: 'manageuser', label: 'Users'}, 'users/manageuser/'))
				
				.when('/dashboard/users/:userViews?/:id?', route.resolve({controller:'manageuser', template: 'manageuser', label: "Manage Users"}, 'users/manageuser/'))
				
				.when('/dashboard/enquiry/:mailId?/:id?', route.resolve({controller:'enquiry', template: 'enquiry',label:"Mail Box"}, 'enquiry/'))
				
				.when('/dashboard/templates/mytemplates/:id?', route.resolve({controller:'mytemplates', template: 'mytemplates',label:"My Template"}, 'templates/mytemplates/'))
				
				.when('/dashboard/templates/:tempPart?/:id?', route.resolve({controller:'templates', template: 'templates',label:"Template"}, 'templates/'))
				
				// Always Add Static Route before dynamic route/dynamic parameter
				.when('/dashboard/business/addbusiness/:id?', route.resolve({controller:'addbusiness', template: 'addbusiness',label:"Add New Business"}, 'business/addbusiness/'))
				
				.when('/dashboard/business/adddetails/:id?', route.resolve({controller:'adddetails', template: 'adddetails',label:"Business Details"}, 'business/adddetails/'))
				
				.when('/dashboard/business/products/:productView?', route.resolve({controller:'products', template: 'products',label:"Products & Services"}, 'business/products/'))
				
				.when('/dashboard/business/:businessView?', route.resolve({controller:'business', template: 'business',label:"Business"}, 'business/'))
				
				.when('/dashboard/property', route.resolve({controller: 'property', template: 'property',
				 label: "Property"}, 'property/'))
				 
				 .when('/dashboard/property/setrent/:id?', route.resolve({controller: 'property', template: 'setrent',
				 label: "Set Rent"}, 'property/'))
				 
				 .when('/dashboard/property/rentsetting/:id?', route.resolve({controller: 'property', template: 'rentsetting',
				 label: "Tax Info"}, 'property/'))
				 
				 .when('/dashboard/property/addproperty/:id?', route.resolve({controller: 'addproperty', template: 'addproperty',label: "Add Property"}, 'property/addproperty/'))
				
				.when('/dashboard/rentreport/:id?', route.resolve({controller: 'rentreport', template: 'rentreport',
				 label: "View Rent Report"}, 'rentreport/'))
				 
				.when('/dashboard/rentreport/invoice/:propertyId?/:userId', route.resolve({controller:'rentreport', template: 'invoice',label:"Generate Invoice "}, 'rentreport/'))
				 
				 .when('/dashboard/accounting', route.resolve({controller: 'accounting', template: 'accounting',
				 label: "Accounting"}, 'accounting/'))
				 
				 .when('/dashboard/accounting/invoice', route.resolve({controller: 'invoice', template: 'invoice',
				 label: "Invoice"}, 'accounting/invoice/'))
				 
				 .when('/dashboard/accounting/transaction', route.resolve({controller: 'transaction', template: 'transaction',
				 label: "Transaction"}, 'accounting/transaction/'))
				 
				 .when('/dashboard/accounting/account', route.resolve({controller: 'account', template: 'account',
				 label: "Account"}, 'accounting/account/'))
				 
				 .when('/dashboard/userreport', route.resolve({controller: 'viewreport', template: 'userreport',
				 label: "User Report"}, 'viewreport/'))
				 
				 .when('/dashboard/viewreport/addincome', route.resolve({controller: 'viewreport', template: 'addincome',
				 label: "Add Income"}, 'viewreport/'))
				 
				 
				  .when('/dashboard/viewreport/addexpenses', route.resolve({controller: 'viewreport', template: 'addexpenses',
				 label: "Add Expenses"}, 'viewreport/'))
				 
				 
				.when('/dashboard/project', route.resolve({controller: 'project',template: 'project',
					label: "Project"}, 'project/'))
					
				 .when('/dashboard/project/addproject/:id?', route.resolve({controller: 'addproject',template: 'addproject',label: "Add Project"}, 'project/addproject/'))
				
				
				.when('/dashboard/websites/websettings/:id', route.resolve({controller:'websettings', template: 'websettings',label:"Website Settings"}, 'websites/websettings/'))
				
				.when('/dashboard/websites/:websitePart?', route.resolve({controller:'websites', template: 'websites',label:"Websites"}, 'websites/'))
				
                .otherwise({ redirectTo: '/' });
				
	}]);
	
		
	app.run(['$location', '$rootScope', 'breadcrumbs','dataService','$cookieStore', '$cookies','$routeParams','$notification','$timeout', function($location, $rootScope, breadcrumbs, dataService, $cookieStore, $cookies,$routeParams,$notification,$timeout) {
		$rootScope.$on("$routeChangeStart", function (event, next, current) {
			$rootScope.userDetails = dataService.userDetails;
			
			//$rootScope.breadcrumbs = breadcrumbs;
			$rootScope.appConfig = {
				metaTitle : "Small Business",
				headerTitle : next.$$route.label,
				subTitle : next.$$route.label,
				assetPath : '..'
			};
			var nextUrl = next.$$route.originalPath;
			if(nextUrl == '/logout' || dataService.auth == false){
				dataService.logout();
				$rootScope.userDetails = null;
			}
			
			if(dataService.auth == false || $rootScope.userDetails == null){
				var changePassUrl = '"/changepass/'+next.pathParams.resetPassKey+'"';
				if (nextUrl == '/forgotpass' || nextUrl == '/register' || nextUrl == '/dynamic' || nextUrl == '/login' || nextUrl == '/' || nextUrl == '/logout' || nextUrl == '/changepass/:resetPassKey' || nextUrl == '/activate/:activateKey/:email/:pass?') {
				} else {
					$location.path("/login");
					$notification.warning("Login", "You are not logged in!");
				}
			}else{
				if (nextUrl == '/forgotpass' || nextUrl == '/register'  || nextUrl == '/dynamic' || nextUrl == '/login' || nextUrl == '/' || nextUrl == '/changepass/:resetPassKey' || nextUrl == '/activate/:activateKey/:email/:pass?') {
					$location.path("/dashboard");
				}
				
			};
			if($rootScope.userDetails != null){
				if($rootScope.userDetails.config == "") $rootScope.userDetails.config = {};
				if($rootScope.userDetails.config.rentsetting === undefined){
					$rootScope.userDetails.config.rentsetting = {
						service_tax : 0,
						other_tax : 0,
						pan_no : 0,
						tin_no : 0
					}
					dataService.put('put/user/'+$rootScope.userDetails.id, {config : $rootScope.userDetails.config}).then(function(response){
						if(response.status == "success"){
							dataService.setUserDetails(JSON.stringify($rootScope.userDetails));
							$rootScope.userDetails = dataService.parse(dataService.userDetails);
						}
					})
				}
				if($rootScope.userDetails.group_id == 4){
					if($rootScope.userDetails.config.addbusiness === undefined){
						
						$rootScope.userDetails.config = {
							addbusiness : false,
							addbusinessDetails : false,
							addProducts : false,
							chooseTemplate : false,
							requestSite : false
						}
						
						dataService.put('put/user/'+$rootScope.userDetails.id, {config : $rootScope.userDetails.config}).then(function(response){
							
							if(response.status == "success"){
								dataService.setUserDetails(JSON.stringify($rootScope.userDetails));
								$rootScope.userDetails = dataService.parse(dataService.userDetails);
							}
						})
					}
					
					if($rootScope.userDetails.config.addbusiness == false){
						$location.path("/dashboard/business/addbusiness");
						$rootScope.addbusinessClass = 'col-xs-3 bs-wizard-step active';
						$rootScope.addProductsClass = 'col-xs-3 bs-wizard-step disabled';
						$rootScope.chooseTemplateClass = 'col-xs-3 bs-wizard-step disabled';
						$rootScope.requestSiteClass = 'col-xs-3 bs-wizard-step disabled';
					}else if($rootScope.userDetails.config.addbusinessDetails != true){
						$location.path("/dashboard/business/adddetails/"+$rootScope.userDetails.config.addbusinessDetails);
						$rootScope.addbusinessClass = 'col-xs-3 bs-wizard-step active';
						$rootScope.addProductsClass = 'col-xs-3 bs-wizard-step disabled';
						$rootScope.chooseTemplateClass = 'col-xs-3 bs-wizard-step disabled';
						$rootScope.requestSiteClass = 'col-xs-3 bs-wizard-step disabled';
					}else if($rootScope.userDetails.config.addProducts != true){
						$location.path("/dashboard/business/products/"+$rootScope.userDetails.config.addProducts);
						$rootScope.addbusinessClass = 'col-xs-3 bs-wizard-step complete';
						$rootScope.addProductsClass = 'col-xs-3 bs-wizard-step active';
						
						$rootScope.chooseTemplateClass = 'col-xs-3 bs-wizard-step disabled';
						$rootScope.requestSiteClass = 'col-xs-3 bs-wizard-step disabled';
						
					}else if($rootScope.userDetails.config.chooseTemplate == false){
						//$location.path("/dashboard/templates/listoftemplates");
						$rootScope.addbusinessClass = 'col-xs-3 bs-wizard-step complete';
						$rootScope.addProductsClass = 'col-xs-3 bs-wizard-step complete';
						$rootScope.chooseTemplateClass = 'col-xs-3 bs-wizard-step active';
						$rootScope.requestSiteClass = 'col-xs-3 bs-wizard-step disabled';
						
					}else if($rootScope.userDetails.config.requestSite == false){
						$location.path("/dashboard/websites/requestnewsite");
						$rootScope.addbusinessClass = 'col-xs-3 bs-wizard-step complete';
						$rootScope.addProductsClass = 'col-xs-3 bs-wizard-step complete';
						$rootScope.chooseTemplateClass = 'col-xs-3 bs-wizard-step complete';
						$rootScope.requestSiteClass = 'col-xs-3 bs-wizard-step active';
					}
				}
			}
			
		});
		
		//(userDetails.config.chooseTemplate=='true')
	}]);
	return app;
});