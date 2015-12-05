
var automationSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Automation Set-Up");
//var GTM_ACCOUNT_ID = automationSheet.getRange("B8").getValue();
var GTM_ACCOUNT_ID = '132607215'
var GTM_CONTAINER_SITE_ID = automationSheet.getRange("B10").getValue();
var GTM_CONTAINER_ID = automationSheet.getRange("B11").getValue();
//var GA_ACCOUNT_ID = automationSheet.getRange("B13").getValue();
var GA_ACCOUNT_ID = '62200884'
var GA_PROPERTY_ID = automationSheet.getRange("B14").getValue();
var DL_PREFIX = automationSheet.getRange("B17").getValue();

function onOpen(e) {
  var menu = SpreadsheetApp.getUi().createAddonMenu(); // Or DocumentApp or FormApp.
  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    // Add a normal menu item (works in all authorization modes).
    menu.addItem('Approve GTM Access', 'aprroveGtmAccess');
    menu.addItem('Restart Automation Set-up', 'restartAutomationSetup');
    menu.addItem('Get GTM Containers', 'getGtmInfo');
    menu.addItem('Get GA Properties', 'getGaInfo');
    menu.addItem('Get dataLayer & GTM Code', 'getDlGtmCode');
    menu.addItem('Set-Up dataLayer QA Tag in GTM', 'createQaTriggersTag');
    menu.addItem('Set-Up GTM Triggers & Variables', 'setUpGtmVarsTriggers');
    menu.addItem('Set-Up CDs / CMs in GA & GA Tags in GTM', 'setUpGtmGa');
    menu.addItem('Set-Up Adometry Tags in GTM', 'createAllAdometryTagsInGtm');
    menu.addItem('Get QA Tag', 'getQaTag');
  } else {
    menu.addItem('Approve GTM Access', 'aprroveGtmAccess');
    menu.addItem('Restart Automation Set-up', 'restartAutomationSetup');
    menu.addItem('Get GTM Containers', 'getGtmInfo');
    menu.addItem('Get GA Properties', 'getGaInfo');
    menu.addItem('Get dataLayer & GTM Code', 'getDlGtmCode');
    menu.addItem('Set-Up dataLayer QA Tag in GTM', 'createQaTriggersTag');
    menu.addItem('Set-Up GTM Triggers & Variables', 'setUpGtmVarsTriggers');
    menu.addItem('Set-Up CDs / CMs in GA & GA Tags in GTM', 'setUpGtmGa');
    menu.addItem('Set-Up Adometry Tags in GTM', 'createAllAdometryTagsInGtm');
    menu.addItem('Get QA Tag', 'getQaTag');
    // Add a menu item based on properties (doesn't work in AuthMode.NONE).
    /*var properties = PropertiesService.getDocumentProperties();
    var workflowStarted = properties.getProperty('workflowStarted');
    if (workflowStarted) {
    menu.addItem('Check workflow status', 'checkWorkflow');
    } else {
    menu.addItem('Start workflow', 'startWorkflow');
    }*/
    // Record analytics.
    //UrlFetchApp.fetch('http://www.example.com/analytics?event=open');
  }
  menu.addToUi();
}

function aprroveGtmAccess(){
  
  showGtmSidebar()
  
}

function restartAutomationSetup(){
  
  automationSheet.getRange("B3").setValue('')
  automationSheet.getRange("B3").setBackground('white')
  automationSheet.getRange("B5").setValue('')
  automationSheet.getRange("B5").setBackground('white')
  automationSheet.getRange("B18").setValue('')
  automationSheet.getRange("B18").setBackground('white')
  automationSheet.getRange("B21").setValue('')
  automationSheet.getRange("B21").setBackground('white')
  automationSheet.getRange("B22").setValue('')
  automationSheet.getRange("B22").setBackground('white')
  automationSheet.getRange("B25").setValue('')
  automationSheet.getRange("B25").setBackground('white')
  
  getGtmAccountsRequest()
  getGtmContainersRequest()
  getGaProperties()
  
  var output = '<p>You are now ready to start the automation process again</p>';
  
  var htmlOutput = HtmlService
  .createHtmlOutput( output )
  .setSandboxMode(HtmlService.SandboxMode.IFRAME)
  .setWidth(650)
  .setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Restart Automation Set-up');
  
}

function getGtmInfo(){
  
  getGtmAccountsRequest()
  getGtmContainersRequest()
  
}

function getGaInfo(){
  
  getGaProperties()
  //getGaCustomDimensions()
  //getGaCustomMetrics()
}

function getDlGtmCode(){
  
  createDataLayerCode()
  
}

function createQaTriggersTag(){
  
  createAllPagesDebugTrigger();
  createAllEventsDebugTrigger();
  createGtmVariablesDataLayerIndexed();
  createQaTagInGtm();
  automationSheet.getRange("B21").setValue('DONE - ' + new Date() )
  automationSheet.getRange("B21").setBackground('#6aa84f')
  
  var output = '<p>Enable Preview Mode in GTM to see dataLayer QA results in the console.</p><p>Enable persist mode in the console to see your results for events.</p><p>Copy and paste the results into the tab "dataLayer QA"</p>';
  
  var htmlOutput = HtmlService
  .createHtmlOutput( output )
  .setSandboxMode(HtmlService.SandboxMode.IFRAME)
  .setWidth(650)
  .setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Set-Up QA DataLayer Tag in GTM Complete');
  
}

function setUpGtmVarsTriggers(){
  
  createGtmVariablesFromDataLayer()
  createGtmTriggersFromDataLayer()
  automationSheet.getRange("B25").setValue('DONE - ' + new Date() )
  automationSheet.getRange("B25").setBackground('#6aa84f')
}

function setUpGtmGa(){
  
  createAllGoogleAnalyticsTagsInGtm()
  
}

function getQaTag(){
  
}

function getGaAccounts() {
  
  var accounts = Analytics.Management.Accounts.list();
  
  var accountsObj = {}
  if (accounts.items && accounts.items.length) {
    for (var i = 0; i < accounts.items.length; i++) {
      var account = accounts.items[i];
      
      accountsObj[account.id] = account
      //Logger.log(JSON.stringify(account))
      //Logger.log('Account: name "%s", id "%s".', account.name, account.id);
      
      // List web properties in the account.
      // listWebProperties(account.id);
    }
  } else {
    Logger.log('No accounts found.');
  }
  
  return accountsObj
  
}

function getGaProperties() {
  var accounts = getGaAccounts()
  //Logger.log(accounts)
  var properties = Analytics.Management.Webproperties.list('~all')
  var accountsProperties = []
  if (properties.items && properties.items.length) {
    for (var i = 0; i < properties.items.length; i++) {
      var property = properties.items[i];
      property.accountName = [accounts[property.accountId].name]
      accountsProperties.push([property.accountName, property.accountId, property.name, property.id, property.level, property.accountName + ' - ' + property.name])
      //Logger.log(JSON.stringify(property))
      //Logger.log('Account: name "%s", id "%s".', account.name, account.id);
      
      // List web properties in the account.
      // listWebProperties(account.id);
    }
    
    Logger.log(accountsProperties.length)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("GA Properties");
    
    //getRange(row, column, numRows, numColumns)
    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn()
    sheet.getRange(2, 1, lastRow, 6).clear();
    sheet.getRange(2, 1, accountsProperties.length, 6).setValues(accountsProperties);
    
    var output = '<p>' + accountsProperties.length +
      ' Google Analytics Properties retrieved.</p>' + 
        '<p>Select the property you want to set-up in the dropdown in the <strong>Automation Set-Up</strong> tab.</p>';
    
    var htmlOutput = HtmlService
    .createHtmlOutput( output )
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setWidth(650)
    .setHeight(200);
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Containers List Refresh Complete');
    
    automationSheet.getRange("B5").setValue('DONE - ' + new Date() )
    automationSheet.getRange("B5").setBackground('#6aa84f')
    
  } else {
    Logger.log('No accounts found.');
  }
  
}

function getGaCdIndexedObject(){
  
  Logger.log(JSON.stringify(getGaCustomDimensions('indexedObject')))
  
}

function getGaCustomDimensions(usageType) {
  
  var usageType = !!usageType ? usageType : 'default' 
  
  var dimensions = Analytics.Management.CustomDimensions.list(GA_ACCOUNT_ID, GA_PROPERTY_ID)
  var dimensionsIndexedObj = {}
  //Logger.log(usageType)
  
  /*
  {"scope":"HIT",
  "id":"ga:dimension1",
  "parentLink":{"href":"https://www.googleapis.com/analytics/v3/management/accounts/62200884/webproperties/UA-62200884-1",
  "type":"analytics#webproperty"},
  "kind":"analytics#customDimension",
  "created":"2015-09-27T16:29:29.828Z",
  "index":1,
  "active":true,
  "webPropertyId":"UA-62200884-1",
  "selfLink":"https://www.googleapis.com/analytics/v3/management/accounts/62200884/webproperties/UA-62200884-1/customDimensions/ga:dimension1",
  "accountId":"62200884",
  "name":"Page Type","updated":"2015-09-27T16:29:29.828Z"}
  */
  
  if (dimensions.items && dimensions.items.length) {
    
    var dimensionsValues = dimensions.items.map(function(obj){ 
      //Logger.log(JSON.stringify(obj))
      dimensionsIndexedObj[obj.name+'-'+obj.scope] = obj
      return [obj.accountId, obj.webPropertyId, obj.id, obj.index, obj.name, obj.scope, obj.active];
    });
    
    if (usageType == 'default'){
      //Logger.log(dimensionsValues)
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("GA Dimensions");
      
      //getRange(row, column, numRows, numColumns)
      var lastRow = sheet.getLastRow();
      var lastColumn = sheet.getLastColumn()
      sheet.getRange(2, 1, lastRow, dimensionsValues[0].length).clear();
      sheet.getRange(2, 1, dimensionsValues.length, dimensionsValues[0].length).setValues(dimensionsValues);
    } else if (usageType == 'indexedObject'){
      
      //Logger.log('dimensionsIndexedObj')
      return dimensionsIndexedObj
      
    }
    
    
  } else {
    
    return {};
    //Logger.log('No custom dimensions found.');
  }
  
}

function createGaCustomDimension(name,scope,active){
  
  var newDimension = Analytics.newCustomDimension();
  newDimension.name  = name;
  newDimension.scope = scope;
  newDimension.active = active;
  var dimensions = Analytics.Management.CustomDimensions.insert(newDimension, GA_ACCOUNT_ID, GA_PROPERTY_ID)
  //Logger.log(dimensions.index)
  return dimensions.index
  
}

