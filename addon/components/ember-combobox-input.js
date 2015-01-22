import Ember from 'ember';

var alias = Ember.computed.alias;

export default Ember.TextField.extend({

    /**
     * Using a className since we can't extend HTMLInputElement :(
     */

    classNames: 'ember-combobox-input',

    attributeBindings: [
        'aria-activedescendant',
        'aria-autocomplete',
        'aria-owns',
        'role'
    ],

    /**
     * Tells screenreaders how to deal with this element.
     * http://www.w3.org/TR/wai-aria-practices/#combobox
     * http://www.w3.org/TR/wai-aria/roles#combobox
     *
     * @property role
     * @private
     */

    role: 'combobox',

    /**
     * Tells screenreaders that the element uses a list as well as inline auto
     * completion (updates text field, selects autocompleted portion).
     *
     * @property aria-autocomplete
     * @private
     */

    'aria-autocomplete': 'both',


    /**
     * Convenience reference to the combobox component.
     *
     * @property combobox
     * @private
     */

    combobox: alias('parentView'),

    /**
     * Tells the screenreader the list that this input owns.
     *
     * @property aria-owns
     * @private
     */

    'aria-owns': alias('parentView.list.elementId'),

    /**
     * Tells the screenreader which element is active in the list.
     *
     * @property aria-activedescendant
     * @private
     */

    'aria-activedescendant': alias('parentView.selected.elementId'),

    /**
     * @method registerWithParent
     * @private
     */

    registerWithParent: function() {
        this.get('parentView').registerInput(this);
    }.on('didInsertElement'),

    focus: function() {
        this.$().focus();
    },

    /**
     * When focus is moved from the list to the input, close the list.
     *
     * @method closeOnFocus
     * @private
     */

    closeOnFocus: function() {
        var combobox = this.get('combobox');
        if (combobox.get('ignoreInputFocus')) {
            return;
        }
        combobox.close();
    }.on('focusIn'),

    blur: function() {
        var combobox = this.get('combobox');
        combobox.attemptBindOption();
    }.on('focusOut')

});
