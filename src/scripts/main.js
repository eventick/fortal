  'use strict';

  var sge_events = angular.module('eventsSearch', ['ngRoute', 'eventsSearch.services', 'eventsSearch.controllers', 'eventsSearch.filters']);

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
    }
  ]);

  var filters = angular.module('eventsSearch.filters', []);
  var services = angular.module('eventsSearch.services', []);
  var controllers = angular.module('eventsSearch.controllers', []);

  filters.filter('themePrettyPrint', function(){
    return function(theme) {
      var pretty_values = { "": "Temática", "estrategia-de-crescimento": "Estratégia de Crescimento",
      "plano-de-negocios": "Plano de Negócios",
      "estrategia-e-gestao-de-negocios": "Estratégia e Gestão de Negócios",
      "inovacao": "Inovação ",
      "economia-criativa": "Economia Criativa",
      "empreendedorismo-social": "Empreendedorismo Social",
      "vendas-e-marketing": "Vendas e Marketing",
      "inspiracao-e-casos-de-sucesso": "Inspiração e Casos de sucesso",
      "lideranca-e-gestao-de-pessoas": "Liderança e Gestão de Pessoas",
      "financas": "Finanças",
      "sustentabilidade": "Sustentabilidade",
      "regulamentacao-e-impostos": "Regulamentação e Impostos",
      "intraempreendedorismo": "Intraempreendedorismo",
      "ecossistema-empreendedor": "Ecossistema Empreendedor",
      "politicas-publicas": "Políticas Públicas" };

      return pretty_values[theme];
    };
  });

  filters.filter('placeholderForTheme', function(){
    return function(image, theme) {
      if(image !== undefined)
        return image;

      console.log(theme);

      var theme_placeholders = {
        "estrategia-de-crescimento": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "plano-de-negocios": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "estrategia-e-gestao-de-negocios": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "inovacao": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "economia-criativa": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "empreendedorismo-social": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "vendas-e-marketing": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "inspiracao-e-casos-de-sucesso": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "lideranca-e-gestao-de-pessoas": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "financas": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "sustentabilidade": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "regulamentacao-e-impostos": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "intraempreendedorismo": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "ecossistema-empreendedor": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.png",
        "politicas-publicas": "http://eventick-assets.s3.amazonaws.com/assets/missing-b5093f0d21e3eae0ad681c9b5a65982c.pngs"
      };

      return theme_placeholders[theme];
    };
  });

  services.factory('CSService', ['$http',
    function($http){
      var SERVER_URL = 'http://localhost/eventick/';

      var mount_params = function(params){
        var parsed_params = params.q !== undefined ? "(and '" + params.q + "' start_at:0.." : "(and start_at:0..";

        if (params.estado !== undefined && params.estado != '') { parsed_params += " address_region:'" + params.estado + "'"; }
        if (params.tematica !== undefined && params.tematica != '') { parsed_params += " sge_theme:'" + params.tematica + "'"; }

        return parsed_params + ')';
      }

      return {
        getStates: function(callback){
          return $http.get(SERVER_URL + '?bq=start_at:0..&facet=address_region').success(function(data){
            callback(data.facets.address_region.constraints);
          });
        },
        getThemes: function(callback){
          return $http.get(SERVER_URL + '?bq=start_at:0..&facet=sge_theme').success(function(data){
            callback(data.facets.sge_theme.constraints);
          });
        },
        getEvents: function(params, callback){
          var mounted_params = mount_params(params);

          return $http.get(SERVER_URL + '?bq=' + mounted_params + '&return-fields=address_locality,listing_image_url,organization,slug,start_at,title,venue,theme').success(function(data){
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

  controllers.controller('mainCtrl', ['$scope', 'CSService', function($scope, CSService){
    $scope.filters = {};

    CSService.getStates(function(states){ $scope.filters.states = states });
    CSService.getThemes(function(themes){ $scope.filters.themes = themes });
  }]);

  controllers.controller('homeCtrl', ['$scope', '$location', 'CSService', function($scope, $location, CSService) {
    $scope.submitSearch = function(){
      $location.path('/eventos').search( {q: $scope.q} )
    };
  }]);

  controllers.controller('eventsCtrl', ['$scope', '$routeParams', '$location', 'CSService', function($scope, $routeParams, $location, CSService) {
    $scope.filters.current_state = $routeParams.estado;
    $scope.filters.current_theme = $routeParams.tematica;
    $scope.q = $routeParams.q;

    CSService.getEvents($routeParams, function(events){ $scope.events = events });

    $scope.filterEvents = function(){
      $routeParams.q = $scope.q;
      $routeParams.estado = $scope.filters.current_state;
      $routeParams.tematica = $scope.filters.current_theme;

      $location.path('/eventos').search($routeParams);
    }
  }]);
