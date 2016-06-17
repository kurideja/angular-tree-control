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