function getGaCustomMetrics(usageType) {
  
  var usageType = !!usageType ? usageType : 'default' 
  
  var metrics = Analytics.Management.CustomMetrics.list(GA_ACCOUNT_ID, GA_PROPERTY_ID)
  var metricsIndexedObj = {}
  
  /*
  "type":"CURRENCY",
  "scope":"PRODUCT",
  "id":"ga:metric1",
  "parentLink":{"href":"https://www.googleapis.com/analytics/v3/management/accounts/62200884/webproperties/UA-62200884-1","type":"analytics#webproperty"},
  "kind":"analytics#customMetric",
  "created":"2015-09-27T17:01:16.538Z",
  "index":1,
  "active":true,
  "webPropertyId":"UA-62200884-1",
  "selfLink":"https://www.googleapis.com/analytics/v3/management/accounts/62200884/webproperties/UA-62200884-1/customMetrics/ga:metric1",
  "accountId":"62200884",
  "name":"Produc Sale Price",
  "updated":"2015-09-27T17:01:34.677Z"}
  */
  
  if (metrics.items && metrics.items.length) {
    
    var metricsValues = metrics.items.map(function(obj){ 
      //Logger.log(JSON.stringify(obj))
      metricsIndexedObj[obj.name+'-'+obj.scope+'-'+obj.type] = obj
      return [obj.accountId, obj.webPropertyId, obj.id, obj.index, obj.name, obj.scope, obj.type, obj.active];
    });
    
    if (usageType == 'default'){
      
      //Logger.log(metricsValues)
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("GA Metrics");
      
      //getRange(row, column, numRows, numColumns)
      var lastRow = sheet.getLastRow();
      var lastColumn = sheet.getLastColumn()
      sheet.getRange(2, 1, lastRow, metricsValues[0].length).clear();
      sheet.getRange(2, 1, metricsValues.length, metricsValues[0].length).setValues(metricsValues);
      
    } else if (usageType == 'indexedObject'){
      
      //Logger.log('metricsIndexedObj')
      return metricsIndexedObj
      
    }
    
  } else {
    
    if (usageType == 'default'){
      
      //getRange(row, column, numRows, numColumns)
      var lastRow = sheet.getLastRow();
      var lastColumn = sheet.getLastColumn()
      sheet.getRange(2, 1, lastRow, metricsValues[0].length).clear();
      sheet.getRange(2, 1, 1, 1).setValues([['No custom metrics found.']]);
      Logger.log('No custom metrics found.');
      
    } else {
      
      return {'message':'No custom metrics found'}
      
    }
  }
  
}

function createGaCustomMetric(name,scope,type,active){
  
  var newMetric = Analytics.newCustomMetric()
  Logger.log(name)
  Logger.log(scope)
  Logger.log(type)
  Logger.log(active)
  newMetric.name  = name;
  newMetric.scope = scope;
  newMetric.type = type;
  newMetric.active = active;
  var metrics = Analytics.Management.CustomMetrics.insert(newMetric, GA_ACCOUNT_ID, GA_PROPERTY_ID)
  //Logger.log(metrics.index)
  return metrics.index
  
}

// Connect To GTM API

// File > Project Properties
// Project key: MMRYe9YCsHP9e0PIf2BV-WE9pAQWesLUp
// Callback > https://pantheon.corp.google.com/project/360489325281/apiui/credential
// https://script.google.com/macros/d/{PROJECT KEY}/usercallback
// https://script.google.com/macros/d/MMRYe9YCsHP9e0PIf2BV-WE9pAQWesLUp/usercallback
// Client ID	
// 360489325281-k6p8jl7b2cmsufohntu3n70cp0ic62t1.apps.googleusercontent.com
// Client secret	
// iihR_JQhfPtuY8URzr0TsobU
// Creation date	
// Sep 14, 2015, 9:23:23 PM

function getGtmService() {
  // via https://github.com/googlesamples/apps-script-oauth2
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService('gtm_wizard')
  
  // Set the endpoint URLs, which are the same for all Google services.
  .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
  .setTokenUrl('https://accounts.google.com/o/oauth2/token')
  
  // Set the client ID and secret, from the Google Developers Console.
  .setClientId('360489325281-k6p8jl7b2cmsufohntu3n70cp0ic62t1.apps.googleusercontent.com')
  .setClientSecret('iihR_JQhfPtuY8URzr0TsobU')
  
  // Set the project key of the script using this library.
  // You can find your script's project key in the Apps Script code editor by clicking on the menu item "File > Project properties".
  .setProjectKey('MMRYe9YCsHP9e0PIf2BV-WE9pAQWesLUp')
  
  // Set the name of the callback function in the script referenced
  // above that should be invoked to complete the OAuth flow.
  .setCallbackFunction('authCallback')
  
  // Set the property store where authorized tokens should be persisted.
  .setPropertyStore(PropertiesService.getUserProperties())
  
  // Set the scopes to request (space-separated for Google services).
  .setScope('https://www.googleapis.com/auth/tagmanager.edit.containers')
  
  // Below are Google-specific OAuth2 parameters.
  
  // Sets the login hint, which will prevent the account chooser screen
  // from being shown to users logged in with multiple accounts.
  .setParam('login_hint', Session.getActiveUser().getEmail())
  
  // Requests offline access.
  .setParam('access_type', 'offline')
  
  // Forces the approval prompt every time. This is useful for testing,
  // but not desirable in a production application.
  .setParam('approval_prompt', 'force');
}

function showGtmSidebar() {
  var gtmService = getGtmService();
  Logger.log(gtmService)
  if (!gtmService.hasAccess()) {
    var authorizationUrl = gtmService.getAuthorizationUrl();
    var template = HtmlService.createTemplate(
      '<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
      'Reopen the sidebar when the authorization is complete.');
    template.authorizationUrl = authorizationUrl;
    var page = template.evaluate();
    SpreadsheetApp.getUi().showSidebar(page);
  } else {
    Logger.log('GTM ACCESS OK')
  }
}

function authCallback(request) {
  var gtmService = getGtmService();
  var isAuthorized = gtmService.handleCallback(request);
  if (isAuthorized) {
    automationSheet.getRange("B2").setValue('DONE - ' + new Date() )
    automationSheet.getRange("B2").setBackground('#6aa84f')
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

function getGtmAccountsRequest() {
  var gtmService = getGtmService();
  var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts', {
    headers: {
      Authorization: 'Bearer ' + gtmService.getAccessToken()
    }
  });
  //Logger.log(JSON.parse(response.getContentText()))
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("GTM Accounts");
  var accountsObj = {}
  var response = JSON.parse(response.getContentText())
  var accounts = response.accounts.map(function(obj){ 
    accountsObj[obj.accountId] = obj
    return [obj.accountId, obj.name];
  });
  
  //Logger.log(accounts)
  //Logger.log(accounts.length)
  
  //for (var i = 0; i < accounts.length; i++){
  //sheet.appendRow(accounts[i]); 
  //}
  
  //getRange(row, column, numRows, numColumns)
  sheet.getRange(2, 1, accounts.length, 2).setValues(accounts);
  return response.accounts
}

function getGtmContainersRequest() {
  var gtmService = getGtmService();
  
  var accounts = getGtmAccountsRequest()
  var accountsObj = {}
  
  var accounts = accounts.map(function(obj){ 
    accountsObj[obj.accountId] = obj
    return obj
  });
  
  //Logger.log(JSON.stringify(accountsObj, null, 2))
  
  var containersValues = []
  
  for (var i = 0; i < accounts.length; i++){
    
    //var accountId = GTM_ACCOUNT_ID
    var accountId = accounts[i].accountId
    var accountName = accountsObj[accounts[i].accountId].name
    
    var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers', {
                                     headers: {
                                     Authorization: 'Bearer ' + gtmService.getAccessToken()
    }
});

Logger.log(JSON.parse(response.getContentText()))
var response = JSON.parse(response.getContentText())
var containers = response.containers.map(function(obj){ 
  containersValues.push([accountName, obj.accountId, obj.containerId, obj.publicId, obj.name, accountName + ' - ' + obj.name])
  return [accountName, obj.accountId, obj.containerId, obj.publicId, obj.name, accountName + ' - ' + obj.name];
});

//Logger.log(containers[0])

}

var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("GTM Containers");
//getRange(row, column, numRows, numColumns)
var lastRow = sheet.getLastRow();
var lastColumn = sheet.getLastColumn()
sheet.getRange(2, 1, lastRow, containersValues[0].length).clear();
sheet.getRange(2, 1, containersValues.length, containersValues[0].length).setValues(containersValues);

var output = '<p>' + containersValues.length +
  ' GTM containers retrieved.</p>' + 
    '<p>Select the container you want to set-up in the dropdown in the <strong>Automation Set-Up</strong> tab.</p>';

var htmlOutput = HtmlService
.createHtmlOutput( output )
.setSandboxMode(HtmlService.SandboxMode.IFRAME)
.setWidth(650)
.setHeight(200);
SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Containers List Refresh Complete');

automationSheet.getRange("B3").setValue('DONE - ' + new Date() )
automationSheet.getRange("B3").setBackground('#6aa84f')

}

function getGtmVariablesRequest() {
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/variables', {
                                   headers: {
                                   Authorization: 'Bearer ' + gtmService.getAccessToken()
  }
});
Logger.log(JSON.parse(response.getContentText()))
var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("GTM variables");

var response = JSON.parse(response.getContentText())

if (!!response.variables){
  
  var variables = response.variables.map(function(obj){ 
    return [obj.accountId, obj.containerId, obj.variableId, obj.name, '{{'+obj.name+'}}', obj.parameter[0].value, obj.type, JSON.stringify(obj.parameter)];
  });
  
  Logger.log(variables[0])
  
  /*for (var i = 0; i < variables.length; i++){
  sheet.appendRow(variables[i]); 
  }*/
  
  //getRange(row, column, numRows, numColumns)
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn()
  sheet.getRange(2, 1, lastRow, lastColumn).clear();
  sheet.getRange(2, 1, variables.length, 8).setValues(variables);
}
}

function createGtmVariablesFromDataLayer() {
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("dataLayer");
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn()
  // getRange(row, column, numRows, numColumns)
  var range = sheet.getRange(1, 1, lastRow, lastColumn);
  var values = range.getValues();
  
  //Logger.log(values)
  
  /* Modify this to create all the dataLayer keys based on what is actually being used and taking into account the new replace option
  for (var i = 3; i < values.length; i++) {
  
  var key = values[i][0]
  var value = values[i][k]
  var keyReplaceRegex = /\<(.*?)\>/; 
  if(keyReplaceRegex.test(value)) {
  var matches = value.match(keyReplaceRegex);
  //console.log(matches)
  var key = key.split('<replace>').join(matches[1])
  var value = value.split('|')[0]
  
  } else {
  
  var key = key
  var value = value.split('|')[0]
  
  }
  
  if(value.indexOf('REQ -') > -1 || value.indexOf('OPT -') > -1 ){
  
  flatObjectArr[k - 3][key] = values[i][1] + ' - ' + value
  
  } else if(values[i][k] != ''){
  
  flatObjectArr[k - 3][key] = value
  
  }
  
  }*/
  
  for (var i = 0; i < values.length; i++) {
    
    var dataLayerKeyName = values[i][0];
    var dataLayerKeyType = values[i][1];
    
    if ((dataLayerKeyType === 'STRING' || dataLayerKeyType === 'NUMBER') && dataLayerKeyName !== 'event'){
      
      Logger.log(dataLayerKeyName + ' - ' + values[i][0])
      
      var data =
          {
            'name': DL_PREFIX + ' - ' + dataLayerKeyName,
            'type': 'v',
            'parameter': [{"type":"template","key":"name","value":dataLayerKeyName},{"type":"integer","key":"dataLayerVersion","value":"2"}]
    };
    
    var payload = JSON.stringify(data);
    
    // Because payload is a JavaScript object, it will be interpreted as
    // an HTML form. (We do not need to specify contentType; it will
    // automatically default to either 'application/x-www-form-urlencoded'
    // or 'multipart/form-data')
    
    var options =
        { "contentType" : "application/json",
         "muteHttpExceptions" : true,
         "method" : "post",
         "headers" : {
           Authorization: 'Bearer ' + gtmService.getAccessToken()
         },
         "payload" : payload
        };
    
    try {
      var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/variables', options);
      Logger.log(JSON.parse(response.getContentText()))
    }
    catch (e) {
      // statements to handle any exceptions
      Logger.log(e); // pass exception object to error handler
    }
    
    
    
  }
  
}

getGtmVariablesRequest()

}


