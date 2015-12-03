/* Management Magic for Google Analytics
*    List filters from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/


/**************************************************************************
* Obtains input from user necessary for listing filters
*
*/
function requestFilterList() {
  // Display a dialog box with a title, message, input field, and "OK" and "Cancel" buttons. The
  // user can also close the dialog by clicking the close button in its title bar.
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Account ID', 'Enter the ID of one or more accounts from which to list filters: ', ui.ButtonSet.OK_CANCEL);
  
  // Process the user's response.
  if (response.getSelectedButton() == ui.Button.OK) {
    Logger.log('The user entered account ID: %s.', response.getResponseText());
    var accountList = response.getResponseText();
    var accountListArray = accountList.split(/\s*,\s*/);
    
    var listResponse = listFilters(accountListArray);
    if (listResponse != "success") {
      Browser.msgBox(listResponse);
    } else {
      Logger.log("List filters response: "+ listResponse);
    }
  } else if (response.getSelectedButton() == ui.Button.CANCEL) {
    Logger.log('The user did not provide an account ID.');
  } else {
    Logger.log('The user clicked the close button in the dialog\'s title bar.');
  } 
}

/**************************************************************************
* Lists filter settings from an account into a new sheet
* @param {string} account The account ID from which to list filters
*/
function listFilters(accountList) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var include = "✓";
  var allFilters = [];
  
  for (a = 0; a < accountList.length; a++) {
    var account = accountList[a];
    // Attempt to get property information from the Management API
    try {var filterList = Analytics.Management.Filters.list(account);} catch (e) {return "Error getting data from Mgmt API\n"+ e.message;}
    
    // Process the information received from the Management API
    try {
      // capture the list of filters and create a 2d array to store what will be output to the sheet
      var filters = [];
      
      // Iterate through all possible custom dimensions and set a placeholder for those not set
      for (var i = 0; i < filterList.totalResults; i++) {
        // If the filter for the current slot exists, get its relevant values
        if (filterList.items[i]) {
          var account = filterList.items[i].accountId;
          var id = filterList.items[i].id.toString();
          var name = filterList.items[i].name;
          var type = filterList.items[i].type;
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
          
          if (type == "INCLUDE") {
            field = filterList.items[i].includeDetails.field;
            matchType = filterList.items[i].includeDetails.matchType;
            expressionValue = filterList.items[i].includeDetails.expressionValue;
            caseSensitive = filterList.items[i].includeDetails.caseSensitive;
          }
          else if (type == "EXCLUDE") {
            field = filterList.items[i].excludeDetails.field;
            matchType = filterList.items[i].excludeDetails.matchType;
            expressionValue = filterList.items[i].excludeDetails.expressionValue;
            caseSensitive = filterList.items[i].excludeDetails.caseSensitive;
          }
          else if (type == "LOWERCASE") {
            field = filterList.items[i].lowercaseDetails.field;
          }
          else if (type == "UPPERCASE") {
            field = filterList.items[i].uppercaseDetails.field;
          }
          else if (type == "SEARCH_AND_REPLACE") {
            field = filterList.items[i].searchAndReplaceDetails.field;
            searchString = filterList.items[i].searchAndReplaceDetails ? filterList.items[i].searchAndReplaceDetails.searchString : "";
            replaceString = filterList.items[i].searchAndReplaceDetails ? filterList.items[i].searchAndReplaceDetails.replaceString : "";
            caseSensitive = filterList.items[i].searchAndReplaceDetails.caseSensitive;
          }
          else if (type == "ADVANCED") {
            fieldA = filterList.items[i].advancedDetails ? ((filterList.items[i].advancedDetails.fieldA == undefined) ? "" : filterList.items[i].advancedDetails.fieldA) : "";
            extractA = filterList.items[i].advancedDetails ? ((filterList.items[i].advancedDetails.extractA == undefined) ? "" : filterList.items[i].advancedDetails.extractA) : "";
            fieldARequired = filterList.items[i].advancedDetails ? filterList.items[i].advancedDetails.fieldARequired : "";
            fieldB = filterList.items[i].advancedDetails ? ((filterList.items[i].advancedDetails.fieldB === undefined) ? "" : filterList.items[i].advancedDetails.fieldB) : "";
            extractB = filterList.items[i].advancedDetails ? ((filterList.items[i].advancedDetails.extractB === undefined) ? "" : filterList.items[i].advancedDetails.extractB) : "";
            fieldBRequired = filterList.items[i].advancedDetails ? filterList.items[i].advancedDetails.fieldBRequired : "";
            outputToField = filterList.items[i].advancedDetails ? ((filterList.items[i].advancedDetails.outputToField == undefined) ? "" : filterList.items[i].advancedDetails.outputToField) : "";
            outputConstructor = filterList.items[i].advancedDetails ? ((filterList.items[i].advancedDetails.outputConstructor == undefined) ? "" : filterList.items[i].advancedDetails.outputConstructor) : "";
            overrideOutputField = filterList.items[i].advancedDetails ? filterList.items[i].advancedDetails.overrideOutputField : "";
            caseSensitive = filterList.items[i].advancedDetails.caseSensitive;
          }
          
          // Store the array of values into the ith slot of the 2d sheet array
          filters[i] = [
            include, account, id, name, type,
            field, matchType, expressionValue,
            searchString, replaceString,
            fieldA, extractA, fieldARequired,
            fieldB, extractB, fieldBRequired,
            outputToField, outputConstructor, overrideOutputField,
            caseSensitive
          ];
          
          allFilters.push(filters[i]);
        }
      }
    } catch (e) {return "Processing data from Mgmt API\n"+ e;}
  }
  
  // insert the values processed from the API into the sheet
  try {
    var sheet = ss.getSheetByName(formatFilterSheet(true));
    sheet.getRange(2,1,allFilters.length,allFilters[0].length).setValues(allFilters);
  } catch (e) {return "Error writing data to sheet: "+ e.message;}
  
  // send Measurement Protocol hit to Google Analytics
  //mpHit(ss.getUrl(),'list filters');
  
  return "success";
}