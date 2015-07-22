/* Custom Dimension and Metric Management Magic for Google Analytics
 *   Adds menu items to manage Google Analytics Custom Dimensions and Metrics
 *   - @TODO expand to other management entities
 * 
 * Last updated: 2015.04.20
 *
 * Copyright ©2015 Pedro Avila (pdro@google.com)
 */

// Global sheet variables
var ss = SpreadsheetApp.getActiveSpreadsheet();
var propertyRange = ss.getRangeByName("propertyId");

// Sets up the menu to launch the script functionality
function onOpen() {  
  // Application Menu UI
  var menu = SpreadsheetApp.getUi().createMenu('Manage Analytics')
    .addItem('List Custom Dimensions', 'listCustomDimensions')
    .addItem('Update Custom Dimensions', 'updateCustomDimensions')
    .addItem('List Custom Metrics', 'listCustomMetrics')
    .addItem('Update Custom Metrics', 'updateCustomMetrics')
    .addSeparator()
    .addToUi();
}

/* Displays the custom dimensions for the property. All currently unset custom dimension slots are set with placeholder:
 *  - name: "index"
 *  - scope: "HIT"
 *  - active: false
 */
function listCustomDimensions() {
  // capture property value from the property range before running the function
  //   (allows the user to change the values in the admin sheet dynamically)
  var property = propertyRange.getValue();
  
  // extract the account value from the property
  var account = property.match(/UA-(.+)-.*/)[1];

  // initialize the remaining variables
  var propertyType = Analytics.Management.Webproperties.get(account, property).level;
  var propertyTypeSize = 20;
  var cdInfoRange = "standardCDInfo";
  
  // check the property type and set local variables to access the different limits dynamically
  if (propertyType == "PREMIUM") {
    propertyTypeSize = 200;
    cdInfoRange = "premiumCDInfo";
  }
  
  // capture the list of custom dimensions and create a 2d array to store what will be output to the sheet
  var customDimensionList = Analytics.Management.CustomDimensions.list(account, property);
  var cds = [];
  
  try {
    // Iterate through all possible custom dimensions and set a placeholder for those not set
    for (var i = 0; i < propertyTypeSize; i++) {
      // If the custom dimension for the current slot exists, get its values
      if (customDimensionList.items[i]) {
        var cdName = customDimensionList.items[i].name;
        var cdIndex = customDimensionList.items[i].index;
        var cdScope = customDimensionList.items[i].scope;
        var cdActive = customDimensionList.items[i].active;
        
        // Store the array of values into the ith slot of the 2d sheet array
        cds[i] = [cdName,cdIndex,cdScope,cdActive];
      }
      // If the custom dimension for the current slot does not exist, creat a place holder for it in the current slot of the 2d sheet array
      else {
        var cdName = "index"+(i+1);
        var cdIndex = i+1;
        var cdScope = "HIT";
        var cdActive = "false";
        
        // Insert the place holder values into the Google Analytics Property
        Analytics.Management.CustomDimensions.insert(
          {"index":cdIndex,
           "name":cdName,
           "scope":cdScope,
           "active":cdActive}, 
          account, 
          property);
        
        // Store the array of values into the ith slot of the 2d sheet array
        cds[i] = [cdName,cdIndex,cdScope,cdActive];
      }
    }
  } catch (error) {
    Browser.msgBox(error.message);
  }

  // Set the values in the sheet
  ss.getRangeByName(cdInfoRange).setValues(cds);
}

/* Updates the custom dimensions in the property with the contents of the custom dimension sheet.
 *   Note that blank custom dimension names will result in an error message and no update
 */
function updateCustomDimensions() {
  // capture property value from the property range before running the function
  //   (allows the user to change the values in the admin sheet dynamically)
  var property = propertyRange.getValue();
  
  // extract the account value from the property
  var account = property.match(/UA-(.+)-.*/)[1];

  // initialize the remaining variables
  var ui = SpreadsheetApp.getUi();  
  var propertyType = Analytics.Management.Webproperties.get(account, property).level;
  var propertyTypeSize = 20;
  var cdInfoRange = "standardCDInfo";
  var hasBlanks = false;
  
  // check the property type and set local variables to access the different limits dynamically
  if (propertyType == "PREMIUM") {
    propertyTypeSize = 200;
    cdInfoRange = "premiumCDInfo";
  }
  
  // Capture the current values of the range in the custom dimension sheet
  var cds = ss.getRangeByName(cdInfoRange).getValues();
  
  for (var i = 0; i < cds.length; i++) {
    var name = cds[i][0], dimensionId="ga:dimension"+cds[i][1], scope=cds[i][2], active=cds[i][3];
    if (!hasBlanks) {
      if (cds[i][0] === '' || cds[i][1] === '' || cds[i][2] === '' || cds[i][3] === '') {
        hasBlanks = true;
      }
    }
  }
  
  // If there are blank values, show option to continue/cancel
  if (hasBlanks) {
    var result = ui.alert('WARNING: blank cells can result in errors/unexpected behavior.',
                          'Are you sure you want to continue?',
                          ui.ButtonSet.YES_NO);
  } else {
    var result = ui.alert('WARNING: this action will update your property settings with the contents of this sheet.',
                          'Are you sure you want to continue?',
                          ui.ButtonSet.YES_NO);
  }
  
  // Process the user's response.
  if (result == ui.Button.YES) {
    // User clicked "Yes"
    try {
      // Iterate through all possible custom dimensions and set a placeholder for those not set
      for (var i = 0; i < cds.length; i++) {
        var name = cds[i][0], dimensionId="ga:dimension"+cds[i][1], scope=cds[i][2], active=cds[i][3];
        
        //Update the values in Google Analytics to match the current row of the sheet
        Analytics.Management.CustomDimensions.update(
          {"name":name, "scope":scope, "active":active},
          account,
          property,
          dimensionId,
          {ignoreCustomDataSourceLinks: true}
        );
      }
    } catch (error) {
      Browser.msgBox(error.message);
    }
  } else {
    // User clicked "No" or X in the title bar
    ui.alert('Update cancelled.');
  }
}