function createGtmTriggersFromDataLayer(){
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("dataLayer");
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn()
  // getRange(row, column, numRows, numColumns)
  var range = sheet.getRange(1, 4, 2, lastColumn-3);
  var values = range.getValues();
  
  for (var i = 0; i < values[0].length; i++){
    
    var triggerType = values[0][i] == 'pageload' ? 'page.type' : 'event'
    var triggerKey;
    var triggerValue = values[1][i]
    
    var triggerName = triggerType + ' equals ' + triggerValue
    Logger.log(triggerName)
    
    if (triggerType == 'page.type'){
      
      triggerKey = '{{'+DL_PREFIX+' - page.type}}'
      // create pageview trigger
      createPageviewTrigger(triggerName,triggerKey,triggerValue)
      
    } else {
      
      // create event trigger
      createEventTrigger(triggerName,triggerValue)
    }
    
  }
  Logger.log(values)
}

function createPageviewTrigger(name,key,value){
  
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  var key = !!key ? key : '{{dataLayer - test.key}}';
  var value = !!value ? value : 'test ' + new Date().getTime();
  var name = !!name ? name : DL_PREFIX+' - page.type equals ' + value;
  
  var data =
      {
        'name': name,
        'type': 'pageview',
        'filter': [
          {
            'type': 'equals',
            'parameter': [
              {
                'type': 'template',
                'key': 'arg0',
                'value': key
              },
              {
                'type': 'template',
                'key': 'arg1',
                'value': value
              }
            ]
          }
        ]
      };
  
  var payload = JSON.stringify(data);
  
  // Because payload is a JavaScript object, it will be interpreted as
  // an HTML form. (We do not need to specify contentType; it will
  // automatically default to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  
  var options =
      { "contentType" : "application/json",
       "muteHttpExceptions" : true,
       "method" : "post",
       "headers" : {
         Authorization: 'Bearer ' + gtmService.getAccessToken()
       },
       "payload" : payload
      };
  
  try {
    var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/triggers', options);
    Logger.log(JSON.parse(response.getContentText()))
    
    
  }
  catch (e) {
    // statements to handle any exceptions
    Logger.log(e); // pass exception object to error handler
  }
  
  
}

function createEventTrigger(triggerName,eventName){
  
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  var eventName = !!eventName ? eventName : 'testEventName ' + new Date().getTime();
  var triggerName = !!triggerName ? triggerName : 'event ' + eventName;
  
  var data =
      {
        'name': triggerName,
        'type': 'customEvent',
        'customEventFilter': [
          {
            'type': 'equals',
            'parameter': [
              {
                'type': 'template',
                'key': 'arg0',
                'value': '{{_event}}'
              },
              {
                'type': 'template',
                'key': 'arg1',
                'value': eventName
              }
            ]
          }
        ]
      };
  
  var payload = JSON.stringify(data);
  
  // Because payload is a JavaScript object, it will be interpreted as
  // an HTML form. (We do not need to specify contentType; it will
  // automatically default to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  
  var options =
      { "contentType" : "application/json",
       "muteHttpExceptions" : true,
       "method" : "post",
       "headers" : {
         Authorization: 'Bearer ' + gtmService.getAccessToken()
       },
       "payload" : payload
      };
  
  try {
    var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/triggers', options);
    Logger.log(JSON.parse(response.getContentText()))
  }
  catch (e) {
    // statements to handle any exceptions
    Logger.log(e); // pass exception object to error handler
  }
}

function deleteAllTriggers(){
  
  var triggersLength = getGtmTriggersRequest().triggers.length
  
  for (var i = 0; i < triggersLength; i++){
    
    deleteTrigger(i+1)
    
  }
  
}

function deleteTrigger(triggerId){
  
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  var triggerId = !!triggerId ? triggerId.toString() : '1';
  
  // Because payload is a JavaScript object, it will be interpreted as
  // an HTML form. (We do not need to specify contentType; it will
  // automatically default to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  
  var options =
      { "contentType" : "application/json",
       "muteHttpExceptions" : true,
       "method" : "delete",
       "headers" : {
         Authorization: 'Bearer ' + gtmService.getAccessToken()
       }
      };
  
  try {
    var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/triggers/'+triggerId, options);
    Logger.log(JSON.parse(response.getContentText()))
  }
  catch (e) {
    // statements to handle any exceptions
    Logger.log(e); // pass exception object to error handler
  }
}

function getGtmTriggersRequest() {
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/triggers', {
                                   headers: {
                                   Authorization: 'Bearer ' + gtmService.getAccessToken()
  }
});
Logger.log(JSON.parse(response.getContentText()))
var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("GTM Triggers");

var response = JSON.parse(response.getContentText())
var triggers = response.triggers.map(function(obj){ 
  return [obj.accountId, obj.containerId, obj.triggerId, obj.name, JSON.stringify(obj.filter)];
});

Logger.log(triggers[0])

//for (var i = 0; i < containers.length; i++){
//sheet.appendRow(containers[i]); 
//}

//getRange(row, column, numRows, numColumns)
sheet.getRange(2, 1, triggers.length, 5).setValues(triggers);

return response
}

function getGtmTagsRequest() {
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/tags', {
                                   headers: {
                                   Authorization: 'Bearer ' + gtmService.getAccessToken()
  }
});
Logger.log(JSON.parse(response.getContentText()))

return response
}


function createTagBasicUniversalAnalytics(){
  
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  
  var data = {
    "name": "Universal Analytics - All Pages",
    "type": "ua",
    "blockingTriggerId":[],
    "liveOnly": false,
    "parameter": [
      {
        "type": "template",
        "key": "trackingId",
        "value": "UA-12345678-9"
      },
      {
        "type": "template",
        "key": "trackType",
        "value": "TRACK_PAGEVIEW"
      }
    ]
  }
  
  var payload = JSON.stringify(data);
  
  // Because payload is a JavaScript object, it will be interpreted as
  // an HTML form. (We do not need to specify contentType; it will
  // automatically default to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  
  var options =
      { "contentType" : "application/json",
       "muteHttpExceptions" : true,
       "method" : "post",
       "headers" : {
         Authorization: 'Bearer ' + gtmService.getAccessToken()
       },
       "payload" : payload
      };
  
  try {
    var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/tags', options);
    Logger.log(JSON.parse(response.getContentText()))
  }
  catch (e) {
    // statements to handle any exceptions
    Logger.log(e); // pass exception object to error handler
  }
}


function getTriggersLookupObject(){
  var triggersList = getGtmTriggersRequest().triggers;
  var triggerObj = {}
  for (var i = 0; i < triggersList.length; i++){
    
    triggerObj[triggersList[i].name] = {triggerId: triggersList[i].triggerId}
    
  }
  //Logger.log(triggersList)
  Logger.log(JSON.stringify(triggerObj, null, 2))
  return triggerObj
}

function createTagUniversalAnalytics(config,dimensions,metrics){
  
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  var triggersObj = getTriggersLookupObject()
  Logger.log(triggersObj)
  
  /*var tagConfig = [
  ['','','','GA TAG E'],
  ['','','','PAGEVIEW'],
  ['triggerYes','','','pageview equals home'],
  ['triggerNo','','',''],
  ['trackingId','trackingId','','UA-1234567-9'],
  ['Page Type','CD - HIT','1','{{dataLayer - page.type}}'],
  ['User ID','CD - USER','2','{{dataLayer - user.id}}'],
  ['Search Results','CM - HIT - INT','6','{{dataLayer - product.profit}}'],
  ['Page Type','CONTENT GROUP 1','1','{{dataLayer - page.type}}']
  ]*/
  
  var dimensions = dimensions;
  var metrics = metrics;
  
  var tagConfig = config.map(function(obj){
    var paramName = obj[0];
    var paramType = obj[1];
    var paramIndex = '';
    var paramDl = obj[3]
    
    if (paramType.indexOf('CD - ') > -1){
      var cdScope = paramType.split('CD - ')[1];
      var cdNameScope = paramName + '-' + cdScope
      paramIndex = dimensions[cdNameScope].index
    } else if (paramType.indexOf('CM - ') > -1){
      var cmScope = paramType.split(' - ')[1];
      var cmType = paramType.split(' - ')[2]
      var cmNameScopeType = paramName + '-' + cmScope + '-' + cmType
      paramIndex = metrics[cmNameScopeType].index
    }
    return [paramName, paramType, paramIndex, paramDl]
  })
  
  Logger.log('tagConfig')
  Logger.log(tagConfig)
  
  var tagName = tagConfig[0][3]
  var tagType = 'TRACK_' + tagConfig[1][3]
  
  var fieldsList = []
  var dimensionsList = []
  var metricsList = []
  var contentGroupsList = []
  var firingTriggerIdList = []
  
  var tagParameters = [
    {
      "type": "template",
      "key": "trackType",
      "value": tagType
    }
  ]
  
  for (var i = 0; i < tagConfig.length; i++){
    
    var fieldName = tagConfig[i][0];
    var fieldType = tagConfig[i][1];
    var fieldIndex = tagConfig[i][2];
    var fieldValue = tagConfig[i][3];
    
    if (fieldName == 'triggerYes' && !!fieldValue){
      Logger.log('triggers object')
      Logger.log(JSON.stringify(triggersObj,null, 2))
      Logger.log(JSON.stringify(triggersObj[fieldValue]))
      var triggerId = triggersObj[fieldValue]['triggerId']
      var trigger = triggerId
      firingTriggerIdList.push(trigger)
      
    } else if (fieldType.indexOf('event') > -1 && !!fieldValue){
      var event = {
        "type": "template",
        "key": fieldType,
        "value": fieldValue
      } 
      tagParameters.push(event)
      
    } else if ( fieldType == 'trackingId' && !!fieldValue){
      var trackingId =     {
        "type": "template",
        "key": fieldType,
        "value": fieldValue
      }
      
      tagParameters.push(trackingId)
    } else if (fieldType.indexOf('CD - ') > -1 && !!fieldValue){
      var dimensionMap = {
        "type": "map",
        "map": [
          {
            "type": "template",
            "key": "index",
            "value": fieldIndex
          },
          {
            "type": "template",
            "key": "dimension",
            "value": fieldValue
          }
        ]
      }
      
      dimensionsList.push(dimensionMap)
      
    } else if (fieldType.indexOf('CM - ') > -1 && !!fieldValue){
      
      var metricMap = {
        "type": "map",
        "map": [
          {
            "type": "template",
            "key": "index",
            "value": fieldIndex
          },
          {
            "type": "template",
            "key": "metric",
            "value": fieldValue
          }
        ]
      }
      
      metricsList.push(metricMap)
      
    } else if (fieldType.indexOf('CONTENT GROUP') > -1 && !!fieldValue){
      
      var contentGroupMap = {
        "type": "map",
        "map": [
          {
            "type": "template",
            "key": "index",
            "value": fieldType.split('CONTENT GROUP ')[1]
          },
          {
            "type": "template",
            "key": "group",
            "value": fieldValue
          }
        ]
      }
      
      contentGroupsList.push(contentGroupMap)
      
    } else if (!!fieldType && !!fieldValue){
      var fieldMap = {
        "type": "map",
        "map": [
          {
            "type": "template",
            "key": "fieldName",
            "value": fieldType
          },
          {
            "type": "template",
            "key": "value",
            "value": fieldValue
          }
        ]
      }
      
      fieldsList.push(fieldMap)
      
    }  
    
  }
  
  if (dimensionsList.length > 0){
    tagParameters.push({
      "type": "list",
      "key": "dimension",
      "list": dimensionsList
    })
  }
  
  if (metricsList.length > 0){
    tagParameters.push({
      "type": "list",
      "key": "metric",
      "list": metricsList
    })
  }
  
  if (contentGroupsList.length > 0){
    tagParameters.push({
      "type": "list",
      "key": "contentGroup",
      "list": contentGroupsList
    })
  }
  
  if (fieldsList.length > 0){
    tagParameters.push({
      "type": "list",
      "key": "fieldsToSet",
      "list": fieldsList
    })
  }
  
  var data = {
    "name": tagName,
    "type": "ua",
    "firingTriggerId": firingTriggerIdList,
    "blockingTriggerId":[],
    "liveOnly": false,
    "parameter": tagParameters,
    /*"parameter": [
    {
    "type": "boolean",
    "key": "enableEcommerce",
    "value": "false"
    },
    {
    "type": "list",
    "key": "dimension",
    "list": dimensionsList
    },
    {
    "type": "boolean",
    "key": "useHashAutoLink",
    "value": "false"
    },
    {
    "type": "list",
    "key": "fieldsToSet",
    "list": fieldsList
    },
    {
    "type": "boolean",
    "key": "doubleClick",
    "value": "true"
    },
    {
    "type": "boolean",
    "key": "useDebugVersion",
    "value": "false"
    },
    {
    "type": "list",
    "key": "contentGroup",
    "list": contentGroupsList
    },
    {
    "type": "boolean",
    "key": "decorateFormsAutoLink",
    "value": "false"
    },
    {
    "type": "list",
    "key": "metric",
    "list": metricsList
    },
    {
    "type": "template",
    "key": "trackingId",
    "value": "{{Constant - UA-12345678-9}}"
    },
    {
    "type": "template",
    "key": "trackType",
    "value": "TRACK_PAGEVIEW"
    },
    {
    "type": "boolean",
    "key": "enableLinkId",
    "value": "false"
    }
    ],*/
    "tagFiringOption": "oncePerEvent"
  }
  Logger.log(JSON.stringify(data, null, 2))
  var payload = JSON.stringify(data);
  
  // Because payload is a JavaScript object, it will be interpreted as
  // an HTML form. (We do not need to specify contentType; it will
  // automatically default to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  
  var options =
      { "contentType" : "application/json",
       "muteHttpExceptions" : true,
       "method" : "post",
       "headers" : {
         Authorization: 'Bearer ' + gtmService.getAccessToken()
       },
       "payload" : payload
      };
  
  try {
    var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/tags', options);
    Logger.log(JSON.parse(response.getContentText()))
  }
  catch (e) {
    // statements to handle any exceptions
    Logger.log(e); // pass exception object to error handler
  }
}

