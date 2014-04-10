/**
* jquery.monitorize.js v1.1
* Monitorize input changes in a smart way
* https://github.com/skyrpex/jquery.monitorize.js
*
* Copyright 2014, Cristian Pallarés
* Released under the MIT license.
*/
(function (factory) {
if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module depending on jQuery.
    define(['jquery'], factory);
} else {
    // No AMD. Register plugin with global jQuery object.
    factory(jQuery);
}
}(function ($) {
    "use strict";

    var methods = {
        init: function (options) {
            // Options
            var o = $.extend({
                    frequency: 3500,
                    onQuestionAsked: null,
                    triggerKeyCodes: [
                        49,
                        56,
                        219,
                        188,
                        190,
                        191,
                        221,
                        222
                    ]
                }, options),
                self = this;

            return this.each(function () {
                // Setup options and private data
                self.data('monitorize', {
                    options: o,
                    _data: {
                        isQuestionDirty: $(this).val(),
                        lastQuestion: null,
                        timer: null
                    }
                });

                // Bind keyup event
                $(this).keyup(function (e) {
                    var data = $(this).data('monitorize')._data,
                        options = $(this).data('monitorize').options;

                    // Mark question as dirty
                    data.isQuestionDirty = true;

                    // Skip if didn't pressed a triggering key code
                    if ($.inArray(e.keyCode, options.triggerKeyCodes) === -1) {
                        return;
                    }

                    // Do ask
                    methods._ask.call(this);
                });

                // Bind paste event
                $(this).bind('paste', function () {
                    // Mark question as dirty
                    var data = $(this).data('monitorize')._data;
                    data.isQuestionDirty = true;

                    // Don't ask: value isn't accessible yet
                    // methods._ask.call(this);
                });

                // Bind change event
                $(this).change(function () {
                    // Mark question as dirty
                    var data = $(this).data('monitorize')._data;
                    data.isQuestionDirty = true;

                    // Do ask
                    methods._ask.call(this);
                });

                // Start timer
                methods._restartTimer.call(this);
            });
        },

        _ask: function () {
            // Trim question
            var question = $.trim($(this).val()),
                data = $(this).data('monitorize')._data,
                options = $(this).data('monitorize').options;

            // Skip if question didn't changed
            if (!data.isQuestionDirty || !question || question === data.lastQuestion) {
                return;
            }

            // Ask using the callback
            options.onQuestionAsked(question);

            // Reset the timer
            methods._restartTimer.call(this);

            // Update last question
            data.lastQuestion = question;

            // Question is not dirty anymore
            data.isQuestionDirty = false;
        },

        _restartTimer: function () {
            var self = this,
                data = $(this).data('monitorize')._data,
                options = $(this).data('monitorize').options;

            if (data.timer) {
                clearInterval(data.timer);
            }

            data.timer = setInterval(function () {
                methods._ask.call(self);
            }, options.frequency);
        }
    };
    
    $.fn.monitorize = function (method) {

        // Method calling logic
        if (methods[method] && method.charAt(0) !== '_') {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }

        if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }

        $.error('Method ' +  method + ' does not exist on jQuery.monitorize');

    };
}));
