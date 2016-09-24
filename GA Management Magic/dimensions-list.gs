/* Management Magic for Google Analytics
*    Lists dimensions from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/


/**************************************************************************
* Obtains input from user necessary for listing dimensions.
*/
function requestDimensionList() {
  // Display a dialog box with a title, message, input field, and "OK" and "Cancel" buttons. The
  // user can also close the dialog by clicking the close button in its title bar.
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Property ID', 'Enter the ID of the property from which to list dimensions (UA-xxxx-y): ', ui.ButtonSet.OK_CANCEL);
  
  // Process the user's response.
  if (response.getSelectedButton() == ui.Button.OK) {
    // Construct the array of one or more properties from the user's input.
    var propertyList = response.getResponseText();
    var propertyListArray = propertyList.split(/\s*,\s*/);
    
    // List dimensions from all properties entered by the user.
    var listResponse = listDimensions(propertyListArray);
    
    // Output errors and log successes.
    if (listResponse != "success") {
      Browser.msgBox(listResponse);
    } else {
      console.log("List dimensions response: "+ listResponse)
    }
  }
  
  // Log method by which the user chose not to proceed.
  else if (response.getSelectedButton() == ui.Button.CANCEL) {
    console.log('The user did not provide a property ID.');
  } else {
    console.log('The user clicked the close button in the dialog\'s title bar.');
  } 
}

/**************************************************************************
* Lists dimension settings from the property into a new sheet
* @param {string} property The tracking ID of the GA property
* @return {string} Operation output ('success' or error message)
*/
function listDimensions(propertyList) {
  // Set common values
  var include = "✓";
  var allDimensions = [];
  var dataColumns = 6;
  
  // Iterate through the array of properties from which to list dimensions
  for (p = 0; p < propertyList.length; p++) {
    var property = propertyList[p];
    
    // Process a property id if it matches a valid format.
    if (property.match(/UA-\d+-\d+/)) {
      
      // Extract the account from the property id
      var account = property.match(/UA-(\d+)-\d+/)[1];
      
      // Attempt to get property information from the Management API
      try {
        var dimensionList = Analytics.Management.CustomDimensions.list(account, property);
      } catch (e) {
        return e.message;
      }
      
      // Attempt to store the information received from the Management API in an array
      try {
        var dimensions = [];
        
        // Parse each result of the API request and push it to an array
        for (var i = 0; i < dimensionList.totalResults; i++) {
          var dimension = dimensionList.items[i];
          dimensions[i] = [include,dimension.webPropertyId,dimension.name,dimension.index,dimension.scope,dimension.active];
          allDimensions.push(dimensions[i]); 
        }
      } catch (e) {
        return e.message;
      }
    }
    // Return an error message if the property id does not match the correct format.
    else return property +" is an invalid property format";
  }
  
  // Insert the values processed from the API into a formatted sheet
  try {    
    // Set the values in the sheet
    var sheet = formatDimensionSheet(true);
    sheet.getRange(2,1,allDimensions.length,dataColumns).setValues(allDimensions);
  } catch (e) {
    return e.message;
  }
  
  // send Measurement Protocol event hit to Google Analytics
  var label = propertyList;
  var value = propertyList.length;
  var httpResponse = mpHit(SpreadsheetApp.getActiveSpreadsheet().getUrl(),'list dimensions',label,value);
  console.log(httpResponse);
  
  return "success";
}