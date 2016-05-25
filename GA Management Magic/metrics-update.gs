/* Management Magic for Google Analytics
*    Updates custom dimensions from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
* Copyright ©2016 Gary Mu (Gary7135[at]gmail[dot]com)
***************************************************************************/


/**************************************************************************
* Obtains input from user necessary for updating custom dimensions.
*/
function requestCMUpdate() {
  // Check that the necessary named range exists.
  if (SpreadsheetApp.getActiveSpreadsheet().getRangeByName("header_row")) {
    
    // Update custom dimensions from the sheet.
    var updateMetricResponse = updateMetrics();
    
    // Output errors and log successes.
    if (updateMetricResponse != "success") {
      Browser.msgBox(updateMetricResponse);
    } else {
      Logger.log("Update custom metrics response: "+ updateMetricResponse)
    }
  }
  
  // If there is no named range (necessary to update values), format the sheet and display instructions to the user
  else {
    var sheet = formatMetricSheet(true);
    Browser.msgBox("Enter metric values into the sheet provided before requesting to update metric.")
  }
}

/**************************************************************************
* Updates dimension settings from the active sheet to a property.
* @return {string} Operation output ("success" or error message)
*/
function updateMetrics() {
  // set common values
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  debugger;
  var dataRange = sheet.getDataRange();
  var dataColumns = dataRange.getNumColumns(); 
  var dataRows = dataRange.getNumRows() - 1;
  var maxRows = (propertyType == "PREMIUM") ? 200 : 20;
  var numMetricsUpdated = 0;
  var propertiesUpdated = [];
  
  // Capture the sheet values.
  var metrics = sheet.getRange(2,1,dataRows,dataColumns).getValues();
  debugger;
  // Iterate through rows of values in the sheet.
  for (var d = 0; d < metrics.length; d++) {
    
    // Process values marked for inclusion.
    if (metrics[d][0]=='✓') {
      var property = metrics[d][1];
      var account = property.match(/UA-(.+)-.*/)[1];
      var name = metrics[d][2], index = metrics[d][3], scope=metrics[d][4], type=metrics[d][5], active = metrics[d][8];
      var metricId="ga:metric"+index;
      
      // Increment the number of dimensions updated and add the property to the array of updated properties if it's not already there.
      numMetricsUpdated++;
      if (propertiesUpdated.indexOf(property) < 0) propertiesUpdated.push(property);
      
      // Attempt to get the property type from the Property API and set the maximum number of dimensions accordingly.
      try {
        var propertyType = Analytics.Management.Webproperties.get(account, property).level;
      } catch (e) {
        return "failed to get property level for "+ property;
      }
      var maxMetrics = (propertyType == "PREMIUM") ? 200 : 20;
      
      // If there is no dimension index, return an error to the user.
      if (index == "" || index == undefined) {
        return "Index for metric '"+ name +" cannot be empty";
      }
      
      // If the index is higher than it can be for the property (type), return an error to the user.
      else if ((propertyType == "PREMIUM" && index > 200) || (propertyType == "STANDARD" && index > 20)) {
        return "Index value ("+ index 
        +") for metric '"+ name +"' is too high ("
        + property +" is a "+ propertyType +" property and can only have up to "
        + maxMetrics +"metrics)";
      }
      
      // If the index is valid, push the value to Google Analytics.
      else {
        
        // Attempt to get the index for the metric in the sheet (the API throws an exception when no metric exists for the index).
        try {
          
          // If the index exists, set the necessary values update the dimension
          if (Analytics.Management.CustomMetrics.get(account, property, metricId).index) {
            var resource = {"name":name, "scope":scope, "type": type,"active":active};
            var options = {ignoreCustomDataSourceLinks: true};
            
            // Attempt to update the dimension through the API
            try { Analytics.Management.CustomMetrics.update(resource,account,property,metricId,options);
                } catch (e) {return "failed to insert custom metrics"+ index +" \n."+ e.message}
          }
        }
        
        // As noted in the try-block comment above, if no dimension exists, the API throws an exception
        // if no dimension exists, catch this exception and set the necessary values to insert the dimension
        catch (e) {
          if (e.message.match(/ga:metric(\d)+ not found/)) {
            var resource = {"index":index, "name":name, "scope":scope,"type": type, "active":active};
            
            // Attempt to insert the metric
            try { Analytics.Management.CustomMetrics.insert(resource,account,property); } catch (e) {return "failed to insert custom metrics"+ index +" \n."+ e.message}
          } else return "failed to insert custom metrics"+ index +" \n."+ e.message;
        }
      }        
    }
  }
  
  return "success";
}