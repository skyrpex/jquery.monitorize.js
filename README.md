#jquery.monitorize.js

Monitorize input element changes by time and key triggers

## API

### init

```
$('input').monitorize({/* options */});
// or...
$('input').monitorize('init', {/* options */});
```

Initializes the monitorize plugin on the given jQuery objects.

The default options are:

```
$('input').monitorize({
	// Function that will be called when the input changes
    onValueChanged: $.noop,
	// Time frequency for checking input changes
	frequency: 3500,
    // Key codes that instantly trigger onValueChanged
    triggerKeyCodes: [
        188, // Comma
        190, // Dot
    ],
    // Specify if pasting into the input triggers onValueChanged
    pasteTriggers: true,
    // Specify if emptying the input value will trigger onValueChanged
    emptyValueTriggers: true
});
```

### destroy

```
$('input').monitorize('destroy');
```

Destroys all the data related to the plugin (internal data, intervals and event bindings).

You must call this function if the input element is going to be erased.
