#!/usr/bin/python

# import required classes
import httplib2
import argparse
from apiclient import errors
from apiclient.discovery import build
from oauth2client import tools
from oauth2client.file import Storage
from oauth2client.tools import run_flow
from oauth2client.client import flow_from_clientsecrets

# Declare constants and set configuration values

# The file with the OAuth 2.0 Client details for authentication and authorization.
# modify the line below to be the name of YOUR client secrets file
CLIENT_SECRETS = 'client_secrets.json'

# A helpful message to display if the CLIENT_SECRETS file is missing.
MISSING_CLIENT_SECRETS_MESSAGE = '%s is missing' % CLIENT_SECRETS

# The Flow object to be used if we need to authenticate.
FLOW = flow_from_clientsecrets(CLIENT_SECRETS,
    scope=#'https://www.googleapis.com/auth/analytics.readonly '
      'https://www.googleapis.com/auth/analytics.manage.users '
      'https://www.googleapis.com/auth/analytics.edit ',
    message=MISSING_CLIENT_SECRETS_MESSAGE)

# A file to store the access token
TOKEN_FILE_NAME = 'analytics.dat'

def prepare_credentials():
  # Retrieve existing credendials
  storage = Storage(TOKEN_FILE_NAME)
  credentials = storage.get()

   # If existing credentials are invalid and Run Auth flow
  # the run method will store any new credentials
  if credentials is None or credentials.invalid:
    flags = tools.argparser.parse_args(args=[])
    credentials = tools.run_flow(FLOW, storage, flags)#run Auth Flow and store credentials

  return credentials

def initialize_service():
  # 1. Create an http object
  http = httplib2.Http()

  # 2. Authorize the http object
  # Try to retrieve stored credentials. If none are found then run the Auth Flow.
  # This is handled by the prepare_credentials() function defined earlier
  credentials = prepare_credentials()
  http = credentials.authorize(http)  # authorize the http object

  # 3. Build the Analytics Service Object with the authorized http object
  return build('analytics', 'v3', http=http)
