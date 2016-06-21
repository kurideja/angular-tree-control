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
      $scope.expandedNodesMap = {};
      for (var i = 0; i < $scope.expandedNodes.length; i++) {
        $scope.expandedNodesMap['' + i] = $scope.expandedNodes[i];
      }
      $scope.parentScopeOfTree = $scope.$parent;
    }

    function headClass(node) {
      var liSelectionClass = TreeControl.classIfDefined($scope.options.injectClasses.liSelected, false);
      var injectSelectionClass = '';
      if (liSelectionClass && isSelectedNode(node))
        injectSelectionClass = ' ' + liSelectionClass;
      if ($scope.options.isLeaf(node))
        return 'tree-leaf' + injectSelectionClass;
      if ($scope.expandedNodesMap[this.$id])
        return 'tree-expanded' + injectSelectionClass;
      else
        return 'tree-collapsed' + injectSelectionClass;
    }

    function nodeExpanded() {
      return !!$scope.expandedNodesMap[this.$id];
    }

    function iBranchClass() {
      if ($scope.expandedNodesMap[this.$id])
        return TreeControl.classIfDefined($scope.options.injectClasses.iExpanded);
      else
        return TreeControl.classIfDefined($scope.options.injectClasses.iCollapsed);
    }

    function selectNodeHead($event) {
      var expanding = $scope.expandedNodesMap[this.$id] === undefined;
      if($event) {
        $event.stopPropagation();
      }
      $scope.expandedNodesMap[this.$id] = (expanding ? this.node : undefined);
      if (expanding) {
        $scope.expandedNodes.push(this.node);
      }
      else {
        var index;
        for (var i = 0; (i < $scope.expandedNodes.length) && !index; i++) {
          if ($scope.options.equality($scope.expandedNodes[i], this.node)) {
            index = i;
          }
        }
        if (index != undefined)
          $scope.expandedNodes.splice(index, 1);
      }
      if ($scope.onNodeToggle)
        $scope.onNodeToggle({node: this.node, expanded: expanding});
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
