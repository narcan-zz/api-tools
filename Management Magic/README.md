Custom Dimension Management Magic
---------

#Working with Custom Dimensions in Google Sheets
The Google Analytics API can be accessed through Google Sheets to pull data directly into a spreadsheet, which is a common use case. This example walks through the steps necessary to pull custom dimension settings for your property into a Google Sheet, make edits, and update Google Analytics to reflect the settings in your sheet.

##Getting started
Add the Custom Dimension Management Magic Add-on to your Google Sheet and follow the steps below to set up your sheet:
1. Name a 1-cell range __propertyId__ and enter the id of the property you wish to manage ([learn more about naming cell ranges in Google Sheets](https://support.google.com/docs/answer/63175?hl=en))
2. Name a range __standardCDInfo__ to will hold your custom dimensions data
  - the range should have 4 columns to hold custom dimension data: name, index, scope and status
  - non-premium properties should have 20 rows in the range
  - premium properties should have 200 rows in the range and name it __premiumCDInfo__ instead

When you run the command to _List Custom Dimensions_ from the add-on menu, values from the property will populate your named range.

If you update any of these values, you can update the custom dimensions in your property by running the _Update Custom Dimensions_ function from the add-on menu.

##Recommendations
- It is recommended to make the column receiving the custom dimension index a non-editable column. Changing these values may result in undesirable behavior.
- It is recommended to only allow the following values in the column receiving custom dimension scope: USER, SESSION, HIT, PRODUCT. Attempting to update custom dimensions with other values may result in undesirable behavior.
- It is recommended to only allow the boolean values (true or false) in the column receiving custom dimension activity status. Attempting to update custom dimensions with other values may result in undesirable behavior.