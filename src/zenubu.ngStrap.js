(function () {
    'use strict';
    angular.module('zenubu.ngStrap', [
        'mgcrea.ngStrap',
        'ngSanitize',
        'zenubu.ngStrap.datepicker',
        'zenubu.ngStrap.dropdown',
        'zenubu.ngStrap.modal'
    ])
        .config(function ($tooltipProvider) {
            angular.extend($tooltipProvider.defaults, {
                html: true
            });
        })
        //TODO: Remove as soon as ANGULAR_STRAP ISSUE IS FIXED
        .run(['$templateCache', function ($templateCache) {

            $templateCache.put('datepicker/datepicker.tpl.html',
                '<div class="datepicker" ng-class="\'datepicker-mode-\' + $mode">' +
                '<table style="table-layout: fixed; height: 100%; width: 100%;">' +
                '   <thead>' +
                '   <tr class="text-center">' +
                '       <th>' +
                '       <button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$selectPane(-1)">' +
                '           <i class="{{$iconLeft}}"></i>' +
                '       </button>' +
                '       </th>' +
                '       <th colspan="{{ rows[0].length - 2 }}">' +
                '       <button tabindex="-1" type="button" class="btn btn-default btn-block text-strong" ng-click="$toggleMode()">' +
                '           <strong style="text-transform: capitalize;" ng-bind="title"></strong>' +
                '       </button>' +
                '       </th>' +
                '       <th>' +
                '       <button tabindex="-1" type="button" class="btn btn-default pull-right" ng-click="$selectPane(+1)">' +
                '           <i class="{{$iconRight}}"></i>' +
                '       </button>' +
                '       </th>' +
                '   </tr>' +
                '   <tr ng-show="showLabels" ng-bind-html="labels"></tr>' +
                '   </thead>' +
                '   <tbody>' +
                '   <tr ng-repeat="(i, row) in rows" height="{{ 100 / rows.length }}%">' +
                '       <td class="text-center" ng-repeat="(j, el) in row">' +
                '       <button tabindex="-1" type="button" class="btn btn-default" style="width: 100%" ng-class="{\'btn-primary\': el.selected, \'btn-info btn-today\': el.isToday && !el.selected}" ng-click="$select(el.date)" ng-disabled="el.disabled">' +
                '           <span ng-class="{\'text-muted\': el.muted}" ng-bind="el.label"></span>' +
                '       </button>' +
                '       </td>' +
                '   </tr>' +
                '   </tbody>' +
                '</table></div>'
            );

        }]);
})();