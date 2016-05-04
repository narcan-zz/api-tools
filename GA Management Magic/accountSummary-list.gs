/* Management Magic for Google Analytics
*    List filters from a GA property
*
* Copyright ©2016 Gary Mu (Gary7135[at]gmail[dot]com)
***************************************************************************/


/**************************************************************************
* Obtains input from user necessary for listing filters
*/
function requestAccountSummary() {
  // List filters from all accounts entered by the user.
  var listAccountSummary = accountSummary();
    
  // Output errors and log successes.
  if (listAccountSummary != "success") {
    Browser.msgBox(listAccountSummary);
  } else {
    Logger.log("List filters response: "+ listAccountSummary);
  }
}

/**************************************************************************
* Lists filter settings from an account into a new sheet
* @param {string} account The account ID from which to list filters
* @return {string} Operation output ('success' or error message)
*/
function accountSummary() {
  // set common values
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allAccounts = [];
  var dataColumns = 8;

  // Attempt to get filters from the Management API.
  try {
    var accountSummary = Analytics.Management.AccountSummaries.list();
  } catch (e) {
    return "Error getting data from Mgmt API\n"+ e.message;
  }
  
  // Attempt to store the information received from the Management API in an array
  try {
    var account = [];
    // Parse each result of the API request and push it to an array
    for (var i = 0; i < accountSummary.totalResults; i++) {
      var a = accountSummary.items[i];
      var account_id = a.id;
      var account_name = a.name;
      //Get property data
      for (var j = 0; j < a.webProperties.length; j++){
        var p = a.webProperties[j];
        var property_id = p.id;
        var property_name = p.name;
        var level = p.level;

        //Get view data
        for (var k = 0; k < p.profiles.length; k++){
          var v = p.profiles[k];
          var view_id = v.id;
          var view_name = v.name;
          var type = v.type;
          account[i] = [account_id, account_name, property_id, property_name, level, view_id, view_name, type];
          allAccounts.push(account[i]); 
        }
      }
    }
    
  }catch(e){
   return e.message;}
  
  // Insert the values processed from the API into a formatted sheet
  try {    
    // Set the values in the sheet
    var sheet = formatAccountSummarySheet(true);
    sheet.getRange(2,1,allAccounts.length,dataColumns).setValues(allAccounts);
  } catch (e) {
    return e.message;
  }
  
  return "success";
}