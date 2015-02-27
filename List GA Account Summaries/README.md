List Account Summaries
---------

A common question some organizations face is, "who has access to all of my analytics data?". This can be answered iteratively in the web interface, but it can be a laborious process. By using the Management API, it is possible to list attributes of the accounts, properties and views to which a user has access.

The program below uses [python](https://www.python.org/) to demonstrate how to:

- iterate through all the accounts of the user running the script
- for each account, list the properties in the account and the level (standard/premium)
- for each property, list the views and the view types (web/app)
- for each view, list the user emails
  - if the user running the script does not have sufficient privileges within the view to display other users, a message saying so will be shown

For this example, you will have to set up program files, client libraries and a programming environment, as well as a project in the Google Developers Console. The steps to set up your environment are documented in the [Hello Analytics Tutorial](https://developers.google.com/analytics/solutions/articles/hello-analytics-api#environment). Additionally, you'll have to set up files to execute the calls to the API. The files below (located in this repo) should be placed in the same folder as each other. Note that the client_secrets.json file needs to be modified with your client secret from the [Google Developers Console](https://console.developers.google.com/).

- `accountSummaries.py` - this is the main file to be run and depends on the contents of auth.py

- `auth.py` - this is the file that handles user authorization and depends on client_secrets.json

- `client_secrets.json` - this is the file that holds the client secret from the Google Developers Console

The output of running these files will vary by user (the program depends on the access level of the user running it), but will look something like this:

```
Account 1 (11111)
  (UA-11111-1 | STANDARD) Demo
    [APP] - All Mobile App Data (00001)
      test1@mail.com
      test2@mail.com
      test3@mail.com

Account 2 (22222)
  (UA-22222-4 | STANDARD) Development Environment
    [WEB] - All Web Site Data (13579)
      test1@mail.com
      test2@mail.com
  (UA-22222-1 | PREMIUM) Production Environment
    [WEB] - 01_Master_11-04-2014 (24680)
      test1@mail.com
      test3@mail.com

Account 3 (33333)
  (UA-33333-2 | PREMIUM) 2013 Annual Report Prod
    [WEB] - All Site Data (12345)
      Insufficient privileges to display users
    [WEB] - Excluding staging links (67890)
      Insufficient privileges to display users
```