(function () {
    'use strict';
    angular.module('zenubu.ngStrap', [
        'mgcrea.ngStrap',
        'ngSanitize',
        'zenubu.ngStrap.datepicker',
        'zenubu.ngStrap.dropdown',
        'zenubu.ngStrap.modal'
    ])
        .config(["$tooltipProvider", function ($tooltipProvider) {
            angular.extend($tooltipProvider.defaults, {
                html: true
            });
        }])
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
angular.module("zenubu.ngStrap").run(["$templateCache", function($templateCache) {$templateCache.put("zenubu.ngStrap/dropdown/dropdown.tpl.html","<ul tabindex=\"-1\" class=\"dropdown-menu\" role=\"menu\" ng-controller=\"DropdownCtrl as vm\">\n    <li role=\"presentation\"\n        ng-repeat=\"item in content\"\n        ng-class=\"{divider: item.divider}\"\n        ng-click=\"vm.execute(item)\"\n        ng-hide=\"vm.hide(item)\"\n        ng-show=\"vm.show(item)\"\n            >\n        <a ng-if=\"item.template\" compile=\"item.template\"></a>\n        <a ng-if=\"item.templateArray && !vm.model[item.field]\" compile=\"item.templateArray[0]\"></a>\n        <a ng-if=\"item.templateArray && vm.model[item.field]\" compile=\"item.templateArray[1]\"> </a>\n    </li>\n</ul>\n");}]);
(function () {
    'use strict';
    angular.module('zenubu.ngStrap.modal', ['mgcrea.ngStrap.modal', 'ngSanitize'])

        .config(["$modalProvider", function ($modalProvider) {
            angular.extend($modalProvider.defaults, {
                html: true
            });
        }])
        .config(["$provide", function ($provide) {

            // Use decorator to add new functionality
            $provide.decorator('$modal', ["$controller", "$delegate", "$injector", "$q", "$rootScope", function ($controller, $delegate, $injector, $q, $rootScope) {

                // Add new open() method

                var defer;

                function monkeyPatch(config) {

                    defer = $q.defer();

                    var $modal = $delegate(config);

                    $modal.dismiss = function (reason) {
                        defer.reject(reason);
                    };

                    var originalHide = $modal.hide;

                    $modal.hide = function () {
                        originalHide();
                        $modal.destroy();
                    };

                    $modal.close = function (data) {
                        defer.resolve(data);
                    };

                    $modal.result = defer.promise
                        .then(function (data) {
                            $modal.hide();
                            return data;
                        }).catch(function (reason) {
                            $modal.hide();
                            return $q.reject(reason);
                        });

                    return $modal;

                }

                monkeyPatch.open = modalOpen;


                //////////

                /*
                 * $modal.open() function
                 *
                 * This function adds new options to `$modal()`.
                 *
                 * New options:
                 * - controller {String|Function} First param of $controller. For string, controllerAs syntax is supported.
                 * - controllerAs {String} The 'as X' part of controllerAs syntax.
                 * - resolve {Object} Like the resolve in ngRoute
                 *
                 * Notes:
                 * -- Use either `controller: myCtrl as vm` or `controllerAs: vm`. Don't use both.
                 * -- Not sure if ngAnnotate supports this. It should since it understands '$modal.open()' in UI Bootstrap
                 */
                function modalOpen(config) {
                    var ctrl, resolvePromises = [];
                    var allDone;
                    var options = _.omit(config, ['controller', 'controllerAs', 'resolve']); // Options to be passed to $modal()
                    var modalScope = options.scope || $rootScope;

                    // Resolve
                    if (config.resolve) {
                        resolvePromises = _
                            .map(config.resolve, function (resolveFunc) {
                                return $injector.invoke(resolveFunc);
                            });
                    }

                    // Setup controller
                    if (config.controller) {
                        allDone = $q.all(resolvePromises)
                            .then(function (resolves) {
                                var locals = {};

                                // Assign resolves
                                var iter = 0;
                                _.forEach(config.resolve, function (resolveFunc, name) {
                                    locals[name] = resolves[iter++];
                                });

                                // Create new scope
                                modalScope = modalScope.$new();

                                locals.$scope = modalScope;

                                locals.$modalInstance = {};

                                locals.$modalInstance.dismiss = function (reason) {
                                    defer.reject(reason);
                                };
                                locals.$modalInstance.close = function (reason) {
                                    defer.resolve(reason);
                                };

                                // Instantiate controller
                                ctrl = $controller(config.controller, locals);

                                if (config.controllerAs) {
                                    modalScope[config.controllerAs] = ctrl;
                                }
                            });
                    }

                    return allDone.then(function () {
                        // Prepare final options
                        _.assign(options, {
                            scope: modalScope
                        });

                        return monkeyPatch(options);
                    });


                }

                return monkeyPatch;

            }]);
        }]);
})();
(function () {
    'use strict';
    angular.module('zenubu.ngStrap.dropdown', [
        'mgcrea.ngStrap.dropdown',
        'ngSanitize'
    ])
        .config(["$dropdownProvider", function ($dropdownProvider) {
            angular.extend($dropdownProvider.defaults, {
                html: true,
                placement: 'bottom',
                template: 'zenubu.ngStrap/dropdown/dropdown.tpl.html'
            });
        }])
        .controller('DropdownCtrl', DropdownCtrl)
        .config(monkeyPatchDropdownDirective)
        .directive('compile', compileDirective)
        .config(monkeyPatchDropdownProvider);

    function compileDirective($compile) {
        return function (scope, element, attrs) {
            scope.$watch(
                function (scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function (value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            );
        };
    }
    compileDirective.$inject = ["$compile"];

    function monkeyPatchDropdownDirective($provide) {
        $provide.decorator('bsDropdownDirective', ["$delegate", function ($delegate) {
            var directive = $delegate[0];

            var originalLink = directive.link;

            var linkFn = function postLink(scope, element, attr, transclusion) {
                originalLink(scope, element, attr, transclusion);
                scope.$watchCollection(attr.bsModel, function (newValue) {
                    scope.bsModel = newValue;
                }, true);
            };

            directive.compile = function () {

                return linkFn;
            };


            return $delegate;
        }]);
    }
    monkeyPatchDropdownDirective.$inject = ["$provide"];

    function monkeyPatchDropdownProvider($provide) {
        $provide.decorator('$dropdown', ["$delegate", function ($delegate) {

            $dropdownProvider.defaults = $delegate.defaults;

            function $dropdownProvider(element, options) {
                var $dropdown = $delegate(element, options);

                var originalPlacement = $dropdown.$applyPlacement;

                $dropdown.$applyPlacement = function () {
                    originalPlacement();
                    angular.element($dropdown.$element[0]).css({
                        left: 'auto'
                    });
                };

                return $dropdown;
            }

            return $dropdownProvider;

        }]);
    }
    monkeyPatchDropdownProvider.$inject = ["$provide"];

    function DropdownCtrl($scope) {

        var vm = this;

        vm.model = $scope.bsModel;

        vm.execute = execute;
        vm.hide = hide;
        vm.show = show;

        function execute(configObject) {
            if (typeof configObject.click === 'function') {
                configObject.click(vm.model, configObject.field);
            }
        }

        function hide(configObject) {
            if (typeof configObject.hide === 'function') {
                return configObject.hide(vm.model, configObject.field);
            }
            if (configObject.hasOwnProperty('hide')) {
                return vm.model[configObject.field] === configObject.hide;
            }
            return false;
        }

        function show(configObject) {
            if (typeof configObject.show === 'function') {
                return configObject.show(vm.model, configObject.field);
            }
            if (configObject.hasOwnProperty('show')) {
                return vm.model[configObject.show] === configObject.show;
            }
            return true;
        }

    }
    DropdownCtrl.$inject = ["$scope"];

})();
(function () {
    'use strict';
    angular.module('zenubu.ngStrap.datepicker', [
        'mgcrea.ngStrap.datepicker',
        'mgcrea.ngStrap.helpers.dateFormatter'
    ])
        .config(monkeyPatchDateFormatterProvider)
        .config(monkeyPatchDatePickerProvider)
        .config(configureDatepicker);

    function configureDatepicker($datepickerProvider) {
        angular.extend($datepickerProvider.defaults, {
            iconLeft: 'fa fa-fw fa-chevron-left',
            iconRight: 'fa fa-fw fa-chevron-right',
            //TODO: USE AS SOON AS THE ANGULAR_STRAP ISSUE IS FIXED
            //https://github.com/mgcrea/angular-strap/issues/1129
            //template: '/components/zenubu.ngStrap/datepicker/datepicker.tpl.html',
            container: 'self'
        });
        angular.extend($datepickerProvider.defaults, getDateFormats());
    }
    configureDatepicker.$inject = ["$datepickerProvider"];


    function monkeyPatchDatePickerProvider($provide) {
        $provide.decorator('$datepicker', ["$delegate", function ($delegate) {

            $datepickerProvider.defaults = $delegate.defaults;

            function $datepickerProvider(element, controller, config) {
                var $datepicker = $delegate(element, controller, config);

                var originalPlacement = $datepicker.$applyPlacement;

                $datepicker.$applyPlacement = function () {
                    originalPlacement();
                    angular.element($datepicker.$element[0]).css({
                        left: '0',
                        top: '0'
                    });
                };

                return $datepicker;
            }

            return $datepickerProvider;

        }]);
    }
    monkeyPatchDatePickerProvider.$inject = ["$provide"];

    function monkeyPatchDateFormatterProvider($provide) {
        $provide.decorator('$dateFormatter', ["$delegate", function ($delegate) {

            var $dateFormatter = $delegate;

            $dateFormatter.getDefaultLocale = function () {
                return moment.locale();
            };

            $dateFormatter.weekdaysShort = function () {
                return moment.weekdaysShort();
            };

            var oldFormatDate = $dateFormatter.formatDate;
            $dateFormatter.formatDate = function (date, format, lang) {
                if (_.contains(getDateFormats(), format)) {
                    return moment(date.toISOString()).format(format);
                }
                return oldFormatDate(date, format, lang);
            };

            return $dateFormatter;


        }]);
    }
    monkeyPatchDateFormatterProvider.$inject = ["$provide"];


    function getDateFormats() {
        return {
            dayFormat: 'DD',
            monthTitleFormat: 'MMMM YYYY',
            monthFormat: 'MMM',
            yearFormat: 'YYYY',
            yearTitleFormat: 'YYYY'
        };
    }

})();