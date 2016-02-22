/************************************************************************************
 * ui.js DEFINES UI DIRECTIVES THAT CAN BE USED TO MODIFY OR ANIMATE HTML ELEMENTS
 ************************************************************************************/

nibbl

    /********************************************************************************
     * Directive that modifies the input HTML field and adds styling to it:
     * Adds blue animated border and remove with condition when focus and blur
     ********************************************************************************/
    .directive('fgLine', function(){
        return {
            restrict: 'C',
            link: function(scope, element) {
                if($('.fg-line')[0]) {
                    $('body').on('focus', '.form-control', function(){
                        $(this).closest('.fg-line').addClass('fg-toggled');
                    })

                    $('body').on('blur', '.form-control', function(){
                        var p = $(this).closest('.form-group');
                        var i = p.find('.form-control').val();

                        if (p.hasClass('fg-float')) {
                            if (i.length == 0) {
                                $(this).closest('.fg-line').removeClass('fg-toggled');
                            }
                        }
                        else {
                            $(this).closest('.fg-line').removeClass('fg-toggled');
                        }
                    });
                }

            }
        }

    })

    /********************************************************************************
     * MALIHU SCROLL - on custom classes
     * @source: http://manos.malihu.gr/jquery-custom-content-scroller/
     ********************************************************************************/
    .directive('cOverflow', ['scrollService', function(scrollService){
        return {
            restrict: 'C',
            link: function(scope, element) {

                if (!$('html').hasClass('ismobile')) {
                    scrollService.malihuScroll(element, 'minimal-dark', 'y');
                }
            }
        }
    }])

    /********************************************************************************
     * SWEETALERT MESSAGE TEMPLATE DIRECTIVE
     * --> full JS library can be found under vendors/bower_components
     * @source: http://t4t5.github.io/sweetalert/
     ********************************************************************************/

    // basic sweetalert message directive
    .directive('swalBasic', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.click(function(){
                    swal("Here's a message!");
                });
            }
        }
    })


    /********************************************************************************
     * DIRECTIVE TO GIVE WAVES EFFECT TO BUTTONS
     * should be used on .btn classes --> will only work on hover
     ********************************************************************************/
    .directive('btn', function(){
        return {
            restrict: 'C',
            link: function(scope, element) {
                if(element.hasClass('btn-icon') || element.hasClass('btn-float')) {
                    Waves.attach(element, ['waves-circle']);
                }

                else if(element.hasClass('btn-light')) {
                    Waves.attach(element, ['waves-light']);
                }

                else {
                    Waves.attach(element);
                }

                Waves.init();
            }
        }
    })


    /********************************************************************************
     * AUTO SIZE TEXTAREA
     * Can be applied to textarea to autosize the area if the user input exceeds
     * the height of the element
     ********************************************************************************/
    .directive('autoSize', function(){
        return {
            restrict: 'A',
            link: function(scope, element){
                if (element[0]) {
                    autosize(element);
                }
            }
        }
    })


    /********************************************************************************
     * SELECT PICKER FROM BOOTSTRAP
     * Offers a directive for Bootstrap's select picker
     ********************************************************************************/
    .directive('selectPicker', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                //if (element[0]) {
                element.selectpicker();
                //}
            }
        }
    })


    /********************************************************************************
     * INPUT MASK
     ********************************************************************************/
    .directive('inputMask', function(){
        return {
            restrict: 'A',
            scope: {
                inputMask: '='
            },
            link: function(scope, element){
                element.mask(scope.inputMask.mask);
            }
        }
    })

    /********************************************************************************
     * COLOR PICKER THAT APPLIES FARBTASTIC TO ELEMENT
     * @source: https://acko.net/blog/farbtastic-jquery-color-picker-plug-in/
     ********************************************************************************/
    .directive('colordPicker', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).each(function(){
                    var colorOutput = $(this).closest('.cp-container').find('.cp-value');
                    $(this).farbtastic(colorOutput);
                });

            }
        }
    })


    /********************************************************************************
     * PLACEHOLDER FOR IE 9 (on .form-control class)
     ********************************************************************************/
    .directive('formControl', function(){
        return {
            restrict: 'C',
            link: function(scope, element, attrs) {
                if(angular.element('html').hasClass('ie9')) {
                    $('input, textarea').placeholder({
                        customClass: 'ie9-placeholder'
                    });
                }
            }

        }
    });
