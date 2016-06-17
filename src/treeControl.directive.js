(function() {

  'use strict';

  angular
    .module('treeControl')
    .directive('treeControl', treeControl);

  treeControl.$inject = ['$compile'];

  function treeControl($compile) {
    return {
      restrict: 'EA',
      require: "treeControl",
      transclude: true,
      scope: {
        treeModel: "=",
        selectedNode: "=?",
        selectedNodes: "=?",
        expandedNodes: "=?",
        onSelection: "&",
        onNodeToggle: "&",
        options: "=?",
        orderBy: "@",
        reverseOrder: "@",
        filterExpression: "=?",
        filterComparator: "=?"
      },
      controller: 'TreeControlCtrl as vm',
      compile: compile
    };

    function compile(element, attrs, childTranscludeFn) {
      return function (scope, element, attrs, treemodelCntr) {

        scope.$watch("treeModel", function (newValue) {
          if (angular.isArray(newValue)) {
            if (angular.isDefined(scope.node) && angular.equals(scope.node[scope.options.nodeChildren], newValue))
              return;
            scope.node = {};
            scope.synteticRoot = scope.node;
            scope.node[scope.options.nodeChildren] = newValue;
          }
          else {
            if (angular.equals(scope.node, newValue))
              return;
            scope.node = newValue;
          }
        });

        scope.$watchCollection('expandedNodes', function (newValue) {
          var notFoundIds = 0;
          var newExpandedNodesMap = {};
          var $liElements = element.find('li');
          var existingScopes = [];
          // find all nodes visible on the tree and the scope $id of the scopes including them
          angular.forEach($liElements, function (liElement) {
            var $liElement = angular.element(liElement);
            var liScope = $liElement.scope();
            existingScopes.push(liScope);
          });
          // iterate over the newValue, the new expanded nodes, and for each find it in the existingNodesAndScopes
          // if found, add the mapping $id -> node into newExpandedNodesMap
          // if not found, add the mapping num -> node into newExpandedNodesMap
          angular.forEach(newValue, function (newExNode) {
            var found = false;
            for (var i = 0; (i < existingScopes.length) && !found; i++) {
              var existingScope = existingScopes[i];
              if (scope.options.equality(newExNode, existingScope.node)) {
                newExpandedNodesMap[existingScope.$id] = existingScope.node;
                found = true;
              }
            }
            if (!found)
              newExpandedNodesMap[notFoundIds++] = newExNode;
          });
          scope.expandedNodesMap = newExpandedNodesMap;
        });

        //Rendering template for a root node
        $compile('<div tree-control-template></div>')(scope, function (clone) {
          element.html('').append(clone);
        });
        // save the transclude function from compile (which is not bound to a scope as apposed to the one from link)
        // we can fix this to work with the link transclude function with angular 1.2.6. as for angular 1.2.0 we need
        // to keep using the compile function
        scope.$treeTransclude = childTranscludeFn;
      }
    }
  }

})();
