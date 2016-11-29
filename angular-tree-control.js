(function() {

  'use strict';

  angular
    .module('treeControl', [
      'treeControl.templates'
    ]);

})();

(function() {

  'use strict';

  angular
    .module('treeControl.templates', []);

})();

angular.module('treeControl.templates').run(['$templateCache', function($templateCache) {$templateCache.put('src/treeControlTemplate.html','<ul>\n    <li ng-repeat="node in node[options.nodeChildren] | filter:filterExpression:filterComparator | orderBy:orderBy"\n        ng-class="headClass(node)">\n        <div class="tree-item" ng-class="selectedClass()" ng-click="selectNodeLabel(node)">\n            <span class="tree-indentation-block"\n                  ng-style="{ width: ((node.level || 0) + 1) * options.indentation + \'px\' }"\n                  ng-dblclick="selectNodeHead($event, node)" ng-click="doNothing($event)"></span>\n            <span class="caret-container" ng-click="selectNodeHead($event, node)">\n                <i class="tree-branch-caret"></i>\n            </span>\n            <i class="tree-branch-head" ng-class="[iBranchClass(), customIconClass()]"></i>\n            <i class="tree-leaf-head" ng-class="customIconClass()"></i>\n            <div class="tree-label" tree-transclude></div>\n        </div>\n        <div tree-item ng-if="nodeExpanded(node)"></div>\n    </li>\n</ul>\n');}]);
(function() {

  'use strict';

  angular
    .module('treeControl')
    .controller('TreeControlCtrl', TreeControlCtrl);

  TreeControlCtrl.$inject = ['$scope', '$compile', 'TreeControl'];

  function TreeControlCtrl($scope, $compile, TreeControl) {
    $scope.headClass = headClass;
    $scope.nodeExpanded = nodeExpanded;
    $scope.iBranchClass = iBranchClass;
    $scope.selectNodeHead = selectNodeHead;
    $scope.selectNodeLabel = selectNodeLabel;
    $scope.selectedClass = selectedClass;
    $scope.doNothing = doNothing;
    $scope.customIconClass = customIconClass;
    $scope.orderBy = $scope.orderBy || '';

    init();

    function init() {
      $scope.options = $scope.options || {};
      TreeControl.ensureDefaults($scope.options);
      $scope.selectedNodes = $scope.selectedNodes || [];
      $scope.expandedNodes = $scope.expandedNodes || [];
      $scope.parentScopeOfTree = $scope.$parent;
    }

    function headClass(node) {
      var liSelectionClass = TreeControl.classIfDefined($scope.options.injectClasses.liSelected, false);
      var injectSelectionClass = '';
      if (liSelectionClass && isSelectedNode(node))
        injectSelectionClass = ' ' + liSelectionClass;
      if ($scope.options.isLeaf(node))
        return 'tree-leaf' + injectSelectionClass;
      if (nodeExpanded(this.node)) {
        return 'tree-expanded' + injectSelectionClass;
      } else {
        return 'tree-collapsed' + injectSelectionClass;
      }
    }

    function nodeExpanded(node) {
      return !!_.find($scope.expandedNodes, { id: node.id });
    }

    function iBranchClass() {
      if (nodeExpanded(this.node))
        return TreeControl.classIfDefined($scope.options.injectClasses.iExpanded);
      else
        return TreeControl.classIfDefined($scope.options.injectClasses.iCollapsed);
    }

    function selectNodeHead($event, node) {
      var isExpanding = !nodeExpanded(node);

      if (!isExpanding) {
        _.remove($scope.expandedNodes, { id: node.id });
      }

      if ($event) {
        $event.stopPropagation();
      }

      if (node && $scope.onExpand && isExpanding) {
        $scope.onExpand({ node: node, done: afterSelection.bind(this, isExpanding)});
      } else {
        afterSelection.bind(this, isExpanding);
      }
    }

    function afterSelection(isExpanding) {
      var index;
      if (isExpanding) {
        $scope.expandedNodes.push(this.node);
      }
      else {
        for (var i = 0; (i < $scope.expandedNodes.length) && !index; i++) {
          if ($scope.options.equality($scope.expandedNodes[i], this.node)) {
            index = i;
          }
        }
        if (index != undefined)
          $scope.expandedNodes.splice(index, 1);
      }

      if ($scope.onNodeToggle) {
        $scope.onNodeToggle({node: this.node, expanded: isExpanding});
      }
    }

    function selectNodeLabel(selectedNode) {
      if (selectedNode[$scope.options.nodeChildren] && selectedNode[$scope.options.nodeChildren].length > 0 && !$scope.options.dirSelectable) {
        $scope.selectNodeHead();
      } else {
        var selected = false;
        if ($scope.options.multiSelection) {
          var pos = -1;
          for (var i = 0; i < $scope.selectedNodes.length; i++) {
            if ($scope.options.equality(selectedNode, $scope.selectedNodes[i])) {
              pos = i;
              break;
            }
          }
          if (pos === -1) {
            $scope.selectedNodes.push(selectedNode);
            selected = true;
          } else {
            $scope.selectedNodes.splice(pos, 1);
          }
        } else if ($scope.options.equality(selectedNode, $scope.selectedNode) && !$scope.options.allowDeselect) {
          $scope.selectedNode = selectedNode;
          $scope.selectNodeHead();
        } else {
          if (!$scope.options.equality(selectedNode, $scope.selectedNode)) {
            $scope.selectedNode = selectedNode;
            selected = true;
          }
          else {
            $scope.selectedNode = undefined;
          }
        }
        if ($scope.onSelection)
          $scope.onSelection({node: selectedNode, selected: selected});
      }
    }

    function selectedClass() {
      var isThisNodeSelected = isSelectedNode(this.node);
      var labelSelectionClass = TreeControl.classIfDefined($scope.options.injectClasses.labelSelected, false);
      var injectSelectionClass = '';
      if (labelSelectionClass && isThisNodeSelected) {
        injectSelectionClass = ' ' + labelSelectionClass;
      }

      return isThisNodeSelected ? 'tree-selected' + injectSelectionClass : '';
    }

    function doNothing($event) {
      if($event) {
        $event.preventDefault();
        $event.stopImmediatePropagation();
      }
    }

    function customIconClass() {
      return TreeControl.iconClass($scope.options, this.node);
    }

    function isSelectedNode(node) {
      if (!$scope.options.multiSelection && ($scope.options.equality(node, $scope.selectedNode)))
        return true;
      else if ($scope.options.multiSelection && $scope.selectedNodes) {
        for (var i = 0; (i < $scope.selectedNodes.length); i++) {
          if ($scope.options.equality(node, $scope.selectedNodes[i])) {
            return true;
          }
        }
        return false;
      }
    }

    this.template = $compile('<div tree-control-template></div>');
  }

})();

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
        onExpand: "&",
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
          // var newExpandedNodesMap = {};
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
                // newExpandedNodesMap[existingScope.$id] = existingScope.node;
                found = true;
              }
            }
            // if (!found) newExpandedNodesMap[notFoundIds++] = newExNode;
          });
          // scope.expandedNodesMap = newExpandedNodesMap; TODO
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

