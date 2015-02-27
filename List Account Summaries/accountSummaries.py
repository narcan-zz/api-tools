#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys

# import the Auth Helper class
# Note, it's important that the name of the class match what is used here (i.e. auth.py)
import auth

from apiclient.errors import HttpError
from oauth2client.client import AccessTokenRefreshError


def main(argv):
  # Step 1. Get an analytics service object.
  service = auth.initialize_service()

  # Requests a list of all account summaries for the authorized user.
  try:
    account_summaries = service.management().accountSummaries().list().execute()
    print_account_summaries(account_summaries, service)

  except TypeError, error:
    # Handle errors in constructing a query.
    print 'There was an error in constructing your query : %s' % error

  except HttpError, error:
    # Handle API errors.
    print 'An error occurred: %s' % error


# The results of the list method are stored in the account_summaries object.
# The following code iterates through each account, property, and view in
# the account summary list and outputs the name and Id.

def print_account_summaries(account_summaries,service):
  if account_summaries:
    for account in account_summaries.get('items', []):
      print '\n%s (%s)' % (account.get('name'), account.get('id'))
      print_property_summaries(account, service)


def print_property_summaries(account, service):
  if account:
    for property in account.get('webProperties', []):
      print '    (%s | %s) %s' % (property.get('id'), property.get('level'), property.get('name'))
      print_view_summary(property, account, service)


def print_view_summary(property, account, service):
  if property:
    for view in property.get('profiles', []):
      print '        [%s] - %s (%s)' % (view.get('type'), view.get('name'), view.get('id'))
      get_user_links(view, property, account, service)

def get_user_links(view, property, account, service):
  try:
    profile_links = service.management().profileUserLinks().list(
      accountId = account.get('id'),
      webPropertyId = property.get('id'),
      profileId = view.get('id')
    ).execute()

    # Iterate through the results of the list method (stored in the profile_links object)
    for profileUserLink in profile_links.get('items', []):
      userRef = profileUserLink.get('userRef', {})
      #permissions = profileUserLink.get('permissions', {})

      print '            %s' % userRef.get('email')
      #print '            %s (%s)' % (userRef.get('email'), permissions.get('effective'))

  except HttpError, error:
    # Handle API errors.
    print '            Insufficient privileges to display users'


if __name__ == '__main__':
  main(sys.argv)