// loop through each tag column and execute create GA tag
function createAllGoogleAnalyticsTagsInGtm(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Google Analytics Tags");
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn()
  // getRange(row, column, numRows, numColumns)
  var range = sheet.getRange(1, 1, lastRow, lastColumn);
  var values = range.getValues();
  
  var dimensions = getGaCustomDimensions('indexedObject');
  var metrics = getGaCustomMetrics('indexedObject');
  // create custom dimensions and metrics if do not exist
  
  for (var i = 0; i < values.length; i++){
    var paramName = values[i][0];
    var paramType = values[i][1];
    
    if (paramType.indexOf('CD - ') > -1){
      
      var cdScope = paramType.split('CD - ')[1];
      var cdNameScope = paramName + '-' + cdScope
      //check if already exists in obj
      
      if(!dimensions[cdNameScope]){
        var newDimension =  (paramName,cdScope,true);
        var dimensionIndex = newDimension;
      }
    } else if (paramType.indexOf('CM - ') > -1){
      
      var cmScope = paramType.split(' - ')[1];
      var cmType = paramType.split(' - ')[2]
      var cmNameScopeType = paramName + '-' + cmScope + '-' + cmType
      //check if already exists in obj
      //Logger.log(JSON.stringify(metrics))
      if(!metrics[cmNameScopeType]){
        //Logger.log('create CM')
        Logger.log('Create CM for '+ cmNameScopeType)
        //Logger.log(metrics[cmNameScopeType])
        
        var newMetric = createGaCustomMetric(paramName,cmScope,cmType,true);
        var metricIndex = newMetric;
      }
      
    }
    
  }
  
  // get new dimension object with new values
  var dimensions = getGaCustomDimensions('indexedObject');
  var metrics = getGaCustomMetrics('indexedObject');
  //Logger.log('new cd object')
  //Logger.log(JSON.stringify(dimensions))
  
  //Logger.log(values)
  
  // loop through each column to create tag
  for (var i = 3; i < values[0].length; i++){
    
    var tagConfig = values.map(function(row) {
      return [row[0],row[1],row[2],row[i]]
    });
    
    createTagUniversalAnalytics(tagConfig,dimensions,metrics)
    
    //Logger.log('Create Tag: ')
    //Logger.log(JSON.stringify(tagConfig,null,2))
    //Logger.log('End Create Tag')
    
  }
}

function createTagAdometry(config){
  
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  var triggersObj = getTriggersLookupObject()
  Logger.log(triggersObj)
  
  /*var tagConfig = [
  ['','','','Adom TAG'],
  ['','','',''],
  ['triggerYes','','','pageview equals home'],
  ['triggerNo','','',''],
  ['groupId','groupId','','XXXXXXX'],
  ['advertiserId','advertiserId','6','XXXXXXX'],
  ['placementId','placementId','1','XXXXXXXX'],
  ['User ID','uid','','{{dataLayer - user.id}}'],
  ['Order Id','oid','','{{dataLayer - transaction.id}}']
  ]*/
  
  var tagConfig = config;
  
  var dimensions = dimensions;
  var metrics = metrics;
  
  Logger.log('tagConfig')
  Logger.log(tagConfig)
  
  var tagName = tagConfig[0][3]
  var tagType = ''
  
  var customVariablesList = []
  var firingTriggerIdList = []
  
  var tagParameters = [
  ]
  
  for (var i = 0; i < tagConfig.length; i++){
    
    var fieldName = tagConfig[i][0];
    var fieldType = tagConfig[i][1];
    var fieldIndex = tagConfig[i][2];
    var fieldValue = tagConfig[i][3];
    
    if (fieldName == 'triggerYes' && !!fieldValue){
      //Logger.log('triggers object')
      //Logger.log(JSON.stringify(triggersObj,null, 2))
      //Logger.log(JSON.stringify(triggersObj[fieldValue]))
      var triggerId = triggersObj[fieldValue]['triggerId']
      var trigger = triggerId
      firingTriggerIdList.push(trigger)
      
    } else if (fieldType == 'groupId' || fieldType == 'advertiserId' || fieldType == 'placementId' ){
      var event = {
        "type": "template",
        "key": fieldType,
        "value": fieldValue
      } 
      tagParameters.push(event)
      
    } else if ( fieldType.length == 3 && !!fieldValue){
      
      var customVariableMap = {
        "type": "map",
        "map": [
          {
            "type": "template",
            "key": "name",
            "value": fieldType
          },
          {
            "type": "template",
            "key": "value",
            "value": fieldValue
          }
        ]
      }
      
      customVariablesList.push(customVariableMap) 
      
    } 
    
  }
  
  
  if (customVariablesList.length > 0){
    tagParameters.push({
      "type": "list",
      "key": "customVariables",
      "list": customVariablesList
    })
  }
  
  
  var data = {
    "name": tagName,
    "type": "adm",
    "firingTriggerId": firingTriggerIdList,
    "blockingTriggerId":[],
    "liveOnly": false,
    "parameter": tagParameters,
    "tagFiringOption": "oncePerEvent"
  }
  Logger.log(JSON.stringify(data, null, 2))
  var payload = JSON.stringify(data);
  
  // Because payload is a JavaScript object, it will be interpreted as
  // an HTML form. (We do not need to specify contentType; it will
  // automatically default to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  
  var options =
      { "contentType" : "application/json",
       "muteHttpExceptions" : true,
       "method" : "post",
       "headers" : {
         Authorization: 'Bearer ' + gtmService.getAccessToken()
       },
       "payload" : payload
      };
  
  try {
    var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/tags', options);
    Logger.log(JSON.parse(response.getContentText()))
  }
  catch (e) {
    // statements to handle any exceptions
    Logger.log(e); // pass exception object to error handler
  }
}

// loop through each tag column and execute create Adometry tag
function createAllAdometryTagsInGtm(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Adometry Tags");
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn()
  // getRange(row, column, numRows, numColumns)
  var range = sheet.getRange(1, 1, lastRow, lastColumn);
  var values = range.getValues();
  
  // loop through each column to create tag
  for (var i = 3; i < values[0].length; i++){
    
    var tagConfig = values.map(function(row) {
      return [row[0],row[1],row[2],row[i]]
    });
    
    createTagAdometry(tagConfig)
    
  }
}

function createDataLayerPage(htmlOutput){
  var site = SitesApp.getSiteByUrl('https://sites.google.com/a/google.com/tagging-automation-demo/')
  var url = site.getUrl()
  var page = site.getChildByName('data-layer-gtm-code')
  
  if (!!page){
    
    var html = "Data Layer & GTM Container Code - Update: " + new Date() + "<br/><br/>" + htmlOutput;
    page.setHtmlContent(html)
    
  } else {
    
    var html = "Data Layer & GTM Container Code - Created: " + new Date() + "<br/><br/>" + htmlOutput;
    var webpage = site.createWebPage("Data Layer & GTM Container Code", "data-layer-gtm-code", html);
    
  }
  
}

