(function() {

  'use strict';

  angular
    .module('example', ['treeControl'])
    .factory('Example', Example)
    .controller('exampleCtrl', exampleCtrl);

  exampleCtrl.inject = ['Example'];

  function exampleCtrl(Example) {
    var vm = this;

    vm.treeOptions = {
      nodeChildren: '__children',
      dirSelectable: true,
      expandSelected: true,
      allowDeselect: false,
      indentation: 20,
      equality: isSameNode
    };

    function isSameNode(newNode, existingNode) {
      return !!(newNode && existingNode) &&
        +newNode.id === +existingNode.id;
    }

    Example.getTree().then(function(treeData) {
      vm.treeData = treeData;
    });
  }

  Example.$inject = ['$http'];

  function Example($http) {
    var factory = {
      getTree: getTree
    };

    function getTree() {
      return $http.get('data/tree.json').then(function(response) {
        return response.data[0];
      });
    }
    return factory;
  }

})();


