# ember-cli-combobox

A simple ember-cli combo box. Inspired by and modified from https://github.com/instructure/ic-autocomplete/

## Installation

`ember install:addon ember-cli-combobox`

## Use

```hbs
{{ember-combobox dataSource=rates
                  value=currentRate
                  valueChanged="rateChanged"
                  on-select="selectState"
                  optionValuePath="id"
                  optionLabelPath="name"
                  selectedValuePath="id"
                  placeholder="Pick a rate"}}
```

### Attributes

* `dataSource`: This is an array of objects that pre-populates the dropdown for the combobox.
* `value`: This is used if you have a current value that you would like to bind to the free-form textbox.
* `valueChanged`: This is an action that can be specified on your controller to handle when a user changes the value in the textbox manually.
* `on-select`: This is another action that fires when a user selects an option in the dropdown
* `optionValuePath`: This is the property path on each individual object in the dataSource array.
* `optionLabelPath`: This is the property path that is used to display a value in the dropdown.
* `selectedValuePath`: This is the property path that gets displayed in the textbox.
* `placeholder`: Placeholder text to be displayed in the text box.

## Additional info

This is a WIP attempt at a combo box. Feel free to issue pull requests for updates.
