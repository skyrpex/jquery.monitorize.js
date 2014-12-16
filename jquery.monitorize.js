/**
* jquery.monitorize.js v1.4
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

    var defaultOptions = {
        frequency: 3500,

        onValueChanged: $.noop,

        triggerKeyCodes: [
            188, // Comma
            190  // Dot
        ],

        pasteTriggers: true,

        emptyValueTriggers: true,

        triggerOnInit: true,

        monitorizeAsGroup: false

    };

    var methods = {

        init: function (options) {

            // Options
            options = $.extend(defaultOptions, options || {});

            var self = this;

            var groupMonitor = null;

            if (options.monitorizeAsGroup) {

                groupMonitor = {

                    timer: null,

                    isValueDirty: false,

                    lastInputChanged: null

                };

            }

            var monitorizedGroup = this.each(function () {

                // Setup options and private data
                $(this).data('monitorize', {

                    options: options,

                    _data: {

                        lastValue: null,

                        // If we are monitoring a group, use a common object,
                        //  otherwise use a particular object for each element
                        group: groupMonitor || {

                            timer: null,

                            isValueDirty: $(this).val() && options.triggerOnInit,

                            lastInputChanged: $(this)

                        }

                    }

                });

                // Put the group's dirty flag to true if any element is dirty at the beginning
                //  and we want previous changes to trigger.
                if (options.monitorizeAsGroup && $(this).val() && options.triggerOnInit) {

                    var data = $(this).data('monitorize')._data.group;

                    data.isValueDirty = true;

                    data.lastInputChanged = $(this);

                }

                // Bind keyup event
                $(this).on('keyup', methods._onKeyUp);

                // Bind paste event
                $(this).on('paste', methods._onPaste);

                // Bind change event
                $(this).on('change', methods._onChange);

            });

            // Skip if empty list
            if (monitorizedGroup.length == 0) {

                return monitorizedGroup;

            }

            // Start timer
            methods._restartTimer.call(this);

            return monitorizedGroup;

        },

        destroy: function () {

            // Clear timer
            methods._clearTimer.call(this);

            // Unbind keyup event
            this.unbind('keyup', methods._onKeyUp);

            // Unbind paste event
            this.unbind('paste', methods._onPaste);

            // Unbind change event
            this.unbind('change', methods._onChange);

            // Remove monitorize data
            this.data('monitorize', null);

            // Return the object for chaining purposes
            return this;

        },

        _onKeyUp: function (e) {

            var data = $(this).data('monitorize')._data;

            var options = $(this).data('monitorize').options;

            // Mark value as dirty
            data.group.isValueDirty = true;

            // Update last input changed
            data.group.lastInputChanged = $(this);

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
            var data = $(this).data('monitorize')._data;

            var options = $(this).data('monitorize').options;

            var self = this;

            data.group.isValueDirty = true;

            // Update last input changed
            data.group.lastInputChanged = $(this);

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

            data.group.isValueDirty = true;

            // Update last input changed
            data.group.lastInputChanged = $(this);

            // Maybe call callback
            methods._maybeCallCallback.call(this);

        },

        _maybeCallCallback: function () {

            // Initialize vars
            var monitorizeData = $(this).data('monitorize');

            // Stop monitorize if element has no data or has disappeared
            if (typeof monitorizeData == 'object' && monitorizeData != null) {

                var data = monitorizeData._data;

                var options = $(this).data('monitorize').options;

                var skip = false;

                // Skip if no input has changed
                if (!data.group.lastInputChanged) {

                    skip = true;

                }

                if (!skip) {

                    // Get last input changed and trim its value
                    var element = data.group.lastInputChanged;

                    var value = $.trim(element.val());

                    // Get data from last input changed
                    data = element.data('monitorize')._data;

                    // Skip if value didn't change
                    if (!data.group.isValueDirty || value === data.lastValue) {

                        skip = true;

                    }

                    // Skip if empty value
                    if (!options.emptyValueTriggers && !value) {

                        skip = true;

                    }

                }

                // Reset the timer
                methods._restartTimer.call(this);

                if (!skip) {

                    // Update last value
                    data.lastValue = value;

                    // Value is not dirty anymore
                    data.group.isValueDirty = false;

                    // Call onValueChanged
                    try {
                        options.onValueChanged(value, element);
                    } catch (error) {
                        $.error('Error catched in onValueChanged (' +  error + ')');
                    }

                }

            }

            else {

                methods.destroy.call(this);

            }

        },
        
        _clearTimer: function () {
            
            var self = this;

            var data = $(this).data('monitorize')._data;
            
            if (data.group.timer) {

                clearTimeout(data.group.timer);

            }
            
        },

        _restartTimer: function () {

            var self = this;

            var data = $(this).data('monitorize')._data;

            var options = $(this).data('monitorize').options;

            methods._clearTimer.call(this);

            if (options.frequency) {

                data.group.timer = setTimeout(function () {

                    methods._maybeCallCallback.call(self);

                }, options.frequency);

            }

        },

        isMonitored: function () {

            return typeof $(this).data('monitorize') !== 'undefined';

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
