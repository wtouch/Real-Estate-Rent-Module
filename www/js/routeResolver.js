'use strict';

define([], function () {

    var routeResolver = function () {

        this.$get = function () {
            return this;
        };

        this.routeConfig = function () {
            var viewsDirectory = '/app/views/',
                controllersDirectory = '/app/controllers/',
				directivesDirectory = '/app/directives/',
				servicesDirectory = '/app/services/',

            setBaseDirectories = function (viewsDir, controllersDir, directivesDir, servicesDir) {
                viewsDirectory = viewsDir;
                controllersDirectory = (controllersDir) ? controllersDir : viewsDir;
				directivesDirectory = (directivesDir) ? directivesDir : viewsDir;
				servicesDirectory = (servicesDir) ? servicesDir : viewsDir;
            },

            getViewsDirectory = function () {
                return viewsDirectory;
            },
			
			getControllersDirectory = function () {
                return controllersDirectory;
            },

            getDirectivesDirectory = function () {
                return directivesDirectory;
            },
			
			getServicesDirectory = function () {
                return servicesDirectory;
            };
			
			
            return {
                setBaseDirectories: setBaseDirectories,
                getControllersDirectory: getControllersDirectory,
                getViewsDirectory: getViewsDirectory,
				getDirectivesDirectory : getDirectivesDirectory,
				getServicesDirectory : getServicesDirectory
            };
        }();

        this.route = function (routeConfig) {

            var resolve = function (baseName, path, controllerAs, secure) {
                //baseName = {};
				var ctrl, temp, dir, serv, dependencies = [];
				
				if(angular.isObject(baseName)){
					var fName;
					for(fName in baseName){
						if(fName == 'template'){
							temp = routeConfig.getViewsDirectory() + path + baseName[fName] + '.html';
						}
						if(fName == 'controller') {
							ctrl = baseName[fName]+"Controller";
							dependencies.push(routeConfig.getControllersDirectory() + path + ctrl+".js");
						}
						if(fName == 'directive'){
							dir = baseName[fName];
							dependencies.push(routeConfig.getDirectivesDirectory() + path + dir+".js");
						}
						if(fName == 'service'){
							serv = baseName[fName];
							dependencies.push(routeConfig.getServicesDirectory() + path + serv+".js");
						}
					}
				}else{
					temp = routeConfig.getViewsDirectory() + path + baseName + '.html';
					ctrl = baseName+"Controller";
					dependencies.push(routeConfig.getControllersDirectory() + path + ctrl+".js");
					console.log("not an object");
				}
				
				if (!path) path = '';
				
				var labelName = baseName.controller.substring(0,1).toUpperCase()+baseName.controller.substring(1);
				
                var routeDef = {};
                
                routeDef.templateUrl = temp;
                routeDef.controller = ctrl;
				routeDef.label = (baseName.label) ? baseName.label : labelName;
                if (controllerAs) routeDef.controllerAs = controllerAs;
                routeDef.secure = (secure) ? secure : false;
                routeDef.resolve = {
                    load: ['$q', '$rootScope', function ($q, $rootScope) {
                        return resolveDependencies($q, $rootScope, dependencies);
                    }]
                };
                return routeDef;
            },

            resolveDependencies = function ($q, $rootScope, dependencies) {
                var defer = $q.defer();
                require(dependencies, function () {
                    defer.resolve();
                    $rootScope.$apply()
                });

                return defer.promise;
            };

            return {
                resolve: resolve
            }
        }(this.routeConfig);

    };

    var servicesApp = angular.module('routeResolverServices', []);

    //Must be a provider since it will be injected into module.config()    
    servicesApp.provider('routeResolver', routeResolver);
});
