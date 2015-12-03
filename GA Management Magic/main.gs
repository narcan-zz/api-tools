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
      .addItem('List filters', 'requestFilterList')
      .addItem('Update filters', 'requestFilterUpdate')
      .addSeparator()
      .addItem('About this Add-on','about');
    } else {
      menu.addItem('List custom dimensions', 'requestCDList')
      .addItem('Update custom dimensions', 'requestCDUpdate')
      .addSeparator()
      .addItem('List filters', 'requestFilterList')
      .addItem('Update filters', 'requestFilterUpdate')
      .addSeparator()
      .addItem('About this Add-on','about');
    }
    menu.addToUi();
    
    // send Measurement Protocol hit to Google Analytics
    try {
      mpHit(ss.getUrl(),'open');
    } catch (error) {
      Logger.log("hit not sent: " + error.message);
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
  mpHit(ss.getUrl(),'edit');
}

/**************************************************************************
* Install function runs when the application is installed
*/
function onInstall(e) {
  onOpen(e);
  // send Measurement Protocol hit to Google Analytics
  mpHit(ss.getUrl(),'install');
}

/**
* Shows the side bar populated with the content from the instructions page
*/
function about() {
  var html = HtmlService.createHtmlOutputFromFile('about')
  .setSandboxMode(HtmlService.SandboxMode.IFRAME)
  .setTitle('About')
  .setWidth(300);
  
  SpreadsheetApp.getUi().showSidebar(html);
}

/**************************************************************************
* Example function for Google Analytics Measurement Protocol.
* @param {string} tid Tracking ID / Web Property ID
* @param {string} url Document location URL
*/
function mpHit(url, action){
  var hit, category = '';
  
  if (action == 'open' || action == '') {hit = 'pageview';} else {
    hit = 'event';
    category = 'interaction';
  }
  
  var payload = {'v': '1',
                 'tid': 'UA-42086200-17',
                 'cid': generateUUID_(),
                 'z': Math.floor(Math.random()*10E7),
                 't': hit,
                 'ds': 'web',
                 'dr': 'GA Management Magic Addon',
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