function createDataLayerCode() {
  
  // theme - https://github.com/jasonm23/markdown-css-themes/blob/gh-pages/swiss.css
  // strVar created using - http://www.accessify.com/tools-and-wizards/developer-tools/html-javascript-convertor/
  
  var strVar="";
  strVar += "<style>";
  strVar += "  @charset \"utf-8\";";
  strVar += "";
  strVar += "\/**";
  strVar += " * markdown.css";
  strVar += " *";
  strVar += " * This program is free software: you can redistribute it and\/or modify it under";
  strVar += " * the terms of the GNU Lesser General Public License as published by the Free";
  strVar += " * Software Foundation, either version 3 of the License, or (at your option) any";
  strVar += " * later version.";
  strVar += " *";
  strVar += " * This program is distributed in the hope that it will be useful, but WITHOUT";
  strVar += " * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS";
  strVar += " * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more";
  strVar += " * details.";
  strVar += " *";
  strVar += " * You should have received a copy of the GNU Lesser General Public License";
  strVar += " * along with this program. If not, see http:\/\/gnu.org\/licenses\/lgpl.txt.";
  strVar += " *";
  strVar += " * @project      Weblog and Open Source Projects of Florian Wolters";
  strVar += " * @version      GIT: $Id$";
  strVar += " * @package      xhtml-css";
  strVar += " * @author       Florian Wolters <florian.wolters.85@googlemail.com>";
  strVar += " * @copyright    2012 Florian Wolters";
  strVar += " * @cssdoc       version 1.0-pre";
  strVar += " * @license      http:\/\/gnu.org\/licenses\/lgpl.txt GNU Lesser General Public License";
  strVar += " * @link         http:\/\/github.com\/FlorianWolters\/jekyll-bootstrap-theme";
  strVar += " * @media        all";
  strVar += " * @valid        true";
  strVar += " *\/";
  strVar += "";
  strVar += "body {";
  strVar += "    font-family: Helvetica, Arial, Freesans, clean, sans-serif;";
  strVar += "padding:1em;";
  strVar += "margin:auto;";
  strVar += "max-width:42em;";
  strVar += "background:#fefefe;";
  strVar += "}";
  strVar += "";
  strVar += "h1, h2, h3, h4, h5, h6 {";
  strVar += "    font-weight: bold;";
  strVar += "}";
  strVar += "";
  strVar += "h1 {";
  strVar += "    color: #000000;";
  strVar += "    font-size: 28px;";
  strVar += "}";
  strVar += "";
  strVar += "h2 {";
  strVar += "    border-bottom: 1px solid #CCCCCC;";
  strVar += "    color: #000000;";
  strVar += "    font-size: 24px;";
  strVar += "}";
  strVar += "";
  strVar += "h3 {";
  strVar += "    font-size: 18px;";
  strVar += "}";
  strVar += "";
  strVar += "h4 {";
  strVar += "    font-size: 16px;";
  strVar += "}";
  strVar += "";
  strVar += "h5 {";
  strVar += "    font-size: 14px;";
  strVar += "}";
  strVar += "";
  strVar += "h6 {";
  strVar += "    color: #777777;";
  strVar += "    background-color: inherit;";
  strVar += "    font-size: 14px;";
  strVar += "}";
  strVar += "";
  strVar += "hr {";
  strVar += "    height: 0.2em;";
  strVar += "    border: 0;";
  strVar += "    color: #CCCCCC;";
  strVar += "    background-color: #CCCCCC;";
  strVar += "}";
  strVar += "";
  strVar += "p, blockquote, ul, ol, dl, li, table, pre {";
  strVar += "    margin: 15px 0;";
  strVar += "}";
  strVar += "";
  strVar += "code, pre {";
  strVar += "    border-radius: 3px;";
  strVar += "    background-color: #F8F8F8;";
  strVar += "    color: inherit;";
  strVar += "}";
  strVar += "";
  strVar += "code {";
  strVar += "    border: 1px solid #EAEAEA;";
  strVar += "    margin: 0 2px;";
  strVar += "    padding: 0 5px;";
  strVar += "}";
  strVar += "";
  strVar += "pre {";
  strVar += "    border: 1px solid #CCCCCC;";
  strVar += "    line-height: 1.25em;";
  strVar += "    overflow: auto;";
  strVar += "    padding: 6px 10px;";
  strVar += "}";
  strVar += "";
  strVar += "pre > code {";
  strVar += "    border: 0;";
  strVar += "    margin: 0;";
  strVar += "    padding: 0;";
  strVar += "}";
  strVar += "";
  strVar += "a, a:visited {";
  strVar += "    color: #4183C4;";
  strVar += "    background-color: inherit;";
  strVar += "    text-decoration: none;";
  strVar += "}";
  strVar += "  <\/style>";
  
  flatObject = {}
  flatObject['page.type'] = 'home'
  flatObject['user.id'] = '<REQ>'
  flatObject['products.0.id'] = '<REQ>'
  
  unflat = unflatten(flatObject)
  
  
  Logger.log(JSON.stringify(unflat, null, 2))
  
  var range = [
    ['','','Home','Search'],
    ['page.type','STRING','REQ','REQ'],
    ['user.id','STRING','REQ','REQ'],
    ['products.0.id','STRING','','REQ'],
  ]
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("dataLayer");
    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn()
    // getRange(row, column, numRows, numColumns)
    var range = sheet.getRange(1, 1, lastRow, lastColumn);
    var values = range.getValues();
    
    var output = '' 
    var linkToGoogleSite = '<p><a href="https://sites.google.com/a/google.com/tagging-automation-demo/data-layer-gtm-code">View the dataLayer and GTM container code at your custom google site.</a></p>' 
    
    // gtmContainerStr created in 2 steps
    // encode HTML - http://www.opinionatedgeek.com/DotNet/Tools/HTMLEncode/Encode.aspx
    // turn into string - http://www.accessify.com/tools-and-wizards/developer-tools/html-javascript-convertor/
    
    var gtmContainerStr="";
    gtmContainerStr += "&lt;\/head&gt;\n";
    gtmContainerStr += "&lt;body&gt;\n";
    gtmContainerStr += "&lt;!-- Google Tag Manager Container " + GTM_CONTAINER_SITE_ID + "--&gt;\n";
    gtmContainerStr += "&lt;noscript&gt;&lt;iframe src=&quot;\/\/www.googletagmanager.com\/ns.html?id=" + GTM_CONTAINER_SITE_ID + "&quot;\n";
    gtmContainerStr += "height=&quot;0&quot; width=&quot;0&quot; style=&quot;display:none;visibility:hidden&quot;&gt;&lt;\/iframe&gt;&lt;\/noscript&gt;\n";
    gtmContainerStr += "&lt;script&gt;(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({&#39;gtm.start&#39;:\n";
    gtmContainerStr += "new Date().getTime(),event:&#39;gtm.js&#39;});var f=d.getElementsByTagName(s)[0],\n";
    gtmContainerStr += "j=d.createElement(s),dl=l!=&#39;dataLayer&#39;?&#39;&amp;l=&#39;+l:&#39;&#39;;j.async=true;j.src=\n";
    gtmContainerStr += "&#39;\/\/www.googletagmanager.com\/gtm.js?id=&#39;+i+dl;f.parentNode.insertBefore(j,f);\n";
    gtmContainerStr += "})(window,document,&#39;script&#39;,&#39;dataLayer&#39;,&#39;" + GTM_CONTAINER_SITE_ID + "&#39;);&lt;\/script&gt;\n";
    gtmContainerStr += "&lt;!-- End Google Tag Manager Container " + GTM_CONTAINER_SITE_ID + "--&gt;\n";
    gtmContainerStr += "&lt;\/body&gt;\n";
    
    flatObjectArr = []
  
  for (var k = 3; k < values[0].length; k++){
    
    var dataLayerType = values[0][k]
    var pageType = values[1][k]
    
    flatObjectArr[k - 3] = {}
    
    for (var i = 3; i < values.length; i++) {
      
      var key = values[i][0]
      var value = values[i][k]
      var keyReplaceRegex = /\<(.*?)\>/; 
      if(keyReplaceRegex.test(value)) {
        var matches = value.match(keyReplaceRegex);
        //console.log(matches)
        var key = key.split('<replace>').join(matches[1])
        var value = value.split('|')[0]
        
        } else {
          
          var key = key
          var value = value.split('|')[0]
          
          }
      
      if(value.indexOf('REQ -') > -1 || value.indexOf('OPT -') > -1 ){
        
        flatObjectArr[k - 3][key] = values[i][1] + ' - ' + value
        
      } else if(values[i][k] != ''){
        
        flatObjectArr[k - 3][key] = value
        
      }
      
    }
    
    var dataLayerCode = unflatten(flatObjectArr[k - 3])
    var dataLayerCodeStr = JSON.stringify(dataLayerCode, null, 2)
    Logger.log(pageType)
    if (dataLayerType == 'pageload' || dataLayerType == 'event'){
      output += '<h3>' + pageType + ' - ' + dataLayerType  + '</h3>'
    }
    
    if (dataLayerType == 'pageload'){
      Logger.log(dataLayerCodeStr)
      output += "<pre><code>&lt;head&gt;\n&lt;script&gt;\nwindow.dataLayer = [" + dataLayerCodeStr + "]\n&lt;/script&gt;\n" + gtmContainerStr + "</code></pre>"
    } else if  (dataLayerType == 'event'){
      Logger.log(dataLayerCodeStr)
      output += '<pre><code>&lt;script&gt;\ndataLayer.push(' + dataLayerCodeStr + ')\n&lt;/script&gt;</code></pre>'
    }
    
    
  }
  // create Data Layer page in Google Site
  createDataLayerPage(output)
  
  var htmlOutput = HtmlService
  .createHtmlOutput( strVar + '\n' + linkToGoogleSite + '\n' + output )
  .setSandboxMode(HtmlService.SandboxMode.IFRAME)
  .setWidth(750)
  .setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Data Layer Code');
  
  
}

/*
Create dataLayer QA Tag
*/

function getDataLayerIndexed(){
  
  /*
  var values = [
  ['','','','pageload','event'],
  ['','','','home','addToBasket'],
  ['','','','',''],
  ['page.type','STRING','','home','search'],
  ['page.category','STRING','','REQ VALUE','REQ VALUE'],
  ['user.id','STRING','','REQ BLANK','REQ BLANK'],
  ['user.email','STRING','','REQ BLANK','REQ BLANK'],
  ['user.status','STRING','','OPT','OPT']
  ]
  */
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("dataLayer");
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn()
  // getRange(row, column, numRows, numColumns)
  var range = sheet.getRange(1, 1, lastRow, lastColumn);
  var values = range.getValues();
  
  //Logger.log(values)
  
  var dataLayerConfigIndexed = {}
  
  for (var k = 3; k < values[0].length; k++){
    
    var fieldValue = values[1][k]
    var dataLayerType = values[0][k]
    
    dataLayerConfigIndexed[fieldValue] = []
    
    for (var i = 3; i < values.length; i++) {
      
      var key = values[i][0]
      var value = values[i][k]
      var keyReplaceRegex = /\<(.*?)\>/; 
      if(keyReplaceRegex.test(value)) {
        var matches = value.match(keyReplaceRegex);
        //console.log(matches)
        var key = key.split('<replace>').join(matches[1])
        var value = value.split('|')[0]
        
        } else {
          
          var key = key
          var value = value.split('|')[0]
          
          }
      
      if(value.indexOf('REQ -') > -1 || value.indexOf('OPT -') > -1 ){
        
        dataLayerConfigIndexed[fieldValue].push([key,values[i][1], value])
        
      } else if(values[i][k] != ''){
        
        dataLayerConfigIndexed[fieldValue].push([key,values[i][1], value])
        
      }
      
    }
    
    /*for (var i = 3; i < values.length; i++) {
    
    if(!!values[i][k]) {
    dataLayerConfigIndexed[fieldValue].push([values[i][0],values[i][1], values[i][k]])
    
    }
    
    }*/
    
  }
  
  //Logger.log(JSON.stringify(dataLayerConfigIndexed))
  
  return dataLayerConfigIndexed
}

