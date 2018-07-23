(function(){
    "use strict";

    angular.module("httpRequest", [])

    .service("HttpRequestService", ['$log', '$q', '$rootScope', '$http', 
    function($log, $q, $rootScope, $http){

        return {
            request: function(opts){
                var deferred = $q.defer();

                $http(opts).then(function(response){
                    if( response.data.error ) 
                    {
                        $rootScope.error = response.data.error;
                        $rootScope.$broadcast('httpRequestOnError' );
                        deferred.reject(response);
                    } 
                    else 
                    {
                        deferred.resolve(response);
                    }
                });

                return deferred.promise;
            }
        }
    }]);

})();