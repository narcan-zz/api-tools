/* Management Magic for Google Analytics
*    Update filters from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/


/**************************************************************************
* Obtains input from user necessary for updating custom dimensions.
*/
function requestFilterUpdate() {
  // check that the necessary named range exists for the update to successfully update filter values.
  if (SpreadsheetApp.getActiveSpreadsheet().getRangeByName("header_row")) {
    var updateFiltersResponse = updateFilters();
    if (updateFiltersResponse != "success") {
      Logger.log("response for "+ account + ": "+ updateFiltersResponse)
    }
  } else { // if the named range necessary for the function to update filters does not exist, format the sheet and display instructions to the user
    var createNew = true;
    formatFilterSheet(createNew);
    Browser.msgBox("Enter filter values into the sheet provided before requesting to update filters.")
  }
}

/**************************************************************************
* Updates dimension settings from the active sheet to a property
* @return {string} The result of the update operation ('updated', if successful)
*/
function updateFilters() {
  // Get common values
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dataRows = sheet.getDataRange().getNumRows()-1;
  var filterRange = sheet.getRange(2,1,dataRows,sheet.getMaxColumns());
  var filters = filterRange.getValues();
  var numFiltersUpdated = 0;
  var accountsUpdated = [];
  
  // iterate through the filter values on the sheet and insert them into the account
  for (var f = 0; f < filters.length; f++) {
    // if the filter is to be included in the upload
    if (filters[f][0]) {
      var account = filters[f][1];
      var filterId = filters[f][2].toString();
      var name = filters[f][3];
      var type = filters[f][4];
      var resource = {};
      resource.name = name;
      resource.type = type;
      
      // increment the number of filters updated and add the account to the array of updated accounts if it's not already there
      if (accountsUpdated.indexOf(account) < 0) accountsUpdated.push(account);
      numFiltersUpdated++;
      
      if (type == 'INCLUDE') {
        resource.includeDetails = {};
        resource.includeDetails.field = filters[f][5];
        resource.includeDetails.matchType = filters[f][6];
        resource.includeDetails.expressionValue = filters[f][7];
        resource.includeDetails.caseSensitive = filters[f][19];
      } else if (type == 'EXCLUDE') {
        resource.excludeDetails = {};
        resource.excludeDetails.field = filters[f][5];
        resource.excludeDetails.matchType = filters[f][6];
        resource.excludeDetails.expressionValue = filters[f][7];
        resource.excludeDetails.caseSensitive = filters[f][19];
      } else if (type == 'LOWERCASE') {
        resource.lowercaseDetails = {};
        resource.lowercaseDetails.field = filters[f][5];
      } else if (type == 'UPPERCASE') {
        resource.uppercaseDetails = {};
        resource.uppercaseDetails.field = filters[f][5];
      } else if (type == 'SEARCH_AND_REPLACE') {
        resource.searchAndReplaceDetails = {};
        resource.searchAndReplaceDetails.field = filters[f][5];
        resource.searchAndReplaceDetails.searchString = filters[f][8];
        resource.searchAndReplaceDetails.replaceString = filters[f][9];
      } else if (type == 'ADVANCED') {
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
      } else return "invalid match type '"+ type +"' at filters["+ f +"][4])";
      
      try {
        if (Analytics.Management.Filters.get(account, filterId).id) {
          resource.id = filterId;
          try {Analytics.Management.Filters.update(resource, account, filterId);} catch (e) { return "failed to update filters\n"+ e;}
        } else {
          try { Analytics.Management.Filters.insert(resource, account);} catch (e) { return "failed to insert filters\n"+ e;}
        }
      } catch (e) {
        return "failed to get filter\n"+ e;
      }
    }
  }
  
  // send Measurement Protocol hit to Google Analytics
  var label = accountsUpdated;
  var value = numFiltersUpdated;
  var httpResponse = mpHit(SpreadsheetApp.getActiveSpreadsheet().getUrl(),'update filters',label,value);
  Logger.log(httpResponse);
  
  return "success";
}