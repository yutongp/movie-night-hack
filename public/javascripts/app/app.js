angular.module('movieNight', []).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/event/:eventID', {
        templateUrl: '/partials/event',
        controller: MovieContainerCtrl
      });
      $locationProvider.html5Mode(true);
  }]);
