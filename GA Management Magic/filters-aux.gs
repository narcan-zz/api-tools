/* Management Magic for Google Analytics
*    Auxiliary functions for Filter Management
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/


/**************************************************************************
* Adds a formatted sheet to the spreadsheet to faciliate data management.
* @param {boolean} createNew A boolean flag indicating whether to create a new sheet or format the current one
* @return {string} the formatted sheet name
*/
function formatFilterSheet(createNew) {
  // Get common values.
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var date = new Date();
  var sheetName = "Filters@"+ date.getTime();
  var NUMBER_OF_COLUMNS = 20;
  
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
        SpreadsheetApp.getActiveRange().clearDataValidations();
        sheet.clear();
        sheet.setName(sheetName);
      } else if (response == ui.Button.NO) {
        ui.alert('Format cancelled.');
        return sheet;
      } else {
        console.log(response);
        return sheet;
      }
    }
  } catch (error) {
    Browser.msgBox(error.message);
    return sheet;
  }
  
  // set local vars
  var numRows = sheet.getMaxRows();
  var numCols = sheet.getMaxColumns();
  var deltaCols = numCols - NUMBER_OF_COLUMNS;
  
  // set the number of columns
  try {
    if (deltaCols > 0) {
      sheet.deleteColumns(NUMBER_OF_COLUMNS, deltaCols);
    } else if (deltaCols < 0) {
      sheet.insertColumnsAfter(numCols, -deltaCols);
    }
  } catch (e) {
    return "failed to set the number of columns\n"+ e.message;
  }
  
  // Set ranges.
  var includeCol = sheet.getRange("A2:A");
  var idCol = sheet.getRange("C2:C");
  var typeCol = sheet.getRange("E2:E");
  var fieldARequiredCol = sheet.getRange("M2:M");
  var fieldBRequiredCol = sheet.getRange("P2:P");
  var outputConstructorCol = sheet.getRange("R2:R");
  var overrideOutputFieldCol = sheet.getRange("S2:S");
  var caseCol = sheet.getRange("T2:T");
  
  // Set header range, values and formatting.
  try {
    var headerRange = sheet.getRange(1,1,1,sheet.getMaxColumns());
    sheet.getRange("A1").setValue("Include");
    sheet.getRange("B1").setValue("Account");
    sheet.getRange("C1").setValue("ID");
    sheet.getRange("D1").setValue("Name");
    sheet.getRange("E1").setValue("Type");
    sheet.getRange("F1").setValue("field");
    sheet.getRange("G1").setValue("matchType");
    sheet.getRange("H1").setValue("expressionValue");
    sheet.getRange("I1").setValue("searchString");
    sheet.getRange("J1").setValue("replaceString");
    sheet.getRange("K1").setValue("fieldA");
    sheet.getRange("L1").setValue("extractA");
    sheet.getRange("M1").setValue("fieldARequired");
    sheet.getRange("N1").setValue("fieldB");
    sheet.getRange("O1").setValue("extractB");
    sheet.getRange("P1").setValue("fieldBRequired");
    sheet.getRange("Q1").setValue("outputToField");
    sheet.getRange("R1").setValue("outputConstructor");
    sheet.getRange("S1").setValue("overrideOutputField");
    sheet.getRange("T1").setValue("caseSensitive");
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#4285F4");
    headerRange.setFontColor("#FFFFFF");
    
    // Index Column: protect & set background & font color.
    idCol.protect().setDescription("prevent others from modifying the ids");
    idCol.setBackground("#BABABA");
    idCol.setFontColor("#FFFFFF");
    
    // Include Column: modify data validation values.
    var includeValues = ['✓'];
    var includeRule = SpreadsheetApp.newDataValidation().requireValueInList(includeValues, true).build();
    includeCol.setDataValidation(includeRule);
    
    // Type Column: modify data validation values.
    var typeValues = ['INCLUDE', 'EXCLUDE', 'LOWERCASE', 'UPPERCASE', 'SEARCH_AND_REPLACE', 'ADVANCED'];
    var typeRule = SpreadsheetApp.newDataValidation().requireValueInList(typeValues, true).build();
    typeCol.setDataValidation(typeRule);
    
    // Set data validation for T/F columns (fieldA, fieldB, overrideOutputField, caseSensitive)
    var tfValues = ['TRUE', 'FALSE'];
    var tfRule = SpreadsheetApp.newDataValidation().requireValueInList(tfValues, true).build();
    fieldARequiredCol.setDataValidation(tfRule);
    fieldBRequiredCol.setDataValidation(tfRule);
    overrideOutputFieldCol.setDataValidation(tfRule);
    caseCol.setDataValidation(tfRule);
  } catch (e) {
    return "failed to set the header values and format ranges\n"+ e.message;
  }
  
  // send Measurement Protocol hit to Google Analytics
  var label = '';
  var value = '';
  var httpResponse = mpHit(SpreadsheetApp.getActiveSpreadsheet().getUrl(),'format list sheet',label,value);
  Logger.log(httpResponse);
  
  return sheet.getSheetName();
}