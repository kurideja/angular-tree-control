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
