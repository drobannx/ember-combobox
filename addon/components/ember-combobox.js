import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'ember-combobox',

    attributeBindings: [
        'is-open'
    ],

    inputValue: '',

    dataSource: [],

    /**
     * Two-way bound property representing the current value.
     *
     * @property value
     * @public
     */

    value: null,

    /**
     * Becomes the placeholder of the input
     *
     * @property placeholder
     * @public
     */

    placeholder: null,

    /**
     * Attribute binding to allow styling of the component when it is open or
     * not.
     *
     * @property is-open
     * @readonly
     */

    'is-open': function() {
        return this.get('isOpen') ? 'true' : null;
    }.property('isOpen'),

    /**
     * Determines whether or not the list is open.
     *
     * @property isOpen
     * @readonly
     */

    isOpen: false,

    /**
     * Adds the cache to track all options in the list to facilitate option
     * focus, blur, and navigation, etc.
     *
     * @method createOptions
     * @private
     */

    createOptions: function() {
        this.set('options', Ember.ArrayProxy.create({content: []}));
        this.optionsMap = {};
    }.on('init'),

    /**
     * Opens the list.
     *
     * @method open
     * @public
     */

    open: function() {
        if (this.get('isOpen')) return;
        this.set('isOpen', true);
    },

    /**
     * Occasionally we want to focus the input without triggering the list to open,
     * when this is true, the focus handler will be ignored.
     *
     * @property ignoreInputFocus
     * @private
     */

    ignoreInputFocus: false,

    /**
     * Closes the popover.
     *
     * @method close
     * @public
     */

    close: function() {
        if (!this.get('isOpen')) return;
        this.set('isOpen', false);
        var focusedOption = this.get('focusedOption');
        if (focusedOption) {
            focusedOption.blur();
            // so that keyboard starts at the right place on "down" or "up"
            this.set('focusedOption', this.get('selected'));
        }
        // if the active element is an element in the component, then we want to
        // focus the input and prevent the focus from opening it again
        if (this.get('element').contains(document.activeElement)) {
            this.set('ignoreInputFocus', true);
            Ember.run.later(this, 'set', 'ignoreInputFocus', false, 0);
            this.get('input').focus();
        }
    },

    /**
     * Selects an option.
     *
     * @method selectOption
     * @param option comboboxOptionComponent
     * @param options Object -
     * `selectOption` do less, and have the call sites do the other operations
     * (like focusing the input, etc).
     *   @property close Boolean - Defaults true; if false, the menu will not
     *   close after the option is selected.
     *   @property focus Boolean - Defaults true; if false, the input will not
     *   get focus.
     *   @property focusOption Boolean - Defaults true; if false, the option will
     *   not get focus.
     * @private
     */

    selectOption: function(option, options) {
        options = options || {};
        var selected = this.get('selected');
        if (selected) selected.deselect();
        this.set('selected', option);
        this.set('inputValue', this.get('selected.item.' + this.get('selectedValuePath')));
        option.select();
        this.focusOption(option, {focusElement: options.focusOption});
        if (options.focus !== false) {
            this.get('input').focus();
        }
        if (options.close !== false) {
            this.close();
        }
        this.sendAction('on-select', option.get('item.' + this.get('optionValuePath')), option);
    },

    /**
     * Handle case where apps reset the list on select, you get new options
     * all registering and therefore an infinite loop of selecting the option
     * whose value matches the current value
     *
     * @method selectOptionWithoutPotentialRecursion
     * @private
     */

    selectOptionWithoutPotentialRecursion: function(option) {
        this.set('selected', option);
        option.select();
        this.focusOption(option, {focus: false});
    },

    setInitialInputValue: function() {
        var val = this.get('value');

        if(val) {
            this.set('inputValue', val);
        }
    }.on('didInsertElement'),

    /**
     * @method setValueFromSelected
     * @private
     */

    setValueFromSelected: function() {
        this.set('value', this.get('selected.item.' + this.get('optionValuePath')));
    }.observes('selected'),

    /**
     * Adds an option to the options cache, selects it if the value matches.
     *
     * @method registerOption
     * @private
     */

    registerOption: function(option) {
        var optionValuePath = 'item.' + this.get('optionValuePath');
        this.get('options').pushObject(option);
        this.optionsMap[Ember.get(option, optionValuePath)] = option;
        if (this.get('value') === Ember.get(option, optionValuePath)) {
            if (this.get('selected')) {
                // When a new option shows up with matching attributes as the selected
                // option, select this new one instead but don't explode...
                this.selectOptionWithoutPotentialRecursion(option);
            } else {
                // When an option shows up with a matching value, select it but don't
                // focus because we don't want to steal focus from the rest of the
                // page, the user isn't actually interacting with the component.
                this.selectOption(option, {focus: false});
            }
        }
    },

    /**
     * Removes an option from the options cache.
     *
     * @method removeOption
     * @private
     */

    removeOption: function(optionComponent) {
        if (this.get('focusedOption') === optionComponent) {
            this.set('focusedOption', null);
        }
        this.get('options').removeObject(optionComponent);
    },

    /**
     * Flow control for handling keydown.
     *
     * @property keydownMap
     * @private
     */

    keydownMap: {
        27/*esc*/:   'close',
        32/*space*/: 'maybeSelectFocusedOption',
        13/*enter*/: 'maybeSelectOnEnter',
        40/*down*/:  'focusNext',
        38/*up*/:    'focusPrevious',
        8/*backspace*/: 'startBackspacing'
    },

    /**
     * Handles keyboard interactions from all elements in the component.
     *
     * @method handleKeydown
     * @private
     */

    handleKeydown: function(event) {
        var map = this.get('keydownMap');
        var method = map[event.keyCode];
        if (this[method]) {
            return this[method](event);
        }
        var input = this.get('input');
        // After this we focus the input, but if they are using shift, we don't
        // want to actually do it (they are probably shift+tabbing away). This is a
        // blacklist of one, which makes me really nervous. We want to allow any
        // valid input character, but that's a huge whitelist, or maybe use the
        // run loop and wait for focus to settle on the new element and then decide
        // what to do.
        if (event.shiftKey) {
            return;
        }
        if (document.activeElement !== input) {
            input.focus();
        }
    }.on('keyDown'),

    /**
     * Observes the input's value and does a bunch of stuff... including sending
     * the `on-input` action.
     *
     * @method onInput
     * @private
     */

    onInput: function() {
        this.sendAction('valueChanged', this.get('inputValue'), this.get('selected.item'));
    }.observes('inputValue'),

    /**
     * Focuses the next option in the list.
     *
     * @method focusNext
     * @private
     */

    focusNext: function(event) {
        event.preventDefault();
        var index = 0;
        var focusedOption = this.get('focusedOption');
        if (focusedOption) {
            index = this.get('options').indexOf(focusedOption);
            if (this.get('isOpen')) {
                index = index + 1;
            }
        }
        this.focusOptionAtIndex(index);
    },

    /**
     * Focuses the previous option in the popover.
     *
     * @method focusPrevious
     * @private
     */

    focusPrevious: function(event) {
        event.preventDefault();
        var focusedOption = this.get('focusedOption');
        if (!focusedOption) return;
        var index = this.get('options').indexOf(focusedOption);
        if (this.get('isOpen')) {
            index = index - 1;
        }
        this.focusOptionAtIndex(index);
    },

    /**
     * Focuses an option given an index in the options cache.
     *
     * @method focusOptionAtIndex
     * @private
     */

    focusOptionAtIndex: function(index) {
        var options = this.get('options');
        // loop it when at the ends
        if (index === -1) {
            index = options.get('length') - 1;
        } else if (index === options.get('length')) {
            index = 0;
        }
        var option = this.get('options').objectAt(index);
        if (!option) return;
        this.focusOption(option);
    },

    /**
     * Sets the option as the `focusedOption`
     *
     * @method focusOption
     * @private
     */

    focusOption: function(option, options) {
        options = options || {};
        var focusedOption = this.get('focusedOption');
        if (focusedOption) {
            focusedOption.blur();
        }
        this.set('focusedOption', option);
        if (options.focus !== false) {
            option.focus(options);
        }
    },

    /**
     * Selects the focused item if there is one.
     *
     * @method maybeSelectFocusedOption
     * @private
     */

    maybeSelectFocusedOption: function() {
        var focused = this.get('focusedOption');
        if (focused) {
            this.selectOption(focused);
            return true;
        }
        return false;
    },

    /**
     * Selects the focused option when the user hits enter on
     * the keyboard. This is nice because then it selects all the text so they
     * can start typing again without having to delete everything first.
     *
     * @method maybeSelectOnEnter
     * @private
     */

    maybeSelectOnEnter: function(event) {
        event.preventDefault();
        this.maybeSelectFocusedOption();
    },

    /**
     * @method registerInput
     * @private
     */

    registerInput: function(input) {
        this.set('input', input);
    },

    /**
     * @method registerList
     * @private
     */

    registerList: function(list) {
        this.set('list', list);
    },

    /**
     * @method toggleVisibility
     * @public
     */

    toggleVisibility: function() {
        if (this.get('isOpen')) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Closes the list when focus moves away from the component.
     *
     * @method closeOnFocusOut
     * @private
     */

    closeOnFocusOut: function() {
        // later for document.activeElement to be correct
        Ember.run.later(this, function() {
            var element = this.get('element');
            if (element && !element.contains(document.activeElement)) {
                this.close();
            }
        }, 0);
    }.on('focusOut'),

    attemptBindOption: function() {
        if(!this.get('isOpen')) {
            var _this = this,
                data = this.get('options.content'),
                currentValue = this.get('inputValue'),
                option = data.filter(function(item) {
                    return item.get('item')[_this.get('selectedValuePath')] === currentValue;
                });

            if(option.length === 1) {
                this.selectOption(option[0]);
            }
        }
    },

    /**
     * Observes the `value` property and selects the option with a matching value
     * if there is one.
     *
     * @method bindValue
     * @private
     */

    bindValue: function() {
        var selected = this.get('selected');
        var value = this.get('value');
        // don't do the work if we know nothing is going to match.
        if (!selected && (value == null || value === '')) {
            return;
        }
        // if it already matches, don't do any work
        if (selected && value === selected.get('item.' + this.get('optionValuePath'))) {
            return;
        }
        var option = this.optionsMap[value];
        if (option) {
            Ember.run(this, 'selectOption', option);
        }
    }.observes('value')

});
