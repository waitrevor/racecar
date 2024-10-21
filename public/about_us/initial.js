/**
 * 
 */

$(function() {
		$('input[name="realname"]').focus();
});

var app = angular.module('signupApp', ['ngMessages','ngCookies', 'ngResource']).config(function($locationProvider) {
	$locationProvider.html5Mode(true);
});

app.service('translationService', [ '$resource', function($resource) {  
    this.getTranslation = function($scope, language) {
        var languageFilePath = 'messages_' + language + '.json';
        $resource('/about_us/'+languageFilePath).get(function (data) {
            $scope.translation = data;
        });
    };
}]);

app.controller('signupCtrl', ['$scope','$location', '$cookies', 'translationService', function($scope, $location, $cookies, translationService) {
	$scope.signupPage = {
		agreedTerms : true,
		realname : '',
		email : '',
		username : '',
		pwd1 : '',
		pwd2 : '',
		message: '',
		results: ''
	};
	translationService.getTranslation($scope, "en");
}]);

app.directive('validPasswordCheck', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue, $scope) {
                // pwd1 is the master for comparison purposes
            	var noMatch = scope.newuser.pwd1.$viewValue != scope.newuser.pwd2.$viewValue;
                // any errors set noMatch on pwd2
                scope.newuser.pwd2.$setValidity('noMatch',!noMatch);
                return noMatch;
            })
        }
    };
});

app.controller('newUser',['$scope', '$http', function($scope,$http) {
    $scope.submit = function() {
      $scope.newuser.$setValidity('invalid',false);
      var array={}
      array['pwd1']=$scope.newuser.pwd1.$viewValue;
      array['pwd2']=$scope.newuser.pwd2.$viewValue;
      array['email']=$scope.signupPage.email;
      array['agreedTerms']=$scope.signupPage.agreedTerms;
      array['username']=$scope.signupPage.username;
      array['realname']=$scope.signupPage.realname;
      $http({
          method : 'POST',
          url : '/passwordReset/sggee/requestReset/doInitialPassword',
          data : array
      }).success(function(data) {
    	  if (data.passwordValid==false) {
    		  $scope.signupPage.message=$scope.translation.PASSWORD_PROB; //'There was something wrong with your password.';
    	  } else if (data.usernameValid==false) {
    		  $scope.signupPage.message=$scope.translation.USERNAME_PROB; //'There was something wrong with your username';
    	  } else if (data.accountError==true) {
    		  $scope.signupPage.message=$scope.translation.ACCT_PROB; //'There was something wrong with your account. Have you signed up and has your application been processed?';
    	  } else if (data.hasUsername==true) {
    		  $scope.signupPage.message=$scope.translation.HAS_USERNAME; //'There is already an account associated with this email address. Please go to the login page and ask the system to send your information if you have forgotten.';
    	  } else if (data.conflictingUsername==true) {
    		  $scope.signupPage.message=$scope.translation.USERNAME_TAKEN; //'That username is already taken. Please select another!';
    		  $scope.newuser.$setValidity('invalid',true);
    	  } else if (data.passwordUpdated==true) {
    		  $scope.signupPage.message=$scope.translation.SUCCESSFUL_UPDATE; //'Account successfully updated. You may now login to the system!';
    	  }
      }).error(function(){
    	  $scope.signupPage.message=$scope.translation.PROCESSING_ERROR; //'There was an error while processing your request. The services may not currently be available.';
    	  $scope.newuser.$setValidity('invalid',true);
      });
    };
  }]);
