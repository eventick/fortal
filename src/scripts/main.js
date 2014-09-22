  'use strict';

  var sge_events = angular.module('eventsSearch', ['ngRoute', 'eventsSearch.services', 'eventsSearch.controllers']);

  sge_events.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/eventos', {
        templateUrl: 'partials/events.html',
        controller: 'eventsCtrl'
      }).
      when('/', {
        templateUrl: 'partials/home.html',
        controller: 'homeCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

  var services = angular.module('eventsSearch.services', []);
  var controllers = angular.module('eventsSearch.controllers', []);

  services.factory('CSService', ['$http',
  function($http){
    var mount_params = function(params){
      var parsed_params = params.q !== undefined ? "(and '" + params.q + "' start_at:0.." : "(and start_at:0..";

      if (params.estado !== undefined && params.estado != '') { parsed_params += " address_region:'" + params.estado + "'"; }
      if (params.tematica !== undefined && params.tematica != '') { parsed_params += " sge_theme:'" + params.tematica + "'"; }

      return parsed_params + ')';
    }

    return {
      getStates: function(callback){
        return $http.get('http://localhost/eventick/?bq=start_at:0..&facet=address_region').success(function(data){
          callback(data.facets.address_region.constraints);
        });
      },
      getThemes: function(callback){
        return $http.get('http://localhost/eventick/?bq=start_at:0..&facet=sge_theme').success(function(data){
          callback(data.facets.sge_theme.constraints);
        });
      },
      getEvents: function(params, callback){
        var mounted_params = mount_params(params);

        return $http.get('http://localhost/eventick/?bq=' + mounted_params + '&return-fields=address_locality,listing_image_url,organization,slug,start_at,title,venue').success(function(data){
          var events = [];

          angular.forEach(data.hits.hit, function(value, key){
            var temp_event = {};

            for(var attr in value.data) { temp_event[attr] = value.data[attr].pop(); }

            events.push(temp_event);
          });

          return callback(events);
        });
      }
    };
  }]);

  controllers.controller('homeCtrl', ['$scope', '$location', 'CSService', function($scope, $location, CSService) {
    CSService.getStates(function(states){ $scope.states = states });

    CSService.getThemes(function(themes){ $scope.themes = themes });

    $scope.submitSearch = function(){ $location.path('/eventos').search( {q: $scope.q} ) };
  }]);

  controllers.controller('eventsCtrl', ['$scope', '$routeParams', '$location', 'CSService', function($scope, $routeParams, $location, CSService) {
    $scope.current_state = $routeParams.estado;
    $scope.current_theme = $routeParams.tematica;
    $scope.q = $routeParams.q;

    CSService.getStates(function(states){ $scope.states = states });

    CSService.getThemes(function(themes){ $scope.themes = themes });

    CSService.getEvents($routeParams, function(events){ $scope.events = events });

    $scope.filterEvents = function(){
      $routeParams.q = $scope.q;
      $routeParams.estado = $scope.current_state;
      $routeParams.tematica = $scope.current_theme;

      $location.path('/eventos').search($routeParams);
    }
  }]);
