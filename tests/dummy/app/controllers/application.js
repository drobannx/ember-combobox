import Ember from 'ember';

export default Ember.Controller.extend({
    actions: {
        filterStates: function(autocomplete, term) {
            this.set('filteredStates', this.filterStatesBy(term));
        },
        selectState: function() {
            console.log("selected an item");
        }
    },
    states: [
        {
            name: 'Utah',
            id: 'UT'
        },
        {
            name: 'Illinois',
            id: 'IL'
        }
    ],
    filterStatesBy: function(term) {
        term = this.get('stateFilterTerm');
        if(term === '') return this.get('states');
        var filter = new RegExp('^'+term, 'i');
        return this.get('states').filter(function(state) {
            return filter.test(state.name) || filter.test(state.id);
        });
    }
});
