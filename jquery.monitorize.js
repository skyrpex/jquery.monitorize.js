/**
* jquery.monitorize.js v1.3
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
            options = $.extend({

                    frequency: 3500,

                    onValueChanged: $.noop,

                    triggerKeyCodes: [
                        188, // Comma
                        190, // Dot
                    ],

                    pasteTriggers: true,

                    emptyValueTriggers: true

                }, options || {}),

                self = this;

            return this.each(function () {

                // Setup options and private data
                self.data('monitorize', {

                    options: options,

                    _data: {

                        isValueDirty: $(this).val(),

                        lastValue: null,

                        timer: null

                    }

                });

                // Bind keyup event
                $(this).on('keyup', methods._onKeyUp);

                // Bind paste event
                $(this).on('paste', methods._onPaste);

                // Bind change event
                $(this).on('change', methods._onChange);

                // Start timer
                methods._restartTimer.call(this);

            });

        },

        destroy: function () {

            // Clear timer
            methods._clearTimer.call(this);

            // Unbind keyup event
            $(this).unbind('keyup', methods._onKeyUp);

            // Unbind paste event
            $(this).unbind('paste', methods._onPaste);

            // Unbind change event
            $(this).unbind('change', methods._onChange);

            // Remove monitorize data
            $(this).data('monitorize', null);

        },

        _onKeyUp: function (e) {

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

        },

        _onPaste: function () {

            // Mark value as dirty
            var data = $(this).data('monitorize')._data,

                options = $(this).data('monitorize').options;

            data.isValueDirty = true;

            // Don't call callback (value isn't accessible yet)
            if (options.pasteTriggers) {

                setTimeout(function () {

                    methods._maybeCallCallback.call(self);

                }, 0);

            }

        },

        _onChange: function () {

            // Mark value as dirty
            var data = $(this).data('monitorize')._data;

            data.isValueDirty = true;

            // Maybe call callback
            methods._maybeCallCallback.call(this);

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
            if (!options.emptyValueTriggers && !value) {

                return;

            }

            // Reset the timer
            methods._restartTimer.call(this);

            // Update last value
            data.lastValue = value;

            // Value is not dirty anymore
            data.isValueDirty = false;

            // Call onValueChanged
            try {
                options.onValueChanged(value);
            } catch (error) {
                // $.error('Error catched in onValueChanged (' +  error + ')');
            }

        },
        
        _clearTimer: function () {
            
            var self = this,

                data = $(this).data('monitorize')._data;
            
            if (data.timer) {

                clearInterval(data.timer);

            }
            
        },

        _restartTimer: function () {

            var self = this,

                data = $(this).data('monitorize')._data,

                options = $(this).data('monitorize').options;

            methods._clearTimer.call(this);

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