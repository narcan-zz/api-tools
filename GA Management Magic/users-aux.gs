/* Management Magic for Google Analytics
*    Auxiliary functions for User Management
*
* Copyright ©2016 Gary Mu (Gary7135[at]gmail[dot]com)
***************************************************************************/


/**************************************************************************
* Adds a formatted sheet to the spreadsheet to faciliate data management.
*/
function formatUserSheet(createNew) {
  // Get common values
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var d = new Date();
  var sheetName = "Users@"+ d.getFullYear()+'-'+ (d.getMonth()+1) +'-'+d.getDate() +'-' + d.getMilliseconds();
  
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
  var cols = 5;
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
  
  var includeCol = sheet.getRange("A2:A");
  var propertyCol = sheet.getRange("B2:B");
  var viewCol = sheet.getRange("C2:C");
  var emailCol = sheet.getRange("D2:D");
  var permissionCol = sheet.getRange("E2:E");
  
  // set header values and formatting
  try {
    var headerRange = sheet.getRange(1,1,1,sheet.getMaxColumns()); //num columns should be 20
    ss.setNamedRange("header_row", headerRange);
    sheet.getRange("A1").setValue("Include in Update?");
    sheet.getRange("B1").setValue("Property ID");
    sheet.getRange("C1").setValue("View ID");
    sheet.getRange("D1").setValue("Email");
    sheet.getRange("E1").setValue("Permission");
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#4285F4");
    headerRange.setFontColor("#FFFFFF");
    
    // Include Column: modify data validation values
    var includeValues = ['✘', '✓'];
    var includeRule = SpreadsheetApp.newDataValidation().requireValueInList(includeValues, true).build();
    includeCol.setDataValidation(includeRule);
    
    // Permission Column: modify data validation values
    var permissionValues = ['MANAGE_USERS','READ_AND_ANALYZE', 'COLLABORATE,EDIT,MANAGE_USERS,READ_AND_ANALYZE', 'COLLABORATE,READ_AND_ANALYZE', 'COLLABORATE,EDIT,READ_AND_ANALYZE', 'COLLABORATE,MANAGE_USERS,READ_AND_ANALYZE'];
    var permissionRule = SpreadsheetApp.newDataValidation().requireValueInList(permissionValues, true).build();
    permissionCol.setDataValidation(permissionRule);
    
  } catch (e) {
    return "failed to set the header values and format ranges\n"+ e.message;
  }
  
  return sheet;
}