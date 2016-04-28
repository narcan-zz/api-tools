/* Management Magic for Google Analytics
*    Update filters from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/


/**************************************************************************
* Obtains input from user necessary for updating custom dimensions.
*/
function requestFilterUpdate() {
  // Check that the necessary named range exists.
  if (SpreadsheetApp.getActiveSpreadsheet().getRangeByName("header_row")) {
    
    // Update the filters from the sheet.
    var updateFiltersResponse = updateFilters();
    
    // Output errors and log successes.
    if (updateFiltersResponse != "success") {
      Logger.log("response for "+ account + ": "+ updateFiltersResponse)
    } else {
      Logger.log("Update filters response: "+ updateFiltersResponse)
    }
  }
  
  // If there is no named range (necessary to update values), format the sheet and display instructions to the user.
  else {
    formatFilterSheet(true);
    Browser.msgBox("Enter filter values into the sheet provided before requesting to update filters.")
  }
}

/**************************************************************************
* Updates dimension settings from the active sheet to a property.
* @return {string} The result of the update operation ("success", if successful)
*/
function updateFilters() {
  // Get common values
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dataRows = sheet.getDataRange().getNumRows()-1;
  var filterRange = sheet.getRange(2,1,dataRows,sheet.getMaxColumns());
  var filters = filterRange.getValues();
  var numFiltersUpdated = 0;
  var accountsUpdated = [];
  
  // Iterate through rows of values in the sheet.
  for (var f = 0; f < filters.length; f++) {
    
    // Process values marked for inclusion.
    if (filters[f][0] == '✓') {
      var account = filters[f][1];
      var filterId = filters[f][2].toString();
      var name = filters[f][3];
      var type = filters[f][4];
      var resource = {};
      resource.name = name;
      resource.type = type;
      
      // increment the number of filters updated and add the account to the array of updated accounts if it's not already there.
      numFiltersUpdated++;
      if (accountsUpdated.indexOf(account) < 0) accountsUpdated.push(account);
      
      // Get include-specific values.
      if (type == 'INCLUDE') {
        resource.includeDetails = {};
        resource.includeDetails.field = filters[f][5];
        resource.includeDetails.matchType = filters[f][6];
        resource.includeDetails.expressionValue = filters[f][7];
        resource.includeDetails.caseSensitive = filters[f][19];
      }
      
      // Get exclude-specific values.
      else if (type == 'EXCLUDE') {
        resource.excludeDetails = {};
        resource.excludeDetails.field = filters[f][5];
        resource.excludeDetails.matchType = filters[f][6];
        resource.excludeDetails.expressionValue = filters[f][7];
        resource.excludeDetails.caseSensitive = filters[f][19];
      }
      
      // Get lowercase-specific values.
      else if (type == 'LOWERCASE') {
        resource.lowercaseDetails = {};
        resource.lowercaseDetails.field = filters[f][5];
      }
      
      // Get uppercase-specific values.
      else if (type == 'UPPERCASE') {
        resource.uppercaseDetails = {};
        resource.uppercaseDetails.field = filters[f][5];
      }
      
      // Get searchAndReplace-specific values.
      else if (type == 'SEARCH_AND_REPLACE') {
        resource.searchAndReplaceDetails = {};
        resource.searchAndReplaceDetails.field = filters[f][5];
        resource.searchAndReplaceDetails.searchString = filters[f][8];
        resource.searchAndReplaceDetails.replaceString = filters[f][9];
      }
      
      // Get advanced-specific values.
      else if (type == 'ADVANCED') {
        resource.advancedDetails = {};
        resource.advancedDetails.fieldA = filters[f][10];
        resource.advancedDetails.extractA = filters[f][11];
        resource.advancedDetails.fieldARequired = filters[f][12];
        resource.advancedDetails.fieldB = filters[f][13];
        resource.advancedDetails.extractB = filters[f][14];
        resource.advancedDetails.fieldBRequired = filters[f][15];
        resource.advancedDetails.outputToField = filters[f][16];
        resource.advancedDetails.outputConstructor = filters[f][17];
        resource.advancedDetails.overrideOutputField = filters[f][18];
        resource.advancedDetails.overrideOutputField = filters[f][19];
      }
      
      // Return an error to the user if no filter type value exists.
      else return "invalid match type '"+ type +"' at filters["+ f +"][4])";
      
      // Attempt to get the id for the filter in the sheet (the API throws an exception when no filter exists for the id).
      try {
        
        // If the id exists, set the necessary values update the filter
        if (Analytics.Management.Filters.get(account, filterId).id) {
          resource.id = filterId;
          
          // Attempt to update the filter through the API
          try {Analytics.Management.Filters.update(resource, account, filterId);
              } catch (e) { return "failed to update filters\n"+ e;}
        }
      }
      
      // As noted in the try-block comment above, if no filter exists, the API throws an exception
      // if no filter exists, catch this exception and set the necessary values to insert the filter
      catch (e) {
        // Attempt to insert the filter
        try { Analytics.Management.Filters.insert(resource, account);
            } catch (e) { return "failed to insert filters\n"+ e;}
      }
    }
  }
  
 
  return "success";
}