import Ember from 'ember';

export default Ember.Controller.extend({
    actions: {
        rateChanged: function(value, option) {
            console.log("Value changed to: " + value);
        },
        selectState: function(value, option) {
            console.log("selected: " + value);
        }
    },
    currentRate: '10.0',
    rates: [
        {
            name: 'Rate 1',
            id: '8.0'
        },
        {
            name: 'Rate 2',
            id: '10.0'
        },
        {
            name: 'Rate 3',
            id: '20.0'
        },
        {
            name: 'Rate 4',
            id: '25.0'
        }
    ]
})