function createAllPagesDebugTrigger(){
  
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  var data =
      {
        "name": "all pages - debug mode equals true",
        "type": "pageview",
        "filter": 
        [
          {
            "type": "equals",
            "parameter": 
            [
              {
                "type": "template",
                "key": "arg0",
                "value": "{{Debug Mode}}"
              },
              {
                "type": "template",
                "key": "arg1",
                "value": "true"
              }
            ]
          }
        ]
      };
  
  var payload = JSON.stringify(data);
  
  // Because payload is a JavaScript object, it will be interpreted as
  // an HTML form. (We do not need to specify contentType; it will
  // automatically default to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  
  var options =
      { "contentType" : "application/json",
       "muteHttpExceptions" : true,
       "method" : "post",
       "headers" : {
         Authorization: 'Bearer ' + gtmService.getAccessToken()
       },
       "payload" : payload
      };
  
  try {
    var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/triggers', options);
    Logger.log(JSON.parse(response.getContentText()))
    return JSON.parse(response.getContentText())
    
    
  }
  catch (e) {
    // statements to handle any exceptions
    Logger.log(e); // pass exception object to error handler
    return e
  }
  
  
}

function createAllEventsDebugTrigger(){
  
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  var data =
      {
        "name": "all events - debug mode equals true",
        "type": "customEvent",
        "customEventFilter": [
          {
            "type": "matchRegex",
            "parameter": [
              {
                "type": "template",
                "key": "arg0",
                "value": "{{_event}}"
              },
              {
                "type": "template",
                "key": "arg1",
                "value": ".*"
              }
            ]
          }
        ],
        "filter": [
          {
            "type": "equals",
            "parameter": [
              {
                "type": "template",
                "key": "arg0",
                "value": "{{Event}}"
              },
              {
                "type": "template",
                "key": "arg1",
                "value": "gtm.dom"
              },
              {
                "type": "boolean",
                "key": "negate",
                "value": "true"
              }
            ]
          },
          {
            "type": "equals",
            "parameter": [
              {
                "type": "template",
                "key": "arg0",
                "value": "{{Event}}"
              },
              {
                "type": "template",
                "key": "arg1",
                "value": "gtm.load"
              },
              {
                "type": "boolean",
                "key": "negate",
                "value": "true"
              }
            ]
          },
          {
            "type": "equals",
            "parameter": [
              {
                "type": "template",
                "key": "arg0",
                "value": "{{Debug Mode}}"
              },
              {
                "type": "template",
                "key": "arg1",
                "value": "true"
              }
            ]
          }
        ]
      };
  
  var payload = JSON.stringify(data);
  
  // Because payload is a JavaScript object, it will be interpreted as
  // an HTML form. (We do not need to specify contentType; it will
  // automatically default to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  
  var options =
      { "contentType" : "application/json",
       "muteHttpExceptions" : true,
       "method" : "post",
       "headers" : {
         Authorization: 'Bearer ' + gtmService.getAccessToken()
       },
       "payload" : payload
      };
  
  try {
    var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/triggers', options);
    Logger.log(JSON.parse(response.getContentText()))
    return JSON.parse(response.getContentText())
    
    
  }
  catch (e) {
    // statements to handle any exceptions
    Logger.log(e); // pass exception object to error handler
    return e
  }
  
  
}

function logString(){
  
  var output = "<script>\n  \t/**\n * SheetClip - Spreadsheet Clipboard Parser\n * version 0.2\n *\n * This tiny library transforms JavaScript arrays to strings that are pasteable by LibreOffice, OpenOffice,\n * Google Docs and Microsoft Excel.\n *\n * Copyright 2012, Marcin Warpechowski\n * Licensed under the MIT license.\n * http://github.com/warpech/sheetclip/\n */\n/*jslint white: true*/\n!function(n){\"use strict\";function e(n){return n.split('\"').length-1}n.SheetClip={parse:function(n){var t,r,l,i,g,p,s,u=[],f=0;for(l=n.split(\"\\n\"),l.length>1&&\"\"===l[l.length-1]&&l.pop(),t=0,r=l.length;r>t;t+=1){for(l[t]=l[t].split(\"\t\"),i=0,g=l[t].length;g>i;i+=1)u[f]||(u[f]=[]),p&&0===i?(s=u[f].length-1,u[f][s]=u[f][s]+\"\\n\"+l[t][0],p&&1&e(l[t][0])&&(p=!1,u[f][s]=u[f][s].substring(0,u[f][s].length-1).replace(/\"\"/g,'\"'))):i===g-1&&0===l[t][i].indexOf('\"')&&1&e(l[t][i])?(u[f].push(l[t][i].substring(1).replace(/\"\"/g,'\"')),p=!0):(u[f].push(l[t][i].replace(/\"\"/g,'\"')),p=!1);p||(f+=1)}return u},stringify:function(n){var e,t,r,l,i,g=\"\";for(e=0,t=n.length;t>e;e+=1){for(r=0,l=n[e].length;l>r;r+=1)r>0&&(g+=\"\t\"),i=n[e][r],g+=\"string\"==typeof i?i.indexOf(\"\\n\")>-1?'\"'+i.replace(/\"/g,'\"\"')+'\"':i:null===i||void 0===i?\"\":i;g+=\"\\n\"}return g}}}(window);\n\nvar testGtmId = getGtmId();\nfunction getGtmId(){ for (i in google_tag_manager) { if (i.indexOf('GTM') > -1){ return i } } };\n\nvar currentEvent = google_tag_manager[testGtmId].dataLayer.get('event')\nvar currentPageType = google_tag_manager[testGtmId].dataLayer.get('page.type')\nvar currentTestValue;\n  var currentTestType;\n\n  if (currentEvent == 'gtm.js'){\n  \tcurrentTestValue = currentPageType\n    currentTestType = 'page.type'\n  } else { \n    currentTestValue = currentEvent\n    currentTestType = 'event'\n  }\n\nvar dataLayerConfigIndexed = " 
  + JSON.stringify(getDataLayerIndexed()) 
  + "\n\nvar dataLayerConfig = dataLayerConfigIndexed[currentTestValue]\n\nif (!dataLayerConfig){\n  \n  console.log('%cdataLayer Test config not found for ' + currentTestType + ' - ' + currentTestValue + ':', \"color: blue;\")\n\n} else {\n\nvar dataLayerTestResults = {'PASS':{},'FAIL':{},'WARNING':{}}\nvar dataLayerTestResultsToCopy = []\n\nvar testUrl = location.href;\n Date.prototype.ddmmyyyy = function() {\n   var yyyy = this.getFullYear().toString();\n   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based\n   var dd  = this.getDate().toString();\n   return (dd[1]?dd:\"0\"+dd[0])+'/'+(mm[1]?mm:\"0\"+mm[0])+'/'+yyyy; // padding\n  };\n\nd = new Date();\nvar testDate = d.ddmmyyyy();\nvar testTime = d.getHours() + ':' + d.getMinutes();\n\n\nfor (var i = 0; i < dataLayerConfig.length; i++){\n\nvar dlKey = dataLayerConfig[i][0];\nvar dlType = dataLayerConfig[i][1];\nvar dlRequierement = dataLayerConfig[i][2];\nvar dlValue = google_tag_manager[testGtmId].dataLayer.get(dlKey)\n\nvar result = '';\nvar reason = '';\n\nif (dlValue !== undefined && dlValue != ''){\n\n\tresult = 'PASS'\n\treason = 'Key and value found'\n\n} else if (dlValue !== undefined && dlValue == '' && dlRequierement == 'REQ - ALWAYS') {\n\n\tresult = 'FAIL'\n\treason = 'Value missing and is required'\n\n} else if (dlValue !== undefined && dlValue == '' && dlRequierement == 'REQ - CAN BE BLANK') {\n\n\tresult = 'WARNING'\n\treason = 'Value missing but can be blank'\n\n} else if (dlValue !== undefined && dlValue == '' && dlRequierement == 'OPT') {\n\n\tresult = 'WARNING'\n\treason = 'Value missing but is optional'\n\n} else if (dlValue === undefined && dlRequierement == 'OPT') {\n\n\tresult = 'WARNING'\n\treason = 'Key missing but is optional'\n\n} else if (!!dlValue && dlValue == dlRequierement) {\n\n\tresult = 'PASS'\n\treason = 'Value matches required value'\n\n} else if (dlValue === undefined){\n\n\tresult = 'FAIL'\n\treason = 'Key missing from Data Layer'\n\n}\n\ndataLayerTestResults[result][dlKey] = {\n\t'result': result,\n\t'reason': reason,\n\t'value': dlValue,\n\t'type': dlType,\n\t'requierement': dlRequierement\n}\n\ndataLayerTestResultsToCopy.push([testGtmId, testUrl, testDate, testTime, dlKey, result, reason, dlValue, dlType, dlRequierement])\n\n}\nconsole.log('%cdataLayer Test Results for ' + currentTestType + ' - ' + currentTestValue + ':', \"color: blue;\")\nconsole.log('%cdataLayer Tests Failed:', \"color: blue;\")\nconsole.table(dataLayerTestResults['FAIL'])\nconsole.log('----------------------')\n\nconsole.log('%cdataLayer Tests Warning:', \"color: blue;\")\nconsole.table(dataLayerTestResults['WARNING'])\nconsole.log('----------------------')\n\nconsole.log('%cdataLayer Tests Passed:', \"color: blue;\")\nconsole.table(dataLayerTestResults['PASS'])\nconsole.log('----------------------')\n\nconsole.log('%cdataLayer Results To Copy To Spreadsheet:', \"color: blue;\")\n// reformat using sheetclip https://github.com/warpech/sheetclip\nconsole.log(SheetClip.stringify(dataLayerTestResultsToCopy))\n}\n  </script>"
  var output = JSON.stringify(getDataLayerIndexed()) 
  Logger.log('output')
  Logger.log(output)
  
}

