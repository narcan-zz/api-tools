/* Management Magic for Google Analytics
 *   Adds a menu item to manage Google Analytics Properties
 *   - @TODO expand to other management entities
 * 
 * Last updated: 2015.10.21
 *
 * Copyright ©2015 Pedro Avila (pdro@google.com)
 **************************************************************************/

/**************************************************************************
* Main function runs on application open, setting the menu of commands
*/
function onOpen(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  
  // create the addon menu
  try {
    var menu = ui.createAddonMenu();
    if (e && e.authMode == ScriptApp.AuthMode.NONE) {
      // Add a normal menu item (works in all authorization modes).
      menu.addItem('List custom dimensions', 'requestCDList')
      .addItem('Update custom dimensions', 'requestCDUpdate')
      .addSeparator()
      .addItem('About this Add-on','about');
    } else {
      menu.addItem('List custom dimensions', 'requestCDList')
      .addItem('Update custom dimensions', 'requestCDUpdate')
      .addSeparator()
      .addItem('About this Add-on','about');
    }
    menu.addToUi();
    
    // send Measurement Protocol hit to Google Analytics
    try {
      //sendGAMP("UA-42086200-17", ss.getUrl(),'open');
    } catch (error) {
      //ss.toast("hit not sent: " + error.message,"GA Test",3);
    }
    
  } catch (error) {
    Browser.msgBox(error.message);
  }
}

/**************************************************************************
* Edit function runs when the application is edited
*/
function onEdit(e) {
  // send Measurement Protocol hit to Google Analytics
  //sendGAMP("UA-42086200-19", ss.getUrl(),'edit');
}

/**************************************************************************
* Install function runs when the application is installed
*/
function onInstall(e) {
  onOpen(e);
  // send Measurement Protocol hit to Google Analytics
  //sendGAMP("UA-42086200-19", ss.getUrl(),'install');
}

/* Management Magic for Google Analytics
*   Adds a menu item to manage Google Analytics Custom Dimensions
*   - @TODO add check to ensure proper level of access to property
*   - @TODO expand to other management entities
* 
* Last updated: 2015.10.21
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
*/

/* Displays the custom dimensions for the property. All currently unset custom dimension slots are set with placeholder:
*  - name: "index"
*  - scope: "HIT"
*  - active: false
*/
function listCustomDimensions(account, property) {
  // Attempt to get property information from the Management API
  try {
    var propertyType = Analytics.Management.Webproperties.get(account, property).level;
    var customDimensionList = Analytics.Management.CustomDimensions.list(account, property);
  } catch (error) {
    Browser.msgBox(error.message);
  }
  
  // Process the information received from the Management API
  try {
    // set property type-specific values to access the different limits dynamically
    var propertyTypeSize = 20;
    var cdInfoRange = "standardCDInfo";
    if (propertyType == "PREMIUM") {
      propertyTypeSize = 200;
      cdInfoRange = "premiumCDInfo";
    }
    
    // capture the list of custom dimensions and create a 2d array to store what will be output to the sheet
    var cds = [];
    
    // Iterate through all possible custom dimensions and set a placeholder for those not set
    for (var i = 0; i < propertyTypeSize; i++) {
      // If the custom dimension for the current slot exists, get its values
      if (customDimensionList.items[i]) {
        var cdName = customDimensionList.items[i].name;
        var cdIndex = customDimensionList.items[i].index;
        var cdScope = customDimensionList.items[i].scope;
        var cdActive = customDimensionList.items[i].active;
        
        // Store the array of values into the ith slot of the 2d sheet array
        cds[i] = [cdName,cdIndex,cdScope,cdActive];
      }
      
      // If the custom dimension for the current slot does not exist, creat a place holder for it in the current slot of the 2d sheet array
      else {
        var cdName = "<available> dimension"+(i+1);
        var cdIndex = i+1;
        var cdScope = "HIT";
        var cdActive = "FALSE";
        /*        
        // Insert the place holder values into the Google Analytics Property
        Analytics.Management.CustomDimensions.insert(
        {"index":cdIndex,
        "name":cdName,
        "scope":cdScope,
        "active":cdActive}, 
        account, 
        property
        ).execute();
        */        
        // Store the array of values into the ith slot of the array
        cds[i] = [cdName,cdIndex,cdScope,cdActive];
      }
      
    }
  } catch (error) {
    Browser.msgBox(error.message);
  }
  
  // insert the values processed from the API into the sheet
  try {    
    var createNew = true;
    
    var newSheetName = "CDs from "+property;
    formatSheet(createNew, newSheetName);
    
    // Set the values in the sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ss.getRangeByName(cdInfoRange).setValues(cds);
  } catch (error) {
    Browser.msgBox(error.message);
  }
}

