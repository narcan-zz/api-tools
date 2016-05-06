/* Management Magic for Google Analytics
*  Functions for User Management
*
* Copyright ©2016 Gary Mu (Gary7135[at]gmail[dot]com)
***************************************************************************/


/**************************************************************************
*/

function requestUserList() {
  // Display a dialog box with a title, message, input field, and "OK" and "Cancel" buttons. The
  // user can also close the dialog by clicking the close button in its title bar.
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Property ID', 'Enter the ID of the property from which to list custom dimensions (UA-xxxx-y): ', ui.ButtonSet.OK_CANCEL);
  var view = ui.prompt('View ID', 'Enter the ID of the view from which to list users: ', ui.ButtonSet.OK_CANCEL);
  
  // Process the user's response.
  if (response.getSelectedButton() == ui.Button.OK) {
    // Construct the array of one or more properties from the user's input.
    var propertyID = response.getResponseText();

    var viewList = view.getResponseText();    
    var viewListArray = viewList.split(/\s*,\s*/);
    
    // List users from all properties entered by the user.
    var listResponse = listUsers(propertyID, viewListArray);
    
    // Output errors and log successes.
    if (listResponse != "success") {
      Browser.msgBox(listResponse);
    } else {
      Logger.log("List users response: "+ listResponse)
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
function listUsers(propertyID, viewListArray) {
  // Set common values
  var include = "✘";
  var allUsers = [];
  var dataColumns = 5;
  
  // Iterate through the array of view IDs from which to list users
  for (p = 0; p < viewListArray.length; p++) {
    var viewID = viewListArray[p];
    
    // Process a view id is not null.
    if (viewID) {
      
      // Extract the account from the property id
      var account = propertyID.match(/UA-(\d+)-\d+/)[1];
      // Attempt to get property information from the Management API
      try {
        var usersList = Analytics.Management.ProfileUserLinks.list(
          account = account, 
          property = propertyID,
          view = viewID);
      } catch (e) {
        return e.message;
      }
      
      // Attempt to store the information received from the Management API in an array
      try {
        var users = [];
        // Parse each result of the API request and push it to an array
        for (var i = 0; i < usersList.totalResults; i++) {
          var user = usersList.items[i];
          users[i] = [include,propertyID, viewID ,user.userRef.email, user.permissions.effective.toString()];
          allUsers.push(users[i]); 
        }
      } catch (e) {
        return e.message;
      }
    }
    // Return an error message if the property id does not match the correct format.
    else return viewID +" is an invalid view ID format";
  }
  
  // Insert the values processed from the API into a formatted sheet
  try {    
    // Set the values in the sheet
    var sheet = formatUserSheet(false);
    sheet.getRange(2,1,allUsers.length,dataColumns).setValues(allUsers);
  } catch (e) {
    return e.message;
  }
  
  return "success";
}