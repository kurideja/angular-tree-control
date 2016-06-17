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
