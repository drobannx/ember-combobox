import Ember from 'ember';

var alias = Ember.computed.alias;

export default Ember.Component.extend({

    tagName: 'ember-combobox-option',

    attributeBindings: [
        'aria-label',
        'role',
        'selected',
        'tabindex'
    ],

    /**
     * Tells the screenreader how to deal with this element.
     * http://www.w3.org/TR/wai-aria/roles#option
     *
     * @property role
     * @private
     */

    role: 'option',

    /**
     * We do not want the options to be tabbable, but we do want to focus them.
     *
     * @property tabindex
     * @private
     */

    tabindex: -1,

    /**
     * Attribute binding to facilitate CSS on selected options.
     *
     * @property selected
     * @private
     */

    selected: function() {
        return this.get('isSelected') ? 'true' : null;
    }.property('isSelected'),

    /**
     * TODO: figure out if we actually need this property, I think its leftover
     * from and earlier implementation
     *
     * @property focused
     * @private
     */

    focused: false,


    /**
     * Convenience reference to the combobox component.
     *
     * @property combobox
     * @private
     */

    combobox: alias('parentView.parentView'),

    /**
     * Registers itself with the combobox component.
     *
     * @method registerWithCombobox
     * @private
     */

    registerWithCombobox: function() {
        this.get('combobox').registerOption(this);
    }.on('willInsertElement'),

    /**
     * Unregisters itself with the suggest component.
     *
     * @method unregisterWithCombobox
     * @private
     */

    unregisterWithCombobox: function() {
        this.get('combobox').removeOption(this);
    }.on('willDestroyElement'),

    /**
     * Selects this option on click.
     *
     * @method selectOnClick
     * @private
     */

    selectOnClick: function(event) {
        event.stopPropagation();
        this.get('combobox').selectOption(this);
    }.on('click'),

    /**
     * This is used to dynamically display the label in the dropdown option
     * based on criteria passed into the component
     */

    optionLabel: function() {
        return this.get('item.' + this.get('optionLabelPath'));
    }.property('optionLabelPath'),

    /**
     * Focuses this option.
     *
     * @method focus
     * @param options Object
     *   @property focusElement Boolean defaults true, if false, will not focus
     *   the dom element this is important for scenarios where we are closing the
     *   list but still need to track the focused option so keyboard navigation
     *   starts in the right place.
     * @private
     */

    focus: function(options) {
        options = options || {};
        this.set('focused', true);
        if (options.focusElement !== false) {
            var isClosed = !this.get('combobox.isOpen');
            var el = this.get('element');
            if (isClosed) {
                this.get('combobox').open();
                // can't focus an element that isn't visible
                Ember.run.scheduleOnce('afterRender', el, 'focus', 0);
            } else {
                el.focus();
            }
        }
    },

    /**
     * Blurs this option
     *
     * @method blur
     * @private
     */

    blur: function() {
        // TODO: if we don't care about focused, we don't need this method
        this.set('focused', false);
    },

    /**
     * @method focusOnMouseenter
     * @private
     */

    focusOnMouseenter: function() {
        // TODO: this makes mousing around a list with overflow kinda weird.  We do
        // it so that keyboard navigation works straight from the last hovered
        // element when users switch from mouse to keyboard.  I'm thinking of
        // tracking the last mouseEntered option instead of piggy backing with the
        // code that deals with focusing.
        this.get('combobox').focusOption(this);
    }.on('mouseEnter'),

    /**
     * @method deselect
     * @private
     */

    deselect: function() {
        this.set('isSelected', false);
    },

    /**
     * @method select
     * @private
     */

    select: function() {
        this.set('isSelected', true);
    }

});
