/* Management Magic for Google Analytics
*    Updates custom metrics from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/

/*
When updating metrics, type "TIME" throws "internal error" on update, but not on list
  - fix this by adding the "min_value" property and assigning it a value of "0". (automatically gets populated in the UI when saving a TIME type custom metric.)
*/

/**************************************************************************
* Updates metric settings from the active sheet to a property
* @param {string} property The tracking ID of the property to update
*/
function updateCustomMetrics(property) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var account = property.match(/UA-(.+)-.*/)[1];
  
  try {
    // Attempt to get the web property before trying anything else
    Analytics.Management.Webproperties.get(account, property);
    // Attempt to get property information from the Management API
    try {
      var propertyType = Analytics.Management.Webproperties.get(account, property).level;
      var customMetricList = Analytics.Management.CustomMetrics.list(account, property);
    } catch (error) {
      Browser.msgBox(error.message);
    }
    
    // Process the information received from the Management API
    try {
      // set property type-specific values to access the different limits dynamically
      var propertyTypeSize = 20;
      var cmInfoRange = "standardCMInfo";
      if (propertyType == "PREMIUM") {
        propertyTypeSize = 200;
        cmInfoRange = "premiumCMInfo";
      }
      
      // Capture the current values of the range in the custom dimension sheet
      var cms = ss.getRangeByName(cmInfoRange).getValues();
      
      try {
        // Iterate through all possible custom dimensions and set a placeholder for those not set
        for (var i = 0; i < cms.length; i++) {
          var name = cms[i][0], index = cms[i][1], metricId="ga:metric"+index, scope=cms[i][2], active=cms[i][3];
          
          if (index <= propertyTypeSize && index != '') {            
            try {
              if (Analytics.Management.CustomMetrics.get(account, property, metricId).index) {
                //Update the values in Google Analytics to match the current row of the sheet
                Analytics.Management.CustomMetrics.update(
                  {"name":name, "scope":scope, "active":active},
                  account,
                  property,
                  metricId,
                  {ignoreCustomDataSourceLinks: true});
              }
            }
            catch (e) {
              Analytics.Management.CustomMetrics.insert(
                {"index":index,
                 "name":name,
                 "scope":scope,
                 "active":active},
                account,
                property);
            }
            
            // send Measurement Protocol hit to Google Analytics
            //mpHit(ss.getUrl(),'update custom metrics');
            
          }
        }
      } catch (error) {
        Browser.msgBox(error.message);
      }
    } catch (error) {
      Browser.msgBox("Something happened when updating metrics: " + error.message);
    }
  } catch (error) {
    Browser.msgBox(error.message);
  }
}