/* Management Magic for Google Analytics
*    Updates custom dimensions from a GA property
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/

/**************************************************************************
* Updates dimension settings from the active sheet to a property
* @param {string} property The tracking ID of the property to update
*/
function updateCustomDimensions(property) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var account = property.match(/UA-(.+)-.*/)[1];
  
  try {
    // Attempt to get the web property before trying anything else
    Analytics.Management.Webproperties.get(account, property);
    // Attempt to get property information from the Management API
    try {
      var propertyType = Analytics.Management.Webproperties.get(account, property).level;
      var customDimensionList = Analytics.Management.CustomDimensions.list(account, property);
    } catch (error) {
      Browser.msgBox(error.message);
    }
    
    // Process the information received from the Management API
    try {
      // set property type-specific values to access the different limits dynamically
      var propertyTypeSize = 20;
      var cdInfoRange = "standardCDInfo";
      if (propertyType == "PREMIUM") {
        propertyTypeSize = 200;
        cdInfoRange = "premiumCDInfo";
      }
      
      // Capture the current values of the range in the custom dimension sheet
      var cds = ss.getRangeByName(cdInfoRange).getValues();
      
      try {
        // Iterate through all possible custom dimensions and set a placeholder for those not set
        for (var i = 0; i < cds.length; i++) {
          var name = cds[i][0], index = cds[i][1], dimensionId="ga:dimension"+index, scope=cds[i][2], active=cds[i][3];
          
          if (index <= propertyTypeSize && index != '') {            
            try {
              if (Analytics.Management.CustomDimensions.get(account, property, dimensionId).index) {
                //Update the values in Google Analytics to match the current row of the sheet
                Analytics.Management.CustomDimensions.update(
                  {"name":name, "scope":scope, "active":active},
                  account,
                  property,
                  dimensionId,
                  {ignoreCustomDataSourceLinks: true});
              }
            }
            catch (e) {
              Analytics.Management.CustomDimensions.insert(
                {"index":index,
                 "name":name,
                 "scope":scope,
                 "active":active},
                account,
                property);
            }
            
            // send Measurement Protocol hit to Google Analytics
            //sendGAMP("UA-42086200-17", ss.getUrl(),'update custom dimensions');
            
          }
        }
      } catch (error) {
        Browser.msgBox(error.message);
      }
    } catch (error) {
      Browser.msgBox("Something happened when updating dimensions: " + error.message);
    }
  } catch (error) {
    Browser.msgBox(error.message);
  }
}

/* Management Magic for Google Analytics
*    Auxiliary functions for CD Management
*     - requestCDList
*     - requestCDUpdate
*     - formatSheet
*     - about
*     - sendGAMP
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/

/**************************************************************************
* Obtains input from user necessary for listing custom dimensions.
*
*/
function requestCDList() {
  // Display a dialog box with a title, message, input field, and "OK" and "Cancel" buttons. The
  // user can also close the dialog by clicking the close button in its title bar.
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Property ID', 'Enter the ID of the property from which to list custom dimensions: ', ui.ButtonSet.OK_CANCEL);
  
  // Process the user's response.
  if (response.getSelectedButton() == ui.Button.OK) {
    Logger.log('The user entered property ID: %s.', response.getResponseText());
    var property = response.getResponseText();
    var account = property.match(/UA-(.+)-.*/)[1];
    
    // validate entry before listing CDs
    if (property.match(/UA-\d+-\d+/)){
      try {
        Analytics.Management.Webproperties.get(account, property);
        listCustomDimensions(account, property);
      } catch (error) {
        Browser.msgBox("Invalid property ID");
      }
    }
    else {
      Browser.msgBox("Invalid property ID");
    }
  } else if (response.getSelectedButton() == ui.Button.CANCEL) {
    Logger.log('The user did not provide a property ID.');
  } else {
    Logger.log('The user clicked the close button in the dialog\'s title bar.');
  }
}

