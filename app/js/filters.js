'use strict';

// Filters goes here
define([], function () {
	
	var app =  angular.module('customFilters', []);
	// Custom Filters goes here
	
	app.filter('range', function() {
	  return function(input) {
            var lowBound, highBound;
            switch (input.length) {
            case 1:
                lowBound = 0;
                highBound = parseInt(input[0]) - 1;
                break;
            case 2:
                lowBound = parseInt(input[0]);
                highBound = parseInt(input[1]);
                break;
            default:
                return input;
            }
            var result = [];
            for (var i = lowBound; i <= highBound; i++)
				if(i <=9) result.push("0" + i);
				else result.push(i);
            return result;
        };
	});
	
	app.filter('replace', function () {
		return function(text, input, output) {
			//console.log(input);
			for(var x in input){
				var re = new RegExp(x,"g");
				return text.replace(re, input[x]);
			}
			
		}
	})
	
	return app;
});