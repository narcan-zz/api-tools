Custom Dimension Management
---------

###Working with Custom Dimensions in Google Sheets
The Google Analytics API can be accessed through a Google Sheet to list and update custom dimension information in a tabular format. This code walks through the steps necessary to pull custom dimension settings for a property into a Google Sheet, make edits, and update Google Analytics to reflect the settings in your sheet.

###Getting started
Because the process to publish add-ons to Google Sheets currently requires an application process, it is faster to deploy this tool by __adding the code to your sheet yourself__.

To do so, [create a script bound to your Google Sheet](https://developers.google.com/apps-script/guides/bound#creating_a_bound_script) and copy the apps script code from the [Custom Dimension Management Magic](https://github.com/narcan/tools/blob/master/Management%20Magic/Custom%20Dimension%20Management%20Magic.js) file in [this repository](https://github.com/narcan/tools/tree/master/Management%20Magic) into your script editor. Be sure to [enable advanced services](https://developers.google.com/apps-script/guides/services/advanced#enabling_advanced_services) for Google Analytics.

###Using the tool

####Listing Custom Dimensions

To list custom dimensions from a property, run the __List custom dimensions__ command from the add-on menu. Enter the property ID from which to list custom dimension settings into the prompt.

A new sheet will be added, formatted, and populated with the values from the property.

If you update any of these values, you can update the custom dimensions in your property by running the _Update custom dimensions_ function from the add-on menu.

__It is recommended that you not update blank values into the property__ as it may result in undesireable behavior.

####Updating Custom Dimensions

To update custom dimension settings within a property or list of properties, run the __Update custom dimensions__ command from the add-on menu. Enter the property IDs (separated by commas) of the properties that should be updated with the custom dimension settings in your sheet.

If you have correctly named the range to contain the custom dimension settings, the properties in the list will be updated with these values.

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