/**************************************************************************
* Obtains input from user necessary for updating custom dimensions.
*/
function requestCDUpdate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // check that the necessary named range exists for the update to successfully update dimension values.
  if (ss.getRangeByName("premiumCDInfo") || ss.getRangeByName("standardCDInfo")) {
    // Display a dialog box with a title, message, input field, and "OK" and "Cancel" buttons. The
    // user can also close the dialog by clicking the close button in its title bar.
    var ui = SpreadsheetApp.getUi();
    var response = ui.prompt('Property ID List', 'Enter one or more property IDs (separated by commas) to receive updated custom dimensions: ', ui.ButtonSet.OK_CANCEL);
    var invalidPropertyList = [];
    
    // Process the user's response.
    if (response.getSelectedButton() == ui.Button.OK) {
      Logger.log('The user entered property ID: %s.', response.getResponseText());
      var propertyList = response.getResponseText();
      var propertyListArray = propertyList.split(/\s*,\s*/);
      
      for (i = 0; i < propertyListArray.length; i++) {
        // validate entry before listing CDs
        var property = propertyListArray[i];
        if (property.match(/UA-\d+-\d+/)) {
          var account = property.match(/UA-(.+)-.*/)[1];
          try {
            Analytics.Management.Webproperties.get(account, property);
            updateCustomDimensions(property);//
          } catch (error) {
            invalidPropertyList.push(propertyListArray[i]+"\n");//Browser.msgBox("Invalid property ID");
          }
        }
        else {
          invalidPropertyList.push(propertyListArray[i]+"\n");
        }
      }
      
      // If any properties were invalid, expose them to the user
      if (invalidPropertyList.length > 0) {
        Browser.msgBox("The following property IDs were invalid: " + invalidPropertyList)
      }
      
    } else if (response.getSelectedButton() == ui.Button.CANCEL) {
      Logger.log('The user did not provide a property ID.');
    } else {
      Logger.log('The user clicked the close button in the dialog\'s title bar.');
    }
  } else { // if the named range necessary for the function to update dimension values does not exist, format the sheet and display instructions to the user
    var createNew = true;
    formatSheet(createNew);
    Browser.msgBox("Enter dimension values into the sheet provided before requesting to update dimensions.")
  }
}