function createQaTagInGtm(){
  
  var output = "<script>\n/**\n * SheetClip - Spreadsheet Clipboard Parser\n * version 0.2\n *\n * This tiny library transforms JavaScript arrays to strings that are pasteable by LibreOffice, OpenOffice,\n * Google Docs and Microsoft Excel.\n *\n * Copyright 2012, Marcin Warpechowski\n * Licensed under the MIT license.\n * http://github.com/warpech/sheetclip/\n */\n/*jslint white: true*/\n!function(n){\"use strict\";function e(n){return n.split('\"').length-1}n.SheetClip={parse:function(n){var t,r,l,i,g,p,s,u=[],f=0;for(l=n.split(\"\\n\"),l.length>1&&\"\"===l[l.length-1]&&l.pop(),t=0,r=l.length;r>t;t+=1){for(l[t]=l[t].split(\"\t\"),i=0,g=l[t].length;g>i;i+=1)u[f]||(u[f]=[]),p&&0===i?(s=u[f].length-1,u[f][s]=u[f][s]+\"\\n\"+l[t][0],p&&1&e(l[t][0])&&(p=!1,u[f][s]=u[f][s].substring(0,u[f][s].length-1).replace(/\"\"/g,'\"'))):i===g-1&&0===l[t][i].indexOf('\"')&&1&e(l[t][i])?(u[f].push(l[t][i].substring(1).replace(/\"\"/g,'\"')),p=!0):(u[f].push(l[t][i].replace(/\"\"/g,'\"')),p=!1);p||(f+=1)}return u},stringify:function(n){var e,t,r,l,i,g=\"\";for(e=0,t=n.length;t>e;e+=1){for(r=0,l=n[e].length;l>r;r+=1)r>0&&(g+=\"\t\"),i=n[e][r],g+=\"string\"==typeof i?i.indexOf(\"\\n\")>-1?'\"'+i.replace(/\"/g,'\"\"')+'\"':i:null===i||void 0===i?\"\":i;g+=\"\\n\"}return g}}}(window);\n\nvar testGtmId = getGtmId();\nfunction getGtmId(){ for (i in google_tag_manager) { if (i.indexOf('GTM') > -1){ return i } } };\n\nvar currentEvent = google_tag_manager[testGtmId].dataLayer.get('event')\nvar currentPageType = google_tag_manager[testGtmId].dataLayer.get('page.type')\nvar currentTestValue;\n  var currentTestType;\n\n  if (currentEvent == 'gtm.js'){\n  \tcurrentTestValue = currentPageType\n    currentTestType = 'page.type'\n  } else { \n    currentTestValue = currentEvent\n    currentTestType = 'event'\n  }\n\nvar dataLayerConfigIndexed = "
  + "{{js - dataLayer for QA tag}}"
  + "\n\nvar dataLayerConfig = dataLayerConfigIndexed[currentTestValue]\n\nif (!dataLayerConfig){\n  \n  console.log('%cdataLayer Test config not found for ' + currentTestType + ' - ' + currentTestValue + ':', \"color: blue;\")\n\n} else {\n\nvar dataLayerTestResults = {'PASS':{},'FAIL':{},'WARNING':{}}\nvar dataLayerTestResultsToCopy = []\n\nvar testUrl = location.href;\n Date.prototype.ddmmyyyy = function() {\n   var yyyy = this.getFullYear().toString();\n   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based\n   var dd  = this.getDate().toString();\n   return (dd[1]?dd:\"0\"+dd[0])+'/'+(mm[1]?mm:\"0\"+mm[0])+'/'+yyyy; // padding\n  };\n\nd = new Date();\nvar testDate = d.ddmmyyyy();\nvar testTime = d.getHours() + ':' + d.getMinutes();\n\n\nfor (var i = 0; i < dataLayerConfig.length; i++){\n\nvar dlKey = dataLayerConfig[i][0];\nvar dlType = dataLayerConfig[i][1];\nvar dlRequierement = dataLayerConfig[i][2];\nvar dlValue = google_tag_manager[testGtmId].dataLayer.get(dlKey)\n\nvar result = '';\nvar reason = '';\n\nif (dlValue !== undefined && dlValue != ''){\n\n  result = 'PASS'\n  reason = 'Key and value found'\n\n} else if (dlValue !== undefined && dlValue == '' && dlRequierement == 'REQ - ALWAYS') {\n\n  result = 'FAIL'\n  reason = 'Value missing and is required'\n\n} else if (dlValue !== undefined && dlValue == '' && dlRequierement == 'REQ - CAN BE BLANK') {\n\n  result = 'WARNING'\n  reason = 'Value missing but can be blank'\n\n} else if (dlValue !== undefined && dlValue == '' && dlRequierement == 'OPT') {\n\n  result = 'WARNING'\n  reason = 'Value missing but is optional'\n\n} else if (dlValue === undefined && dlRequierement == 'OPT') {\n\n  result = 'WARNING'\n  reason = 'Key missing but is optional'\n\n} else if (!!dlValue && dlValue == dlRequierement) {\n\n  result = 'PASS'\n  reason = 'Value matches required value'\n\n} else if (dlValue === undefined){\n\n  result = 'FAIL'\n  reason = 'Key missing from Data Layer'\n\n}\n\ndataLayerTestResults[result][dlKey] = {\n\t'result': result,\n\t'reason': reason,\n\t'value': dlValue,\n\t'type': dlType,\n\t'requierement': dlRequierement\n}\n\ndataLayerTestResultsToCopy.push([testGtmId, currentTestType, currentTestValue, testUrl, testDate, testTime, dlKey, result, reason, dlValue, dlType, dlRequierement])\n\n}\n\nlocalStorage.setItem('taQaResult|'+Date.now()+'|'+location.href,JSON.stringify(dataLayerTestResultsToCopy))\n\nElement.prototype.remove = function() {\n    this.parentElement.removeChild(this);\n}\nNodeList.prototype.remove = HTMLCollection.prototype.remove = function() {\n    for(var i = this.length - 1; i >= 0; i--) {\n        if(this[i] && this[i].parentElement) {\n            this[i].parentElement.removeChild(this[i]);\n        }\n    }\n}\n\nif (!!document.getElementById(\"ta-datalayer-qa\")){\n  document.getElementById(\"ta-datalayer-qa\").remove();\n}\n\nvar style = document.createElement(\"style\");\nstyle.innerHTML = '#ta-qa-total {width: 100%; border-collapse:collapse;}' + \n'#ta-qa-total th, #ta-qa-total td {width: 33%; font-size: 16px; font-weight: bold; text-align: center; border-right: #f9f9f9 1px solid; }' + \n'#ta-qa-table {margin-top: 10px; font-size: 10px; font-weight: normal; border-collapse:collapse }' + \n'#ta-datalayer-qa {background: #f9f9f9; border: 1px solid #e3e3e3; padding: 5px 10px}' + \n'#ta-datalayer-qa textarea {width: 100%;}' + \n'#ta-qa-table th {padding: 2px 4px; text-align: left; border-right: #f9f9f9 1px solid;}' + \n'#ta-datalayer-qa td {padding: 2px 4px; border-right: #f9f9f9 1px solid;}' + \n'.ta-qa-pass {background-color: #C8E6C9}' + \n'.ta-qa-fail {background-color: #FFCDD2}' + \n'.ta-qa-warning {background-color: #FFE0B2}' + \n'#ta-qa-copy {margin-top: 10px}' + \n\ndocument.body.appendChild(style);\n\nvar htmlTable = ''\nvar newTableRow = '<tr><th>Key Name</th><th>QA Result</th><th>Reason</th><th>Value</th><th>Expected Format</th><th>Requirement</th></tr>'\nhtmlTable += newTableRow\nvar qaPassTotal = 0\nvar qaFailTotal = 0\nvar qaWarningTotal = 0\n\nfor (var i = 0; i < dataLayerTestResultsToCopy.length; i++){\nvar d = dataLayerTestResultsToCopy[i]\nvar qaR = d[7]\n\nif (qaR == 'PASS'){ \nvar qaBgCls = 'ta-qa-pass'\nqaPassTotal++\n} else if (qaR == 'FAIL'){\nvar qaBgCls = 'ta-qa-fail'\nqaFailTotal++\n} else {\nvar qaBgCls = 'ta-qa-warning'\nqaWarningTotal++\n}\n\nvar newTableRow = '<tr class=\"'+ qaBgCls +'\"><td>'+d[6]+'</td><td>'+d[7]+'</td><td>'+d[8]+'</td><td>'+d[9]+'</td><td>'+d[10]+'</td><td>'+d[11]+'</td></tr>'\nhtmlTable += newTableRow\n\n}\n\nvar htmlTableTotal = '<tr><th class=\"ta-qa-pass\">PASS</th><th class=\"ta-qa-fail\">FAIL</th><th class=\"ta-qa-warning\">WARNING</th></tr>' + \n'<tr><td class=\"ta-qa-pass\">'+ qaPassTotal +'</td><td class=\"ta-qa-fail\">'+ qaFailTotal +'</td><td class=\"ta-qa-warning\">'+ qaWarningTotal +'</td></tr>'\n\nvar previousQaResults = [];\n\n// get all previous results from local storage\nfor (var i = 0; i < localStorage.length; i++){\n  if (localStorage.key(i).indexOf('taQa') > -1){\n    //console.log(localStorage.key(i))\n    //console.log(localStorage.getItem(localStorage.key(i)))\n    previousQaResults = previousQaResults.concat(JSON.parse(localStorage.getItem(localStorage.key(i))))\n  }\n}\n\nvar div = document.createElement(\"div\");\ndiv.id = \"ta-datalayer-qa\";\ndiv.style.width = \"500px\";\ndiv.style.height = \"400px\";\ndiv.style.overflow = \"scroll\";\n//div.style.background = \"#f3f3f3\";\ndiv.style.fontFamily = \"verdana\";\ndiv.style.fontSize = \"10px\";\ndiv.style.color = \"#333\";\ndiv.style.position = 'fixed';\ndiv.style.top = '20px';\ndiv.style.right = '20px';\ndiv.innerHTML = '<h2 class=\"\">Data Layer QA Results<h2>'+\n'<table id=\"ta-qa-total\"> <tbody id=\"tbody\">'+ htmlTableTotal +'</tbody></table>' + \n'<table id=\"ta-qa-table\"> <tbody id=\"tbody\">'+ htmlTable +'</tbody></table>' + \n'<h4>Select all and copy into your spreadsheet</h4><p><a href=\"\">Google Sheet link</a></p>' + \n'<textarea id=\"ta-qa-copy\" rows=\"10\">'+SheetClip.stringify(dataLayerTestResultsToCopy)+'</textarea>' +\n'<h2 class=\"\">Previous QA Results<h2>'+\n'<h4>Select and copy all previous results</h4>' +\n'<textarea id=\"ta-qa-copy\" rows=\"10\">'+SheetClip.stringify(previousQaResults)+'</textarea>'\n\ndocument.body.appendChild(div);\n\n/*console.log('%cdataLayer Test Results for ' + currentTestType + ' - ' + currentTestValue + ':', \"color: blue;\")\nconsole.log('%cdataLayer Tests Failed:', \"color: blue;\")\nconsole.table(dataLayerTestResults['FAIL'])\nconsole.log('----------------------')\n\nconsole.log('%cdataLayer Tests Warning:', \"color: blue;\")\nconsole.table(dataLayerTestResults['WARNING'])\nconsole.log('----------------------')\n\nconsole.log('%cdataLayer Tests Passed:', \"color: blue;\")\nconsole.table(dataLayerTestResults['PASS'])\nconsole.log('----------------------')\n\nconsole.log('%cdataLayer Results To Copy To Spreadsheet:', \"color: blue;\")\n// reformat using sheetclip https://github.com/warpech/sheetclip\nconsole.log(SheetClip.stringify(dataLayerTestResultsToCopy))*/\n\n\n}\n</script>"
  
  //Logger.log(output)
  
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  var triggersObj = getTriggersLookupObject();
  var triggerIdAllPages = triggersObj['all pages - debug mode equals true']['triggerId']
  var triggerIdAllEvents = triggersObj['all events - debug mode equals true']['triggerId']
  Logger.log(triggerIdAllPages)
  Logger.log(triggerIdAllEvents)
  
  var data = {
    "name": "Tagging Automation - dataLayer QA",
    "type": "html",
    "firingTriggerId": [
      triggerIdAllPages,
      triggerIdAllEvents
    ],
    "parameter": [
      {
        "type": "template",
        "key": "html",
        "value": output
      }
    ]
  }
  
  var payload = JSON.stringify(data);
  
  // Because payload is a JavaScript object, it will be interpreted as
  // an HTML form. (We do not need to specify contentType; it will
  // automatically default to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  
  var options =
      { "contentType" : "application/json",
       "muteHttpExceptions" : true,
       "method" : "post",
       "headers" : {
         Authorization: 'Bearer ' + gtmService.getAccessToken()
       },
       "payload" : payload
      };
  
  try {
    var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/tags', options);
    Logger.log(JSON.parse(response.getContentText()))
  }
  catch (e) {
    // statements to handle any exceptions
    Logger.log(e); // pass exception object to error handler
  }
}

