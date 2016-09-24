/* Management Magic for Google Analytics
*    Updates metrics from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/


/**************************************************************************
* Obtains input from user necessary for updating metrics.
*/
function requestMetricUpdate() {
  // set common values
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dataRange = sheet.getDataRange();
  
  if (dataRange){
    var dataRows = dataRange.getNumRows() - 1;
    var dataColumns = dataRange.getNumColumns();
    var METRIC_DATA_COLUMNS = 9; // number of data columns that there should be
  
    // Only attempt to update data if the data format is correct
    if (dataRows > 0 && dataColumns == METRIC_DATA_COLUMNS) {
      var metrics = sheet.getRange(2,1,dataRows,dataColumns).getValues();
      var updateMetricResponse = updateMetrics(metrics);
      console.log(updateMetricResponse);
      
      // Output errors and log successes.
      if (updateMetricResponse != "success") {
        Browser.msgBox(updateMetricResponse);
      } else {
        Logger.log("Update metrics response: "+ updateMetricResponse)
      }
    }
    
    // If there is no named range (necessary to update values), format the sheet and display instructions to the user
    else {
      var sheet = formatMetricSheet(true);
      Browser.msgBox("Enter metric values into the sheet provided before requesting to update metrics.")
    }
  }
  
  // If there is no data in the sheet, format the sheet and display instructions to the user
  else {
    var sheet = formatMetricSheet(false);
    Browser.msgBox("Enter metric values into the sheet provided before requesting to update metrics.")
  }
}

/**************************************************************************
* Updates metric settings from the active sheet to a property.
* @return {string} Operation output ("success" or error message)
*/
function updateMetrics(metrics) {
  // set common values
  var maxRows = (propertyType == "PREMIUM") ? 200 : 20;
  var numMetricsUpdated = 0;
  var propertiesUpdated = [];
  
  // Iterate through rows of values in the sheet.
  for (var d = 0; d < metrics.length; d++) {
    
    // Process values marked for inclusion.
    if (metrics[d][0]) {
      var property = metrics[d][1];
      var account = property.match(/UA-(.+)-.*/)[1];
      var name = metrics[d][2], index = metrics[d][3], scope=metrics[d][4], type=metrics[d][5], min=metrics[d][6], max=metrics[d][7], active=metrics[d][8];
      var metricId="ga:metric"+index;
      
      // Increment the number of metrics updated and add the property to the array of updated properties if it's not already there.
      numMetricsUpdated++;
      if (propertiesUpdated.indexOf(property) < 0) propertiesUpdated.push(property);
      
      // Attempt to get the property type from the Property API and set the maximum number of metrics accordingly.
      try {
        var propertyType = Analytics.Management.Webproperties.get(account, property).level;
      } catch (e) {
        return "failed to get property level for "+ property;
      }
      var maxMetrics = (propertyType == "PREMIUM") ? 200 : 20;
      
      // If there is no metric index, return an error to the user.
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
          
          // If the index exists, set the necessary values update the metric
          if (Analytics.Management.CustomMetrics.get(account, property, metricId).index) {
            var resource = {"name":name,"scope":scope,"type":type,"minimum":min,"maximum":max,"active":active};
            var options = {ignoreCustomDataSourceLinks: true};
            
            // Attempt to update the metric through the API
            try { Analytics.Management.CustomMetrics.update(resource,account,property,metricId,options);
                } catch (e) {return "failed to update all metrics\n"+ e.message}
          }
        }
        
        // As noted in the try-block comment above, if no metric exists, the API throws an exception
        // if no metric exists, catch this exception and set the necessary values to insert the metric
        catch (e) {
          if (e.message.match(/ga:metric(\d)+ not found/)) {
            var resource = {"index":index,"name":name,"scope":scope,"type":type,"minimum":min,"maximum":max,"active":active};
            
            // Attempt to inser the metric
            try { Analytics.Management.CustomMetrics.insert(resource,account,property); } catch (e) {return "failed to insert all metrics\n"+ e.message}
          } else return "failed to insert all metrics\n"+ e.message;
        }
      }        
    }
  }
  
  // send Measurement Protocol hit to Google Analytics
  var label = propertiesUpdated;
  var value = numMetricsUpdated;
  var httpResponse = mpHit(SpreadsheetApp.getActiveSpreadsheet().getUrl(),'update metrics',label,value);
  Logger.log(httpResponse);
  
  return "success";
}