(function() {

  'use strict';

  angular
    .module('treeControl')
    .factory('TreeControl', TreeControl);

  function TreeControl() {
    var factory = {
      classIfDefined: classIfDefined,
      ensureDefaults: ensureDefaults,
      iconClass: iconClass
    };
    
    function iconClass(options, node) {
      return options.iconClass(node) || ''; 
    }

    function classIfDefined(cssClass, addClassProperty) {
      if (!cssClass) {
        return '';
      }

      if (addClassProperty) {
        return 'class="' + cssClass + '"';
      }

      return cssClass;
    }

    function ensureDefaults(options) {
      var defaultOptions = {
        multiSelection: false,
        nodeChildren: 'children',
        dirSelectable: true,
        injectClasses: {},
        indentation: 10,
        allowDeselect: true,
        iconClass: angular.noop
      };

      var defaultInjectedClasses = {
        liSelected: '',
        iExpanded: '',
        iCollapsed: '',
        iLeaf: '',
        label: '',
        labelSelected: ''
      };

      _.defaults(options, defaultOptions);
      _.defaults(options.injectClasses, defaultInjectedClasses);
      _.defaults(options, {
        equality: _.curry(defaultEquality)(options.nodeChildren),
        isLeaf: _.curry(defaultIsLeaf)(options.nodeChildren)
      });
    }

    /////////
    function defaultIsLeaf(childrenKey, node) {
      return !node[childrenKey] || node[childrenKey].length === 0;
    }

    function shallowCopy(src, dst) {
      if (angular.isArray(src)) {
        dst = dst || [];

        for (var i = 0; i < src.length; i++) {
          dst[i] = src[i];
        }
      } else if (angular.isObject(src)) {
        dst = dst || {};

        for (var key in src) {
          if (hasOwnProperty.call(src, key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
            dst[key] = src[key];
          }
        }
      }

      return dst || src;
    }

    function defaultEquality(childrenKey, a, b) {
      if (a === undefined || b === undefined)
        return false;
      a = shallowCopy(a);
      a[childrenKey] = [];
      b = shallowCopy(b);
      b[childrenKey] = [];
      return angular.equals(a, b);
    }

    return factory;
  }
})();

(function() {

  'use strict';

  angular
    .module('treeControl')
    .directive('treeControlTemplate', treeControlTemplate);

  function treeControlTemplate() {
    return {
      restrict: 'A',
      templateUrl: 'src/treeControlTemplate.html'
    }
  }
})();

(function() {

  'use strict';

  angular
    .module('treeControl')
    .directive('treeItem', treeItem);

  treeItem.$inject = ['$compile'];

  function treeItem($compile) {
    return {
      restrict: 'A',
      require: "^treeControl",
      link: function (scope, element) {
        $compile('<div tree-control-template></div>')(scope, function(clone) {
          element.html('').append(clone)
        });
      }
    }
  }
})();

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
