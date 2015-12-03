/* Management Magic for Google Analytics
*    Lists custom metrics from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/

/*
When updating metrics, type "TIME" throws "internal error" on update, but not on list
  - fix this by adding the "min_value" property and assigning it a value of "0". (automatically gets populated in the UI when saving a TIME type custom metric.)
*/

/**************************************************************************
* Lists metric settings from the property into a new sheet
* @param {string} account The account ID of the GA property
* @param {string} property The tracking ID of the GA property
*/
function listCustomMetrics(account, property) {
  // Attempt to get property information from the Management API
  try {
    var propertyType = Analytics.Management.Webproperties.get(account, property).level;
    var customDimensionList = Analytics.Management.CustomMetrics.list(account, property);
  } catch (error) {
    Browser.msgBox(error.message);
  }
  
  // Process the information received from the Management API
  try {
    // set property type-specific values to access the different limits dynamically
    var propertyTypeSize = 20;
    var cmInfoRange = "standardCMInfo";
    if (propertyType == "PREMIUM") {
      propertyTypeSize = 200;
      cmInfoRange = "premiumCMInfo";
    }
    
    // capture the list of custom metrics and create a 2d array to store what will be output to the sheet
    var cds = [];
    
    // Iterate through all possible custom metrics and set a placeholder for those not set
    for (var i = 0; i < propertyTypeSize; i++) {
      // If the custom metric for the current slot exists, get its values
      if (customMetricList.items[i]) {
        var cmName = customMetricList.items[i].name;
        var cmIndex = customMetricList.items[i].index;
        var cmScope = customMetricList.items[i].scope;
        var cmActive = customMetricList.items[i].active;
        
        // Store the array of values into the ith slot of the 2d sheet array
        cms[i] = [cmName,cmIndex,cmScope,cmActive];
      }
      
      // If the custom metric for the current slot does not exist, creat a place holder for it in the current slot of the 2d sheet array
      else {
        var cmName = "<available> dimension"+(i+1);
        var cmIndex = i+1;
        var cmScope = "HIT";
        var cmActive = "FALSE";
        /*        
        // Insert the place holder values into the Google Analytics Property
        Analytics.Management.CustomMetrics.insert(
        {"index":cmIndex,
        "name":cmName,
        "scope":cmScope,
        "active":cmActive}, 
        account, 
        property);
        */        
        // Store the array of values into the ith slot of the array
        cms[i] = [cmName,cmIndex,cmScope,cmActive];
      }
      
    }
  } catch (error) {
    Browser.msgBox(error.message);
  }
  
  // insert the values processed from the API into the sheet
  try {    
    var createNew = true;
    
    var newSheetName = "CMs from "+property;
    formatSheet(createNew, newSheetName);
    
    // Set the values in the sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ss.getRangeByName(cdInfoRange).setValues(cds);
  } catch (error) {
    Browser.msgBox(error.message);
  }
}