/* Displays the custom metrics for the property. All currently unset custom metric slots are set with placeholder:
 *  - name: "index"
 *  - scope: "HIT"
 *  - type: "INTEGER"
 *  - active: false
 */
function listCustomMetrics() {
  // capture property value from the property range before running the function
  //   (allows the user to change the values in the admin sheet dynamically)
  var property = propertyRange.getValue();
  
  // extract the account value from the property
  var account = property.match(/UA-(.+)-.*/)[1];

  // initialize the remaining variables
  var propertyType = Analytics.Management.Webproperties.get(account, property).level;
  var propertyTypeSize = 20;
  var cmInfoRange = "standardCMInfo";
  
  // check the property type and set local variables to access the different limits dynamically
  if (propertyType == "PREMIUM") {
    propertyTypeSize = 200;
    cdInfoRange = "premiumCMInfo";
  }
  
  // capture the list of custom metrics and create a 2d array to store what will be output to the sheet
  var customMetricList = Analytics.Management.CustomMetrics.list(account, property);
  var cms = [];
  
  try {
    // Iterate through all possible custom metrics and set a placeholder for those not set
    for (var i = 0; i < propertyTypeSize; i++) {
      // If the custom metric for the current slot exists, get its values
      if (customMetricList.items[i]) {
        var cmName = customMetricList.items[i].name;
        var cmIndex = customMetricList.items[i].index;
        var cmScope = customMetricList.items[i].scope;
        var cmType = customMetricList.items[i].type;
        var cmActive = customMetricList.items[i].active;
        
        // Store the array of values into the ith slot of the 2d sheet array
        cms[i] = [cmName,cmIndex,cmScope,cmType,cmActive];
      }
      // If the custom metric for the current slot does not exist, creat a place holder for it in the current slot of the 2d sheet array
      else {
        var cmName = "index"+(i+1);
        var cmIndex = i+1;
        var cmScope = "HIT";
        var cmType = "INTEGER";
        var cmActive = "false";
        
        // Insert the place holder values into the Google Analytics Property
        Analytics.Management.CustomMetrics.insert(
          {"index":cmIndex,
           "name":cmName,
           "scope":cmScope,
           "type":cmType,
           "active":cmActive}, 
          account, 
          property);
        
        // Store the array of values into the ith slot of the 2d sheet array
        cms[i] = [cmName,cmIndex,cmScope,cmType,cmActive];
      }
    }
  } catch (error) {
    Browser.msgBox(error.message);
  }

  // Set the values in the sheet
  ss.getRangeByName(cmInfoRange).setValues(cms);
}

function updateCustomMetrics() {
  // capture property value from the property range before running the function
  //   (allows the user to change the values in the admin sheet dynamically)
  var property = propertyRange.getValue();
  
  // extract the account value from the property
  var account = property.match(/UA-(.+)-.*/)[1];

  // initialize the remaining variables
  var ui = SpreadsheetApp.getUi();  
  var propertyType = Analytics.Management.Webproperties.get(account, property).level;
  var propertyTypeSize = 20;
  var cmInfoRange = "standardCMInfo";
  var hasBlanks = false;
  
  // check the property type and set local variables to access the different limits dynamically
  if (propertyType == "PREMIUM") {
    propertyTypeSize = 200;
    cmInfoRange = "premiumCDInfo";
  }
  
  // Capture the current values of the range in the custom metrics sheet
  var cms = ss.getRangeByName(cmInfoRange).getValues();
  
  for (var i = 0; i < cms.length; i++) {
    var name = cms[i][0], metricId="ga:metric"+cms[i][1], scope=cms[i][2], type=cms[i][3], active=cms[i][4];
    if (!hasBlanks) {
      if (cms[i][0] === '' || cms[i][1] === '' || cms[i][2] === '' || cms[i][3] === '' || cms[i][4] === '') {
        hasBlanks = true;
      }
    }
  }
  
  // If there are blank values, show option to continue/cancel
  if (hasBlanks) {
    var result = ui.alert('WARNING: blank cells can result in errors/unexpected behavior.',
                          'Are you sure you want to continue?',
                          ui.ButtonSet.YES_NO);
  } else {
    var result = ui.alert('WARNING: this action will update your property settings with the contents of this sheet.',
                          'Are you sure you want to continue?',
                          ui.ButtonSet.YES_NO);
  }
  
  // Process the user's response.
  if (result == ui.Button.YES) {
    // User clicked "Yes"
    try {
      // Iterate through all possible custom metrics and set a placeholder for those not set
      for (var i = 0; i < cms.length; i++) {
        var name = cms[i][0], metricId="ga:metric"+cms[i][1], scope=cms[i][2], type=cms[i][3], active=cms[i][4];
        
        //Update the values in Google Analytics to match the current row of the sheet
        Analytics.Management.CustomMetrics.update(
          {"name":name, "scope":scope, "type":type, "active":active},
          account,
          property,
          metricId,
          {ignoreCustomDataSourceLinks: true}
        );
      }
    } catch (error) {
      Browser.msgBox(error.message);
    }
  } else {
    // User clicked "No" or X in the title bar
    ui.alert('Update cancelled.');
  }
}
