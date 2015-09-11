'use strict';

// Directives goes here 

define(['app', 'tinymce'], function (app) {
	/* go-back directive
	***************************************************************************/
	var app =  angular.module('customDirectives', []);
	app.directive('goBack', function () {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				element.on('click', function() {
					window.history.back();
				});
			}
		};
	});
	
	/* filePreview directive for thumbnail preview while uploading images
	**************************************************************************************/
	app.directive('filePreview', ['$compile','upload',function ($compile,upload) {
		return {
			restrict: 'EA',
			require: "?ngModel",
			template: "<ul class='list-inline'><li ng-repeat='img in url'><img ng-src='{{img.dataUrl}}' class='img-thumbnail' width='50' ng-click='click(img)'><div class='progress'> <div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='{{img.progress}}' aria-valuemin='0' aria-valuemax='100' style='width: {{img.progress}}%'></div></div></li></ul>",
			scope: {
				url : "="
			},
			link: function(scope, element, attrs, ngModel) {
				scope.click = function(ind){
					console.log(ind);
				};
			},
			replace:true
			
		};
	}]);
	
	/*
	******************************************************************************************************/
	/**
	 * Checklist-model
	 * AngularJS directive for list of checkboxes
	 */

	app
	.directive('checklistModel', ['$parse', '$compile', function($parse, $compile) {
	  // contains
	  function contains(arr, item, comparator) {
		if (angular.isArray(arr)) {
		  for (var i = arr.length; i--;) {
			if (comparator(arr[i], item)) {
			  return true;
			}
		  }
		}
		return false;
	  }

	  // add
	  function add(arr, item, comparator) {
		arr = angular.isArray(arr) ? arr : [];
		  if(!contains(arr, item, comparator)) {
			  arr.push(item);
		  }
		return arr;
	  }  

	  // remove
	  function remove(arr, item, comparator) {
		if (angular.isArray(arr)) {
		  for (var i = arr.length; i--;) {
			if (comparator(arr[i], item)) {
			  arr.splice(i, 1);
			  break;
			}
		  }
		}
		return arr;
	  }

	  // http://stackoverflow.com/a/19228302/1458162
	  function postLinkFn(scope, elem, attrs) {
		// compile with `ng-model` pointing to `checked`
		$compile(elem)(scope);

		// getter / setter for original model
		var getter = $parse(attrs.checklistModel);
		var setter = getter.assign;
		var checklistChange = $parse(attrs.checklistChange);

		// value added to list
		var value = $parse(attrs.checklistValue)(scope.$parent);


	  var comparator = angular.equals;

	  if (attrs.hasOwnProperty('checklistComparator')){
		comparator = $parse(attrs.checklistComparator)(scope.$parent);
	  }

		// watch UI checked change
		scope.$watch('checked', function(newValue, oldValue) {
		  if (newValue === oldValue) { 
			return;
		  } 
		  var current = getter(scope.$parent);
		  if (newValue === true) {
			setter(scope.$parent, add(current, value, comparator));
		  } else {
			setter(scope.$parent, remove(current, value, comparator));
		  }

		  if (checklistChange) {
			checklistChange(scope);
		  }
		});
		
		// declare one function to be used for both $watch functions
		function setChecked(newArr, oldArr) {
			scope.checked = contains(newArr, value, comparator);
		}

		// watch original model change
		// use the faster $watchCollection method if it's available
		if (angular.isFunction(scope.$parent.$watchCollection)) {
			scope.$parent.$watchCollection(attrs.checklistModel, setChecked);
		} else {
			scope.$parent.$watch(attrs.checklistModel, setChecked, true);
		}
	  }

	  return {
		restrict: 'A',
		priority: 1000,
		terminal: true,
		scope: true,
		compile: function(tElement, tAttrs) {
		  if (tElement[0].tagName !== 'INPUT' || tAttrs.type !== 'checkbox') {
			throw 'checklist-model should be applied to `input[type="checkbox"]`.';
		  }

		  if (!tAttrs.checklistValue) {
			throw 'You should provide `checklist-value`.';
		  }

		  // exclude recursion
		  tElement.removeAttr('checklist-model');
		  
		  // local scope var storing individual checkbox model
		  tElement.attr('ng-model', 'checked');

		  return postLinkFn;
		}
	  };
	}]);
	
	/* TinyMCE directive 
	*******************************************************************************************************/
	app.value('uiTinymceConfig', {});
	app.directive('uiTinymce', ['uiTinymceConfig', function (uiTinymceConfig) {
		uiTinymceConfig = uiTinymceConfig || {};
		var generatedIds = 0;
		return {
		  priority: 10,
		  require: 'ngModel',
		  link: function (scope, elm, attrs, ngModel) {
			var expression, options, tinyInstance,
			  updateView = function () {
				ngModel.$setViewValue(elm.val());
				if (!scope.$root.$$phase) {
				  scope.$apply();
				}
			  };

			// generate an ID if not present
			if (!attrs.id) {
			  attrs.$set('id', 'uiTinymce' + generatedIds++);
			}

			if (attrs.uiTinymce) {
			  expression = scope.$eval(attrs.uiTinymce);
			} else {
			  expression = {};
			}

			// make config'ed setup method available
			if (expression.setup) {
			  var configSetup = expression.setup;
			  delete expression.setup;
			}

			options = {
			  // Update model when calling setContent (such as from the source editor popup)
			  setup: function (ed) {
				var args;
				ed.on('init', function(args) {
				  ngModel.$render();
				  ngModel.$setPristine();
				});
				// Update model on button click
				ed.on('ExecCommand', function (e) {
				  ed.save();
				  updateView();
				});
				// Update model on keypress
				ed.on('KeyUp', function (e) {
				  ed.save();
				  updateView();
				});
				// Update model on change, i.e. copy/pasted text, plugins altering content
				ed.on('SetContent', function (e) {
				  if (!e.initial && ngModel.$viewValue !== e.content) {
					ed.save();
					updateView();
				  }
				});
				ed.on('blur', function(e) {
					elm.blur();
				});
				// Update model when an object has been resized (table, image)
				ed.on('ObjectResized', function (e) {
				  ed.save();
				  updateView();
				});
				if (configSetup) {
				  configSetup(ed);
				}
			  },
			  mode: 'exact',
			  theme: "modern",
			  plugins: [
					 "advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
					 "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
					 "save table contextmenu directionality emoticons template paste textcolor"
			  ],
			  elements: attrs.id
			};
			// extend options with initial uiTinymceConfig and options from directive attribute value
			angular.extend(options, uiTinymceConfig, expression);
			setTimeout(function () {
			  tinymce.init(options);
			});

			ngModel.$render = function() {
			  if (!tinyInstance) {
				tinyInstance = tinymce.get(attrs.id);
			  }
			  if (tinyInstance) {
				tinyInstance.setContent(ngModel.$viewValue || '');
			  }
			};

			scope.$on('$destroy', function() {
			  if (!tinyInstance) { tinyInstance = tinymce.get(attrs.id); }
			  if (tinyInstance) {
				tinyInstance.remove();
				tinyInstance = null;
			  }
			});
		  }
		};
	}]);
	/* TinyMCE ends here*/
	
	/* Notification directive */
	app.directive('notifications', ['$notification', '$compile', function($notification, $compile){
    /**
     *
     * It should also parse the arguments passed to it that specify
     * its position on the screen like "bottom right" and apply those
     * positions as a class to the container element
     *
     * Finally, the directive should have its own controller for
     * handling all of the notifications from the notification service
     */
    var html =
      '<div class="dr-notification-wrapper" ng-repeat="noti in queue">' +
        '<div class="dr-notification alert alert-dismissible alert-{{(noti.type == \'error\') ? \'danger\' : noti.type}}">' +
			'<button type="button" class="close" ng-click="removeNotification(noti)">'+
				'<span aria-hidden="true">×</span>'+
				'<span class="sr-only">Close</span>'+
			'</button>'+
          '<div class="dr-notification-image dr-notification-type-{{noti.type}}" ng-switch on="noti.image">' +
            '<i class="glyphicon glyphicon-{{noti.icon}}" ng-switch-when="false"></i>' +
            '<img ng-src="{{noti.image}}" ng-switch-default />' +
          '</div>' +
          '<div class="dr-notification-content">' +
            '<h3 class="dr-notification-title">{{noti.title}}</h3>' +
            '<p class="dr-notification-text">{{noti.content}}</p>' +
          '</div>' +
        '</div>' +
      '</div>';


    function link(scope, element, attrs){
      var position = attrs.notifications;
      position = position.split(' ');
      element.addClass('dr-notification-container');
      for(var i = 0; i < position.length ; i++){
        element.addClass(position[i]);
      }
    }


    return {
      restrict: 'A',
      scope: {},
      template: html,
      link: link,
      controller: ['$scope', function NotificationsCtrl( $scope ){
        $scope.queue = $notification.getQueue();

        $scope.removeNotification = function(noti){
          $scope.queue.splice($scope.queue.indexOf(noti), 1);
        };
      }
    ]

    };
  }]);
	
	return app;

});