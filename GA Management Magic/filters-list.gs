/* Management Magic for Google Analytics
*    List filters from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/

// add functionality to get the views in which the filter is applied
//in the edit file, add functionality to push filters to other views


/**************************************************************************
* Obtains input from user necessary for listing filters
*/
function requestFilterList() {
  // Display a dialog box with a title, message, input field, and "OK" and "Cancel" buttons. The
  // user can also close the dialog by clicking the close button in its title bar.
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Account ID', 'Enter the ID of one or more accounts from which to list filters: ', ui.ButtonSet.OK_CANCEL);
  
  // Process the user's response.
  if (response.getSelectedButton() == ui.Button.OK) {
    // Construct the array of one or more accounts from the user's input.
    Logger.log('The user entered account ID: %s.', response.getResponseText());
    var accountList = response.getResponseText();
    var accountListArray = accountList.split(/\s*,\s*/);
    
    // List filters from all accounts entered by the user.
    var listResponse = listFilters(accountListArray);
    
    // Output errors and log successes.
    if (listResponse != "success") {
      Browser.msgBox(listResponse);
    } else {
      Logger.log("List filters response: "+ listResponse);
    }
  }
  
  // Log method by which the user chose not to proceed.
  else if (response.getSelectedButton() == ui.Button.CANCEL) {
    Logger.log('The user did not provide an account ID.');
  } else {
    Logger.log('The user clicked the close button in the dialog\'s title bar.');
  } 
}

/**************************************************************************
* Lists filter settings from an account into a new sheet
* @param {string} account The account ID from which to list filters
* @return {string} Operation output ('success' or error message)
*/
function listFilters(accountList) {
  // set common values
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var include = "✓";
  var allFilters = [];
  
  // Iterate through the array of accounts from which to list filters
  for (a = 0; a < accountList.length; a++) {
    var account = accountList[a];
    
    // Process an account id if it matches a valid format.
    if (account.match(/\d+/)) {
      
      // Attempt to get filters from the Management API.
      try {
        var filterList = Analytics.Management.Filters.list(account);
      } catch (e) {
        return "Error getting data from Mgmt API\n"+ e.message;
      }
      
      // capture the list of filters and create a 2d array to store what will be output to the sheet.
      var filters = [];
      
      // Parse each result of the API request and push it to an array.
      for (var i = 0; i < filterList.totalResults; i++) {
        var filter = filterList.items[i];
        var account = filter.accountId;
        var id = filter.id.toString();
        var name = filter.name;
        var type = filter.type;
        var field = "";
        var matchType = "";
        var expressionValue = "";
        var searchString = "";
        var replaceString = "";
        var caseSensitive = "FALSE";
        var fieldA = "";
        var extractA = "";
        var fieldARequired = "";
        var fieldB = "";
        var extractB = "";
        var fieldBRequired = "";
        var outputToField = "";
        var outputConstructor = "";
        var overrideOutputField = "";
        
        // Set include-specific values.
        if (type == "INCLUDE") {
          field = filter.includeDetails.field;
          matchType = filter.includeDetails.matchType;
          expressionValue = filter.includeDetails.expressionValue;
          caseSensitive = filter.includeDetails.caseSensitive;
        }
        
        // Set exclude-specific values.
        else if (type == "EXCLUDE") {
          field = filter.excludeDetails.field;
          matchType = filter.excludeDetails.matchType;
          expressionValue = filter.excludeDetails.expressionValue;
          caseSensitive = filter.excludeDetails.caseSensitive;
        }
        
        // Set lowercase-specific values.
        else if (type == "LOWERCASE") {
          field = filter.lowercaseDetails.field;
        }
        
        // Set uppercase-specific values.
        else if (type == "UPPERCASE") {
          field = filter.uppercaseDetails.field;
        }
        
        // Set searchAndReplace-specific values
        else if (type == "SEARCH_AND_REPLACE") {
          field = filter.searchAndReplaceDetails.field;
          searchString = filter.searchAndReplaceDetails ? filter.searchAndReplaceDetails.searchString : "";
          replaceString = filter.searchAndReplaceDetails ? filter.searchAndReplaceDetails.replaceString : "";
          caseSensitive = filter.searchAndReplaceDetails.caseSensitive;
        }
        
        // Set advanced-specific values.
        else if (type == "ADVANCED") {
          fieldA = filter.advancedDetails ? ((filter.advancedDetails.fieldA == undefined) ? "" : filter.advancedDetails.fieldA) : "";
          extractA = filter.advancedDetails ? ((filter.advancedDetails.extractA == undefined) ? "" : filter.advancedDetails.extractA) : "";
          fieldARequired = filter.advancedDetails ? filter.advancedDetails.fieldARequired : "";
          fieldB = filter.advancedDetails ? ((filter.advancedDetails.fieldB === undefined) ? "" : filter.advancedDetails.fieldB) : "";
          extractB = filter.advancedDetails ? ((filter.advancedDetails.extractB === undefined) ? "" : filter.advancedDetails.extractB) : "";
          fieldBRequired = filter.advancedDetails ? filter.advancedDetails.fieldBRequired : "";
          outputToField = filter.advancedDetails ? ((filter.advancedDetails.outputToField == undefined) ? "" : filter.advancedDetails.outputToField) : "";
          outputConstructor = filter.advancedDetails ? ((filter.advancedDetails.outputConstructor == undefined) ? "" : filter.advancedDetails.outputConstructor) : "";
          overrideOutputField = filterList.items[i].advancedDetails ? filterList.items[i].advancedDetails.overrideOutputField : "";
          caseSensitive = filter.advancedDetails.caseSensitive;
        }
        
        // Store the array of values
        filters[i] = [
          include, account, id, name, type,
          field, matchType, expressionValue,
          searchString, replaceString,
          fieldA, extractA, fieldARequired,
          fieldB, extractB, fieldBRequired,
          outputToField, outputConstructor, overrideOutputField,
          caseSensitive
        ];
        
        // Push the array of values into a cummulative array
        allFilters.push(filters[i]);
      }
    }
    
    // Return an error to the user if the account id is not in a valid format.
    else return account +"is not a valid account format";
  }
  
  // Attempt to insert the values processed from the API into the sheet
  try {
    var sheet = ss.getSheetByName(formatFilterSheet(true));
    sheet.getRange(2,1,allFilters.length,allFilters[0].length).setValues(allFilters);
  } catch (e) {return "Error writing data to sheet: "+ e.message;}
  
  // send Measurement Protocol hit to Google Analytics
  var label = accountList;
  var value = accountList.length;
  var httpResponse = mpHit(SpreadsheetApp.getActiveSpreadsheet().getUrl(),'list filters',label,value);
  Logger.log(httpResponse);
  
  return "success";
}