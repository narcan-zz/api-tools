/* Management Magic for Google Analytics
*    Auxiliary functions for CD Management
*
* Copyright ©2016 Gary Mu (Gary7135[at]gmail[dot]com)
***************************************************************************/


/**************************************************************************
* Adds a formatted sheet to the spreadsheet to faciliate data management.
*/
function formatAccountSummarySheet(createNew) {
  // Get common values
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var d = new Date();
  var sheetName = "AccountSummary@"+ d.getFullYear()+'-'+ (d.getMonth()+1) +'-'+d.getDate() +'-' + d.getMilliseconds();
  
  // Normalize/format the values of the parameters
  createNew = (createNew === undefined) ? false : createNew;
  
  // Insert a new sheet or warn the user that formatting will erase data on the current sheet
  try {
    if (createNew) {
      sheet = ss.insertSheet(sheetName, 0);
    } else if (!createNew) {
      // Show warning to user and ask to proceed
      var response = ui.alert("WARNING: This will erase all data on the current sheet", "Would you like to proceed?", ui.ButtonSet.YES_NO);
      if (response == ui.Button.YES) {
        sheet.setName(sheetName);
      } else if (response == ui.Button.NO) {
        ui.alert('Format cancelled.');
        return sheet;
      } else {
        Logger.log('The user clicked the close button in the dialog\'s title bar.');
        return sheet;
      }
    }
  } catch (error) {
    Browser.msgBox(error.message);
    return sheet;
  }
  
  // set local vars
  var cols = 8;
  var numRows = sheet.getMaxRows();
  var numCols = sheet.getMaxColumns();
  var deltaCols = numCols - cols;
  
  // set the number of columns
  try {
    if (deltaCols > 0) {
      sheet.deleteColumns(cols, deltaCols);
    } else if (deltaCols < 0) {
      sheet.insertColumnsAfter(numCols, -deltaCols);
    }
  } catch (e) {
    return "failed to set the number of columns\n"+ e.message;
  }
  
  var accountIDCol = sheet.getRange("A2:A");
  var accountNameCol = sheet.getRange("B2:B");
  var propertyIDCol = sheet.getRange("C2:C");
  var propertyNameCol = sheet.getRange("D2:D");
  var propertyLevelCol = sheet.getRange("E2:E");
  var viewIDCol = sheet.getRange("F2:F");
  var viewNameCol = sheet.getRange("G2:G");
  var viewTypeCol = sheet.getRange("H2:H");
  
  // set header values and formatting
  try {
    var headerRange = sheet.getRange(1,1,1,sheet.getMaxColumns()); //num columns should be 20
    ss.setNamedRange("header_row", headerRange);
    sheet.getRange("A1").setValue("Account ID");
    sheet.getRange("B1").setValue("Account Name");
    sheet.getRange("C1").setValue("Property ID");
    sheet.getRange("D1").setValue("Property Name");
    sheet.getRange("E1").setValue("Property Level");
    sheet.getRange("F1").setValue("View ID");
    sheet.getRange("G1").setValue("View Name");
    sheet.getRange("H1").setValue("View Type");
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#4285F4");
    headerRange.setFontColor("#FFFFFF");
    
  } catch (e) {
    return "failed to set the header values and format ranges\n"+ e.message;
  }
  
  return sheet;
}