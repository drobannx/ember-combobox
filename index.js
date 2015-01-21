/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-combobox',
  included: function(app) {
      this._super.included(app);

      app.import('vendor/ember-combobox/ember-combobox.css');
  }
};
