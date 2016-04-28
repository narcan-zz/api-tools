/* Management Magic for Google Analytics
*    Lists custom dimensions from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
* Copyright ©2016 Gary Mu (Gary7135[at]gmail[dot]com)
***************************************************************************/


/**************************************************************************
* Obtains input from user necessary for listing custom dimensions.
*/
function requestCMList() {
  // Display a dialog box with a title, message, input field, and "OK" and "Cancel" buttons. The
  // user can also close the dialog by clicking the close button in its title bar.
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Property ID', 'Enter the ID of the property from which to list custom dimensions (UA-xxxx-y): ', ui.ButtonSet.OK_CANCEL);
  
  // Process the user's response.
  if (response.getSelectedButton() == ui.Button.OK) {
    // Construct the array of one or more properties from the user's input.
    var propertyList = response.getResponseText();
    var propertyListArray = propertyList.split(/\s*,\s*/);
    
    // List custom dimensions from all properties entered by the user.
    var listResponse = listCustomMetrics(propertyListArray);
    
    // Output errors and log successes.
    if (listResponse != "success") {
      Browser.msgBox(listResponse);
    } else {
      Logger.log("List custom metrics response: "+ listResponse)
    }
  }
  
  // Log method by which the user chose not to proceed.
  else if (response.getSelectedButton() == ui.Button.CANCEL) {
    Logger.log('The user did not provide a property ID.');
  } else {
    Logger.log('The user clicked the close button in the dialog\'s title bar.');
  } 
}

/**************************************************************************
* Lists dimension settings from the property into a new sheet
* @param {string} property The tracking ID of the GA property
* @return {string} Operation output ('success' or error message)
*/

function listCustomMetrics(propertyList) {
  // Set common values
  var include = '✘';
  var allMetrics = [];
  var dataColumns = 9;
  
  // Iterate through the array of properties from which to list dimensions
  for (p = 0; p < propertyList.length; p++) {
    var property = propertyList[p];
    // Process a property id if it matches a valid format.
    if (property.match(/UA-\d+-\d+/)) {
      // Extract the account from the property id
      var account = property.match(/UA-(\d+)-\d+/)[1];
      // Attempt to get property information from the Management API
      try {
        var customMetricList = Analytics.Management.CustomMetrics.list(account, property);
      } catch (e) {
        return e.message;
      }
      
      // Attempt to store the information received from the Management API in an array
      try {
        var metrics = [];
        
        // Parse each result of the API request and push it to an array
        for (var i = 0; i < customMetricList.totalResults; i++) {
                      debugger;

          var cm = customMetricList.items[i];
          if (cm.min_value){
            metrics[i] = [include,cm.webPropertyId,cm.name,cm.index,cm.scope,cm.type, cm.min_value, cm.max_value,cm.active];}
          else {
            metrics[i] = [include, property,cm.name,cm.index,cm.scope,cm.type, 'N/A', 'N/A',cm.active];}
          allMetrics.push(metrics[i]); 
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
    var sheet = formatMetricSheet(true);
    sheet.getRange(2,1,allMetrics.length,dataColumns).setValues(allMetrics);
  } catch (e) {
    return e.message;
  }
  
  return "success";
}