GA Management Magic
---------

The Google Analytics Management API can be accessed through a Google Sheet to list and update settings data in a tabular format. This application lists management entities from Google Analytics into your sheet, and allows you to update settings based on edits or additions in your sheet.
---------
##Working with Custom Dimensions in Google Sheets
####Listing Custom Dimensions
To list custom dimensions from a property (or list of properties), run the __List custom dimensions__ command from the add-on menu. At the prompt, enter one or more property ID(s) from which to list custom dimension settings in your sheet.

A new sheet will be added, formatted, and populated with the values from the properties listed.

If you update any of these values, you can update the custom dimensions in your property by running the __Update custom dimensions__ function from the add-on menu.

####Updating Custom Dimensions
To update custom dimension settings within a property or list of properties, run the __Update custom dimensions__ command from the add-on menu.

If you do not have a pre-formatted sheet, the script will format a new sheet for you into which you can enter your custom dimension settings.
---------
##Working with Filters in Google Sheets
####Listing Filters
To list filters from an account, run the __List filters__ command from the add-on menu. Enter one or more account ID(s) from which to list settings.

A new sheet will be added, formatted, and populated with the filter values from the account.

If you modify any of these values, you can update the filters in your account by running the __Update filters__ function from the add-on menu.

####Updating Filters
To update filter settings from the sheet to an account or list of accounts, run the __Update filters__ command from the add-on menu. At the prompt, enter the account IDs (separated by commas) of the accounts that should be updated with the filter settings in your sheet.