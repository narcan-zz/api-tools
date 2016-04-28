/* Management Magic for Google Analytics
*   Adds a menu item to manage Google Analytics Properties
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
* Copyright ©2016 Gary Mu (Gary7135[at]gmail[dot]com)
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
      menu.addItem('List filters', 'requestFilterList')
      .addItem('Update filters', 'requestFilterUpdate')
      .addSeparator()
      .addItem('List custom dimensions', 'requestCDList')
      .addItem('Update custom dimensions', 'requestCDUpdate')
      .addSeparator()
      .addItem('List users', 'requestUserList')
      .addSeparator()
      .addItem('List custom metrics', 'requestCMList')
      .addItem('Update custom metrics', 'requestCMUpdate')
      .addSeparator()
      .addItem('About this Add-on','about');
    } else {
      menu.addItem('List filters', 'requestFilterList')
      .addItem('Update filters', 'requestFilterUpdate')
      .addSeparator()
      .addItem('List custom dimensions', 'requestCDList')
      .addItem('Update custom dimensions', 'requestCDUpdate')
      .addSeparator()
      .addItem('List users', 'requestUserList')
      .addSeparator()
      .addItem('List custom metrics', 'requestCMList')
      .addItem('Update custom metrics', 'requestCMUpdate')
      .addSeparator()
      .addItem('About this Add-on','about');
    }
    menu.addToUi();
    
    // send Measurement Protocol hitType to Google Analytics
  } catch (e) {
    Browser.msgBox(e.message);
  }
}