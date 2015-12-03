/* Management Magic for Google Analytics
*    Updates custom dimensions from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/


/**************************************************************************
* Obtains input from user necessary for updating custom dimensions.
*/
function requestCDUpdate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // check that the necessary named range exists for the update to successfully update dimension values.
  if (ss.getRangeByName("header_row")) {
    var updateResponse = updateCustomDimensions();
    if (updateResponse != "success") {
      Browser.msgBox(updateResponse);
    } else {
      Logger.log("Update custom dimensions response: "+ updateResponse)
    }
  } else { // if the named range necessary for the function to update dimension values does not exist, format the sheet and display instructions to the user
    var createNew = true;
    var sheet = formatDimensionSheet(createNew, property, Analytics);
    Browser.msgBox("Enter dimension values into the sheet provided before requesting to update dimensions.")
  }
}

/**************************************************************************
* Updates dimension settings from the active sheet to a property
* @param {string} property The tracking ID of the property to update
* @return {string} Operation output ("success" or an exception message)
*/
function updateCustomDimensions() {
  // set common and property type-specific values
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dataRange = sheet.getDataRange();
  var dataColumns = dataRange.getNumColumns(); // should be 5
  var dataRows = dataRange.getNumRows() - 1;
  var maxRows = (propertyType == "PREMIUM") ? 200 : 20;
  if ((propertyType == "PREMIUM" && dataRows > 200) || (propertyType == "STANDARD" && dataRows > 20)) {
    return "There are too many rows of data - a "+ propertyType +" property can only have up to "+ maxRows +" custom dimensions (this sheet has "+ dataRows +")";
  }
  
  // Capture the current values of the range in the custom dimension sheet
  var cds = sheet.getRange(2,1,dataRows,dataColumns).getValues();
  
  // Iterate through all possible custom dimensions and set a placeholder for those not set
  for (var d = 0; d < cds.length; d++) {
    if (cds[d][0]) {
      var property = cds[d][1];
      var account = property.match(/UA-(.+)-.*/)[1];
      var name = cds[d][2], index = cds[d][3], scope=cds[d][4], active=cds[d][5];
      var dimensionId="ga:dimension"+index;
      
      // set the property type
      try { var propertyType = Analytics.Management.Webproperties.get(account, property).level; } catch (e) { return "failed to get property level for "+ property; }
      var maxDimensions = (propertyType == "PREMIUM") ? 200 : 20;
      if (index == "" || index == undefined) {
        return "Index for dimension '"+ name +" cannot be empty";
      } else if ((propertyType == "PREMIUM" && index > 200) || (propertyType == "STANDARD" && index > 20)) {
        return "Index value ("+ index +") for dimension '"+ name +"' is too high ("+ property +" is a "+ propertyType +" property and can only have up to "+ maxDimensions +"dimensions)";
      } else {
        try {
          if (Analytics.Management.CustomDimensions.get(account, property, dimensionId).index) {
            var resource = {"name":name, "scope":scope, "active":active};
            var options = {ignoreCustomDataSourceLinks: true};
            try {
              Analytics.Management.CustomDimensions.update(resource,account,property,dimensionId,options);
            } catch (e) {return "failed to update all custom dimensions\n"+ e.message}
          }
        } catch (e) {
          if (e.message.match(/ga:dimension(\d)+ not found/)) {
            var resource = {"index":index, "name":name, "scope":scope, "active":active};
            try { Analytics.Management.CustomDimensions.insert(resource,account,property); } catch (e) {return "failed to insert all custom dimensions\n"+ e.message}
          } else return "failed to insert all custom dimensions\n"+ e.message;
        }
      }        
    }
  }
  
  // send Measurement Protocol hit to Google Analytics
  //mpHit(ss.getUrl(),'update custom dimensions');
  
  return "success";
}