function getCdGaReportsQaResults(){
  
  var values = [
    ['Subscriber', 'CD - USER', '1'],
    ['Exited', 'CD - SESSION', '2'],
    ['Available', 'CD - HIT', '3'],
    ['pageType', 'CD - HIT', '4'],
    ['Product ID', 'CD - HIT', '5'],
    ['Member', 'CD - USER', '6']
  ];
  
  var accountId = '40777649'
  var propertyId = 'UA-40777649-2'    
  var profileId = '73156703'
  
  var dimensions = Analytics.Management.CustomDimensions.list(accountId, propertyId)
  
  if (dimensions.items && dimensions.items.length) {
    
    var dimensionsValues = dimensions.items.map(function(obj){ 
      //Logger.log(JSON.stringify(obj))
      return [obj.name, obj.scope, obj.index];
    });
    
  }
  
  var values = dimensionsValues;
  
  Logger.log('dimensionsValues')
  Logger.log(dimensionsValues)
  
  for (var i = 0; i < values.length; i++){
    
    var dimensions =  'ga:dimension'+ values[i][2];
    var metric = 'ga:hits'
    var realName = values[i][0]
    var scope = values[i][1]
    
    runCdGaReportQa(profileId,dimensions,metric,i,realName,scope)
    
  }
  
}

function runCdGaReportQa(profileId,dimensions,metric,i,realName,scope) {
  var today = new Date();
  var oneWeekAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  var startDate = Utilities.formatDate(oneWeekAgo, Session.getTimeZone(),
                                       'yyyy-MM-dd');
  var endDate = Utilities.formatDate(today, Session.getTimeZone(),
                                     'yyyy-MM-dd');
  
  //var profileId = '73156703'
  
  var tableId  = 'ga:' + profileId;
  //var metric = 'ga:hits';
  //var dimensions = 'ga:dimension1'
  var options = {
    'dimensions': dimensions,
    'sort': '-ga:hits',
    'max-results': 5
  };
  
  //var i = 4
  var report = Analytics.Data.Ga.get(tableId, startDate, endDate, metric,
                                     options);
  
  if (report.rows) {
    
    Logger.log(report.rows)
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    var sheet = spreadsheet.getSheetByName('GA Data QA')
    
    // Append the headers.
    var headers = report.columnHeaders.map(function(columnHeader) {
      return columnHeader.name;
    });
    //sheet.appendRow(headers);
    
    // Append the results.
    sheet.getRange((i*7)+3, 1, 1, 4)
    .setValues([[realName + ' - ' + scope + ' - ' + dimensions,'Hits','QA Date', new Date()]]);
    
    sheet.getRange((i*7)+3, 1, 1, 4).setBackground('#6aa84f')
    
    // Append the results.
    sheet.getRange((i*7)+4, 1, report.rows.length, headers.length)
    .setValues(report.rows);
    
  } else {
    Logger.log('No rows returned.');
    
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    var sheet = spreadsheet.getSheetByName('GA Data QA')
    
    // Append the headers.
    var headers = report.columnHeaders.map(function(columnHeader) {
      return columnHeader.name;
    });
    //sheet.appendRow(headers);
    
    // Append the results.
    sheet.getRange((i*7)+3, 1, 1, 4)
    .setValues([[realName + ' - ' + scope + ' - ' + dimensions,'Hits','QA Date', new Date()]]);
    
    sheet.getRange((i*7)+3, 1, 1, 4).setBackground('#ea9999')
    
    // Append the results.
    sheet.getRange((i*7)+4, 1, 1, 2)
    .setValues([['No data returned','']]);
  }
}

function getCmGaReportsQaResults(){
  
  var values = [
    ['Subscriber', 'CD - USER', '1'],
    ['Exited', 'CD - SESSION', '2'],
    ['Available', 'CD - HIT', '3'],
    ['pageType', 'CD - HIT', '4'],
    ['Product ID', 'CD - HIT', '5'],
    ['Member', 'CD - USER', '6']
  ];
  
  var accountId = '40777649'
  var propertyId = 'UA-40777649-2'    
  var profileId = '73156703'
  
  //var dimensions = Analytics.Management.CustomDimensions.list(accountId, propertyId)
  var metrics = Analytics.Management.CustomMetrics.list(accountId, propertyId)
  
  if (metrics.items && metrics.items.length) {
    
    var metricsValues = metrics.items.map(function(obj){ 
      //Logger.log(JSON.stringify(obj))
      return [obj.name, obj.scope, obj.index];
    });
    
  }
  
  var values = metricsValues;
  
  for (var i = 0; i < values.length; i++){
    
    var dimensions =  'ga:deviceCategory';
    var metric = 'ga:metric'+ values[i][2];
    var realName = values[i][0]
    var scope = values[i][1]
    
    runCmGaReportQa(profileId,dimensions,metric,i,realName,scope)
    
  }
  
}

function runCmGaReportQa(profileId,dimensions,metric,i,realName,scope) {
  var today = new Date();
  var oneWeekAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  var startDate = Utilities.formatDate(oneWeekAgo, Session.getTimeZone(),
                                       'yyyy-MM-dd');
  var endDate = Utilities.formatDate(today, Session.getTimeZone(),
                                     'yyyy-MM-dd');
  
  //var profileId = '73156703'
  
  var tableId  = 'ga:' + profileId;
  //var metric = 'ga:hits';
  //var dimensions = 'ga:dimension1'
  var options = {
    'dimensions': dimensions,
    'sort': '-'+metric,
    'max-results': 5
  };
  
  //var i = 4
  var report = Analytics.Data.Ga.get(tableId, startDate, endDate, metric,
                                     options);
  
  if (report.rows) {
    
    Logger.log(report.rows)
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    var sheet = spreadsheet.getSheetByName('GA Data QA')
    
    // Append the headers.
    var headers = report.columnHeaders.map(function(columnHeader) {
      return columnHeader.name;
    });
    //sheet.appendRow(headers);
    
    // Append the results.
    sheet.getRange((i*7)+3, 6, 1, 4)
    .setValues([['Device Category',realName + ' - ' + metric + ' - ' + scope,'QA Date', new Date()]]);
    
    sheet.getRange((i*7)+3, 6, 1, 4).setBackground('#6aa84f')
    
    // Append the results.
    sheet.getRange((i*7)+4, 6, report.rows.length, headers.length)
    .setValues(report.rows);
    
  } else {
    Logger.log('No rows returned.');
    
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    var sheet = spreadsheet.getSheetByName('GA Data QA')
    
    // Append the headers.
    var headers = report.columnHeaders.map(function(columnHeader) {
      return columnHeader.name;
    });
    //sheet.appendRow(headers);
    
    // Append the results.
    sheet.getRange((i*7)+3, 6, 1, 4)
    .setValues([['Device Category',realName + ' - ' + metric + ' - ' + scope,'QA Date', new Date()]]);
    
    sheet.getRange((i*7)+3, 6, 1, 4).setBackground('#ea9999')
    
    // Append the results.
    sheet.getRange((i*7)+4, 6, 1, 2)
    .setValues([['No data returned','']]);
  }
}


function flatten(target, opts) {
  opts = opts || {}
  
  var delimiter = opts.delimiter || '.'
  var output = {}
  
  function step(object, prev) {
    Object.keys(object).forEach(function(key) {
      var value = object[key]
      var isarray = opts.safe && Array.isArray(value)
      var type = Object.prototype.toString.call(value)
      var isbuffer = isBuffer(value)
      var isobject = (
        type === "[object Object]" ||
        type === "[object Array]"
      )
      
      var newKey = prev
      ? prev + delimiter + key
      : key
      
      if (!isarray && !isbuffer && isobject && Object.keys(value).length) {
        return step(value, newKey)
      }
      
      output[newKey] = value
    })
  }
  
  step(target)
  
  return output
}

function unflatten(target, opts) {
  opts = opts || {}
  
  var delimiter = opts.delimiter || '.'
  var overwrite = opts.overwrite || false
  var result = {}
  
  var isbuffer = isBuffer(target)
  if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
    return target
  }
  
  // safely ensure that the key is
  // an integer.
  function getkey(key) {
    var parsedKey = Number(key)
    
    return (
      isNaN(parsedKey) ||
      key.indexOf('.') !== -1
    ) ? key
    : parsedKey
  }
  
  Object.keys(target).forEach(function(key) {
    var split = key.split(delimiter)
    var key1 = getkey(split.shift())
    var key2 = getkey(split[0])
    var recipient = result
    
    while (key2 !== undefined) {
      var type = Object.prototype.toString.call(recipient[key1])
      var isobject = (
        type === "[object Object]" ||
        type === "[object Array]"
      )
      
      if ((overwrite && !isobject) || (!overwrite && recipient[key1] === undefined)) {
        recipient[key1] = (
          typeof key2 === 'number' &&
          !opts.object ? [] : {}
        )
      }
      
      recipient = recipient[key1]
      if (split.length > 0) {
        key1 = getkey(split.shift())
        key2 = getkey(split[0])
      }
    }
    
    // unflatten again for 'messy objects'
    recipient[key1] = unflatten(target[key], opts)
  })
  
  return result
}

function isBuffer(value) {
  if (typeof Buffer === 'undefined') return false
  return Buffer.isBuffer(value)
}

function createGtmVariablesDataLayerIndexed() {
  var gtmService = getGtmService();
  
  var accountId = GTM_ACCOUNT_ID;
  var containerId = GTM_CONTAINER_ID;
  
  var output = 'function(){\n\nvar dlIndexed = '+JSON.stringify(getDataLayerIndexed()) + '\n\nreturn dlIndexed\n\n}'
  
  var data =
      {
        'name': "js - dataLayer for QA tag",
        'type': 'jsm',
        'parameter': [
          {"type":"template",
           "key":"javascript",
           "value":output}
        ]
      };
  
  var payload = JSON.stringify(data);
  
  // Because payload is a JavaScript object, it will be interpreted as
  // an HTML form. (We do not need to specify contentType; it will
  // automatically default to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  
  var options =
      { "contentType" : "application/json",
       "muteHttpExceptions" : true,
       "method" : "post",
       "headers" : {
         Authorization: 'Bearer ' + gtmService.getAccessToken()
       },
       "payload" : payload
      };
  
  try {
    var response = UrlFetchApp.fetch('https://www.googleapis.com/tagmanager/v1/accounts/'+accountId+'/containers/'+containerId+'/variables', options);
    Logger.log(JSON.parse(response.getContentText()))
  }
  catch (e) {
    // statements to handle any exceptions
    Logger.log(e); // pass exception object to error handler
  }
  
}
