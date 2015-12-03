/* Management Magic for Google Analytics
*    Lists custom dimensions from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/


/**************************************************************************
* Obtains input from user necessary for listing custom dimensions.
*/
function requestCDList() {
  // Display a dialog box with a title, message, input field, and "OK" and "Cancel" buttons. The
  // user can also close the dialog by clicking the close button in its title bar.
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Property ID', 'Enter the ID of the property from which to list custom dimensions (UA-xxxx-y): ', ui.ButtonSet.OK_CANCEL);
  
  // Process the user's response.
  if (response.getSelectedButton() == ui.Button.OK) {
    Logger.log('The user entered property ID: %s.', response.getResponseText());
    var propertyList = response.getResponseText();
    var propertyListArray = propertyList.split(/\s*,\s*/);
    
    var listResponse = listCustomDimensions(propertyListArray);
    if (listResponse != "success") {
      Browser.msgBox(listResponse);
    } else {
      Logger.log("List custom dimensions response: "+ listResponse)
    }
  } else if (response.getSelectedButton() == ui.Button.CANCEL) {
    Logger.log('The user did not provide a property ID.');
  } else {
    Logger.log('The user clicked the close button in the dialog\'s title bar.');
  } 
}

/**************************************************************************
* Lists dimension settings from the property into a new sheet
* @param {string} property The tracking ID of the GA property
* @return {string} Operation output ("success" or an exception message)
*/
function listCustomDimensions(propertyList) {
  var include = "✓";
  var allCDs = [];
  
  for (p = 0; p < propertyList.length; p++) {
    var property = propertyList[p];
    var account = property.match(/UA-(\d+)-*.*/)[1];
    
    // Attempt to get property information from the Management API
    try {
      var propertyType = Analytics.Management.Webproperties.get(account, property).level;
      var customDimensionList = Analytics.Management.CustomDimensions.list(account, property);
    } catch (e) {
      return e.message;
    }
    
    // set common values and property type-specific values
    var dataColumns = 6;
    var dataRows = (propertyType == "PREMIUM") ? 200 : 20;
    
    // Process the information received from the Management API
    try {
      // capture the list of custom dimensions and create a 2d array to store what will be output to the sheet
      var cds = [];
      
      // Iterate through all possible custom dimensions and set a placeholder for those not set
      for (var i = 0; i < customDimensionList.totalResults; i++) {
        // If the custom dimension for the current slot exists, get its values
        if (customDimensionList.items[i]) {
          var cdProperty = customDimensionList.items[i].webPropertyId;
          var cdName = customDimensionList.items[i].name;
          var cdIndex = customDimensionList.items[i].index;
          var cdScope = customDimensionList.items[i].scope;
          var cdActive = customDimensionList.items[i].active;
          
          // Store the array of values into the ith slot of the 2d sheet array
          cds[i] = [include,cdProperty,cdName,cdIndex,cdScope,cdActive];
          allCDs.push(cds[i]);
        } 
      }
    } catch (e) {
      return e.message;
    }
  }
  
  // insert the values processed from the API into the sheet
  try {    
    // Set the values in the sheet
    var sheet = formatDimensionSheet(true);
    sheet.getRange(2,1,allCDs.length,dataColumns).setValues(allCDs);
  } catch (e) {
    return e.message;
  }
  
  // send Measurement Protocol hit to Google Analytics
  //mpHit(ss.getUrl(),'list custom dimensions');
  
  return "success";
}