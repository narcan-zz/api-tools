/* Management Magic for Google Analytics
*    Updates custom dimensions from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
* Copyright ©2016 Gary Mu (Gary7135[at]gmail[dot]com)
***************************************************************************/


/**************************************************************************
* Obtains input from user necessary for updating custom dimensions.
*/
function requestCDUpdate() {
  // Check that the necessary named range exists.
 
  if (SpreadsheetApp.getActiveSpreadsheet().getRangeByName("header_row")) {
    
    // Update custom dimensions from the sheet.
    var updateDimensionResponse = updateDimensions();
    
    // Output errors and log successes.
    if (updateDimensionResponse != "success") {
      Browser.msgBox(updateDimensionResponse);
    } else {
      Logger.log("Update custom dimensions response: "+ updateDimensionResponse)
    }
  }
  
  // If there is no named range (necessary to update values), format the sheet and display instructions to the user
  else {
    var sheet = formatDimensionSheet(true);
    Browser.msgBox("Enter dimension values into the sheet provided before requesting to update dimensions.")
  }
}

/**************************************************************************
* Updates dimension settings from the active sheet to a property.
* @return {string} Operation output ("success" or error message)
*/
function updateDimensions() {
  // set common values
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dataRange = sheet.getDataRange();
  var dataColumns = dataRange.getNumColumns(); // should be 5
  var dataRows = dataRange.getNumRows() - 1;
  var maxRows = (propertyType == "PREMIUM") ? 200 : 20;
  var numDimensionsUpdated = 0;
  var propertiesUpdated = [];
  
  // Capture the sheet values.
  var dimensions = sheet.getRange(2,1,dataRows,dataColumns).getValues();
  
  // Iterate through rows of values in the sheet.
  for (var d = 0; d < dimensions.length; d++) {
    
    // Process values marked for inclusion.
    if (dimensions[d][0] == '✓') {
      var property = dimensions[d][1];
      var account = property.match(/UA-(.+)-.*/)[1];
      var name = dimensions[d][2], index = dimensions[d][3], scope=dimensions[d][4], active=dimensions[d][5];
      var dimensionId="ga:dimension"+index;
      
      // Increment the number of dimensions updated and add the property to the array of updated properties if it's not already there.
      numDimensionsUpdated++;
      if (propertiesUpdated.indexOf(property) < 0) propertiesUpdated.push(property);
      
      // Attempt to get the property type from the Property API and set the maximum number of dimensions accordingly.
      try {
        var propertyType = Analytics.Management.Webproperties.get(account, property).level;
      } catch (e) {
        return "failed to get property level for "+ property;
      }
      var maxDimensions = (propertyType == "PREMIUM") ? 200 : 20;
      
      // If there is no dimension index, return an error to the user.
      if (index == "" || index == undefined) {
        return "Index for dimension '"+ name +" cannot be empty";
      }
      
      // If the index is higher than it can be for the property (type), return an error to the user.
      else if ((propertyType == "PREMIUM" && index > 200) || (propertyType == "STANDARD" && index > 20)) {
        return "Index value ("+ index 
        +") for dimension '"+ name +"' is too high ("
        + property +" is a "+ propertyType +" property and can only have up to "
        + maxDimensions +"dimensions)";
      }
      
      // If the index is valid, push the value to Google Analytics.
      else {
        
        // Attempt to get the index for the dimension in the sheet (the API throws an exception when no dimension exists for the index).
        try {
          
          // If the index exists, set the necessary values update the dimension
          if (Analytics.Management.CustomDimensions.get(account, property, dimensionId).index) {
            var resource = {"name":name, "scope":scope, "active":active};
            var options = {ignoreCustomDataSourceLinks: true};
            
            // Attempt to update the dimension through the API
            try { Analytics.Management.CustomDimensions.update(resource,account,property,dimensionId,options);
                } catch (e) {return "failed to update all custom dimensions\n"+ e.message}
          }
        }
        
        // As noted in the try-block comment above, if no dimension exists, the API throws an exception
        // if no dimension exists, catch this exception and set the necessary values to insert the dimension
        catch (e) {
          if (e.message.match(/ga:dimension(\d)+ not found/)) {
            var resource = {"index":index, "name":name, "scope":scope, "active":active};
            
            // Attempt to insert the dimension
            try { Analytics.Management.CustomDimensions.insert(resource,account,property); } catch (e) {return "failed to insert all custom dimensions\n"+ e.message}
          } else return "failed to insert all custom dimensions\n"+ e.message;
        }
      }        
    }
  }
  
  return "success";
}