(function() {

  'use strict';

  angular
    .module('treeControl')
    .directive('treeTransclude', treeTransclude);

  function treeTransclude() {
    return {
      transclude: true,
      link: function (scope, element) {
        if (!scope.options.isLeaf(scope.node)) {
          angular.forEach(scope.expandedNodesMap, function (node, id) {
            if (scope.options.equality(node, scope.node)) {
              scope.expandedNodesMap[scope.$id] = scope.node;
              if(scope.$id !== id) {
                scope.expandedNodesMap[id] = undefined;
              }
            }
          });
        }
        if (!scope.options.multiSelection && scope.options.equality(scope.node, scope.selectedNode)) {
          scope.selectedNode = scope.node;
        } else if (scope.options.multiSelection) {
          var newSelectedNodes = [];
          for (var i = 0; (i < scope.selectedNodes.length); i++) {
            if (scope.options.equality(scope.node, scope.selectedNodes[i])) {
              newSelectedNodes.push(scope.node);
            }
          }
          scope.selectedNodes = newSelectedNodes;
        }

        // create a scope for the transclusion, whos parent is the parent of the tree control
        scope.transcludeScope = scope.parentScopeOfTree.$new();
        scope.transcludeScope.node = scope.node;
        scope.transcludeScope.$parentNode = (scope.$parent.node === scope.synteticRoot) ? null : scope.$parent.node;
        scope.transcludeScope.$index = scope.$index;
        scope.transcludeScope.$first = scope.$first;
        scope.transcludeScope.$middle = scope.$middle;
        scope.transcludeScope.$last = scope.$last;
        scope.transcludeScope.$odd = scope.$odd;
        scope.transcludeScope.$even = scope.$even;
        scope.$on('$destroy', function () {
          scope.transcludeScope.$destroy();
        });

        scope.$treeTransclude(scope.transcludeScope, function (clone) {
          element.empty();
          element.append(clone);
        });
      }
    }
  }
})();
