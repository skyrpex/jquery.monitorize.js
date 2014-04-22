((factory) ->
    if typeof define == 'function' && define.amd?
        define ['jquery'], factory
    else
        factory jQuery
) ($) ->
    "use strict"

    console.log $