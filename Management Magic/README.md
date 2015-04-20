Custom Dimension Management Magic
---------

###Working with Custom Dimensions in Google Sheets
The Google Analytics API can be accessed through Google Sheets to pull data directly into a spreadsheet, which is a common use case. This example walks through the steps necessary to pull custom dimension settings for your property into a Google Sheet, make edits, and update Google Analytics to reflect the settings in your sheet.

###Getting started
Because the process to publish add-ons to Google Sheets currently requires an application process, it is faster to deploy this tool by __adding the code to your sheet yourself__.

To do so, [create a script bound to your Google Sheet](https://developers.google.com/apps-script/guides/bound#creating_a_bound_script) and copy the apps script code from the [Custom Dimension Management Magic](https://github.com/narcan/tools/blob/master/Management%20Magic/Custom%20Dimension%20Management%20Magic.js) file in [this repository](https://github.com/narcan/tools/tree/master/Management%20Magic) into your script editor.

<!--- Add the Custom Dimension Management Magic Add-on to your Google Sheet and-->
Follow the steps below to set up your sheet:

1. Give a 1-cell range the name __propertyId__ and enter the id of the property you wish to manage into this cell ([learn more about naming cell ranges in Google Sheets](https://support.google.com/docs/answer/63175?hl=en))

2. Give the name __standardCDInfo__ to a range that will hold your custom dimensions data
  - the range should have __4 columns__ to hold custom dimension data: name, index, scope and status
  - non-premium properties should have __20 rows__ in the range
  - premium properties should have __200 rows__ in the range and should name it __premiumCDInfo__ instead

When you run the command to _List Custom Dimensions_ from the add-on menu, values from the property will populate your named range.

If you update any of these values, you can update the custom dimensions in your property by running the _Update Custom Dimensions_ function from the add-on menu.

###Recommendations
- It is recommended to make the column receiving the custom dimension index [non-editable](https://support.google.com/docs/answer/144687?hl=en). Changing these values may result in undesirable behavior.
- It is recommended to only allow the following values in the column receiving custom dimension scope: USER, SESSION, HIT, PRODUCT. Attempting to update custom dimensions with other values may result in undesirable behavior.
- It is recommended to only allow the boolean values (true or false) in the column receiving custom dimension activity status. Attempting to update custom dimensions with other values may result in undesirable behavior.