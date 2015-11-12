Custom Dimension Management Magic
---------

###Working with Custom Dimensions in Google Sheets
The Google Analytics API can be accessed through Google Sheets to pull data directly into a spreadsheet, which is a common use case. This application sets up a Google Sheets Add-on that can format a sheet and list dimensions from a property in a Google Sheet. It can then upload dimensions listed on a Google Sheet to one or more properties.

###Getting started
The code presented here can serve as a standalone add-on, or it can be pasted directly into the script editor of a Google Sheet for one-time use.

To do so, [create a script bound to your Google Sheet](https://developers.google.com/apps-script/guides/bound#creating_a_bound_script) and copy the apps script code from the [Custom Dimension Management Magic](hhttps://github.com/narcan/tools/blob/master/GA%20Management%20Magic/Dimensions/Custom%20Dimension%20Management.js) file in [this repository](https://github.com/narcan/tools/tree/master/GA%20Management%20Magic/Dimensions) into your script editor.

###Using the tool

####Listing Custom Dimensions

To list custom dimensions from a property, run the __List custom dimensions__ command from the add-on menu. Enter the property ID from which to list custom dimension settings into the prompt.

A new sheet will be added with the run time and property id. It will be formatted and populated with the values from the property. Additionally, it will populate dummy values into the sheet for any unused but available custom dimension slots in the property.

If you update any of these values, you can update the custom dimensions in your property by running the _Update custom dimensions_ function from the add-on menu.

__Note that any dummy values still in the sheet will be uploaded to the property. Additionally, it is recommended that you not update blank values into the property__ as it may result in undesireable behavior.

####Updating Custom Dimensions

To update custom dimension settings within a property or list of properties, run the __Update custom dimensions__ command from the add-on menu. Enter the property IDs (separated by commas) of the properties that should be updated with the custom dimension settings in your sheet.

If you have correctly named the range to contain the custom dimension settings (see below), the properties in the list will be updated with these values.

If you have not named the range(s) as described below, the script will format a new sheet for you into which you can enter your custom dimension settings.

####Formatting your own sheet

Give the name __standardCDInfo__ to a range that will hold your custom dimensions data ([learn more about naming cell ranges in Google Sheets](https://support.google.com/docs/answer/63175?hl=en)).
  - the range should have __4 columns__ to hold custom dimension data: name, index, scope and status
  - non-premium properties should have __20 rows__ in the range
  - premium properties should have __200 rows__ in the range and should name it __premiumCDInfo__ instead

#####Formatting Recommendations
- It is recommended to name both a standard and premium range, letting them overlap each other.
- It is recommended to make the column receiving the custom dimension index [non-editable](https://support.google.com/docs/answer/144687?hl=en). Changing these values may result in undesirable behavior.
- It is recommended to only allow the following values in the column receiving custom dimension scope: USER, SESSION, HIT, PRODUCT. Attempting to update custom dimensions with other values may result in undesirable behavior.
- It is recommended to only allow the boolean values (TRUE or FALSE) in the column receiving custom dimension activity status. Attempting to update custom dimensions with other values may result in undesirable behavior.
- It is recommended to only allow the boolean values (true or false) in the column receiving custom dimension activity status. Attempting to update custom dimensions with other values may result in undesirable behavior.