/**************************************************************************
* Adds a formatted sheet to the spreadsheet to faciliate data management.
*/
function formatSheet(createNew, sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var proceed = false;
  var date = new Date();
  
  if (createNew === undefined) { createNew = false; }
  if (sheetName === undefined) {
    sheetName = "@" + date.getTime();
  } else {
    sheetName = sheetName + " @" + date.getTime();
  }
  
  try {
    if (createNew) {
      // Insert a new sheet into the current spreadsheet to hold the listed dimensions
      ss.insertSheet(sheetName, 0);
      var sheet = ss.getActiveSheet();
      proceed = true;
    } else if (!createNew) {
      // Show warning to user and ask to proceed
      var response = ui.alert("WARNING: This will erase all data on the current sheet", "Would you like to proceed?", ui.ButtonSet.YES_NO);
      
      // Process the user's response
      if (response == ui.Button.YES) {
        var sheet = ss.getActiveSheet();
        sheet.setName(sheetName);
        proceed = true;
      } else if (response == ui.Button.NO) {
        ui.alert('Format cancelled.');
      } else {
        Logger.log('The user clicked the close button in the dialog\'s title bar.');
      }
    }
  } catch (error) {
    Browser.msgBox(error.message);
  }
  
  if (proceed) {
    try {
      // set local vars
      var rows = 201;
      var cols = 4;
      var numRows = sheet.getMaxRows();
      var numCols = sheet.getMaxColumns();
      var deltaRows = numRows-rows;
      var deltaCols = numCols-cols;
      
      // delete unwanted rows/columns
      if (deltaRows > 0) {
        sheet.deleteRows(rows, deltaRows);
      } else if (deltaRows < 0) {
        sheet.insertRowsAfter(numRows, -deltaRows);
      }
      if (deltaCols > 0) {
        sheet.deleteColumns(cols, deltaCols);
      } else if (deltaCols < 0) {
        sheet.insertColumnsAfter(numCols, -deltaCols);
      }
      
      // Note: try-catch blocks in use here due to b/15350353
      try {
        // remove non-formatted ranges
        try {if (ss.getRangeByName("premiumCDInfo")) ss.removeNamedRange("premiumCDInfo");} catch (e) {ss.removeNamedRange("premiumCDInfo");}
        try {if (ss.getRangeByName("standardCDInfo")) ss.removeNamedRange("standardCDInfo");} catch (e) {ss.removeNamedRange("standardCDInfo");}
      } catch (error) {
        Browser.msgBox("Something happened when removing non-formatted named ranges: " + error.message);
      }
      
      // set/name ranges
      var standardCDInfoRange = sheet.getRange("A2:D21");
      var premiumCDInfoRange = sheet.getRange("A2:D201");
      ss.setNamedRange("standardCDInfo", standardCDInfoRange);
      ss.setNamedRange("premiumCDInfo", premiumCDInfoRange);
      
      var indexCol = sheet.getRange("B2:B");
      var scopeCol = sheet.getRange("C2:C");
      var activeCol = sheet.getRange("D2:D");
      
      // set header values and formatting
      var menuRange = sheet.getRange("A1:D1");
      sheet.getRange("A1").setValue("Name");
      sheet.getRange("B1").setValue("Index");
      sheet.getRange("C1").setValue("Scope");
      sheet.getRange("D1").setValue("Active");
      menuRange.setFontWeight("bold");
      menuRange.setBackground("#4285F4");
      menuRange.setFontColor("#FFFFFF");
      
      // Index Column: protect & set background & font color
      indexCol.protect().setDescription("prevent others from modifying the CD indices");
      indexCol.setBackground("#BABABA");
      indexCol.setFontColor("#FFFFFF");
      
      // Scope Column: modify data validation values
      var scopeValues = ['USER','SESSION','HIT','PRODUCT'];
      var scopeRule = SpreadsheetApp.newDataValidation().requireValueInList(scopeValues, true).build();
      scopeCol.setDataValidation(scopeRule);
      
      // Active Column: modify data validation values
      var activeValues = ['TRUE','FALSE'];
      var activeRule = SpreadsheetApp.newDataValidation().requireValueInList(activeValues, true).build();
      activeCol.setDataValidation(activeRule);
      
      // send Measurement Protocol hit to Google Analytics
      //sendGAMP("UA-42086200-17", ss.getUrl(),'format custom dimension sheet');
      
    } catch (error) {
      Browser.msgBox(error.message);
    }
  }
}

/**************************************************************************
* Obtains text about the app (from GitHub repo)
*/
function about() {
  Browser.msgBox('https://github.com/narcan/tools/blob/master/Management%20Magic/README.md');
}

/**************************************************************************
* Example function for Google Analytics Measurement Protocol.
* @param {string} tid Tracking ID / Web Property ID
* @param {string} url Document location URL
*/
function sendGAMP(tid, url, action){
  var hit, category;
  
  if (action == 'open' || action == '') {hit = 'pageview';} else {
    hit = 'event';
    category = 'interaction';
  }
  
  var payload = {'v': '1',
                 'tid': tid,
                 'cid': generateUUID_(),
                 'z': Math.floor(Math.random()*10E7),
                 't': hit,
                 'ds': 'web',
                 'dr': 'Google Analytics Management Addon',
                 'dl': url,
                 'ec': category,
                 'ea': action
                };
  var options = {'method' : 'POST',
                 'payload' : payload
                };
  UrlFetchApp.fetch('https://www.google-analytics.com/collect', options);
}

// http://stackoverflow.com/a/2117523/1027723
function generateUUID_(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}