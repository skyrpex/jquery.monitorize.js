/**
* jquery.monitorize.js v1.2
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

                    onValueChanged: null,

                    triggerKeyCodes: [
                        // 8,   // Backspace
                        // 32,  // Space
                        188, // Comma
                        190, // Dot
                        // 49,
                        // 56,
                        // 219,
                        // 188,
                        // 190,
                        // 191,
                        // 221,
                        // 222
                    ],

                    skipEmptyValue: true

                }, options),

                self = this;

            return this.each(function () {

                // Setup options and private data
                self.data('monitorize', {

                    options: o,

                    _data: {

                        isValueDirty: $(this).val(),

                        lastValue: null,

                        timer: null

                    }

                });

                // Bind keyup event
                $(this).keyup(function (e) {

                    var data = $(this).data('monitorize')._data,

                        options = $(this).data('monitorize').options;

                    // Mark value as dirty
                    data.isValueDirty = true;

                    // Skip if didn't pressed a triggering key code
                    if (options.triggerKeyCodes
                            && options.triggerKeyCodes.length > 0
                            && $.inArray(e.keyCode, options.triggerKeyCodes) === -1) {

                        return;

                    }

                    // Maybe call callback
                    methods._maybeCallCallback.call(this);

                });

                // Bind paste event
                $(this).bind('paste', function () {

                    // Mark value as dirty
                    var data = $(this).data('monitorize')._data;

                    data.isValueDirty = true;

                    // Don't call callback: value isn't accessible yet
                    // methods._maybeCallCallback.call(this);

                });

                // Bind change event
                $(this).change(function () {

                    // Mark value as dirty
                    var data = $(this).data('monitorize')._data;

                    data.isValueDirty = true;

                    // Maybe call callback
                    methods._maybeCallCallback.call(this);

                });

                // Start timer
                methods._restartTimer.call(this);

            });

        },

        _maybeCallCallback: function () {

            // Trim value
            var value = $.trim($(this).val()),

                data = $(this).data('monitorize')._data,

                options = $(this).data('monitorize').options;

            // Skip if value didn't changed
            if (!data.isValueDirty || value === data.lastValue) {

                return;

            }

            // Skip if empty value
            if (options.skipEmptyValue && !value) {

                return;

            }

            // Reset the timer
            methods._restartTimer.call(this);

            // Update last value
            data.lastValue = value;

            // Value is not dirty anymore
            data.isValueDirty = false;

            // Call onValueChanged
            options.onValueChanged(value);

        },

        _restartTimer: function () {

            var self = this,

                data = $(this).data('monitorize')._data,

                options = $(this).data('monitorize').options;


            if (data.timer) {

                clearInterval(data.timer);

            }

            if (options.frequency) {

                data.timer = setInterval(function () {

                    methods._maybeCallCallback.call(self);

                }, options.frequency);

            }

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
