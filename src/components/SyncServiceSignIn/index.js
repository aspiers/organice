/* global process, gapi */

import React, { PureComponent, useState } from 'react';

import './stylesheet.css';

import DropboxLogo from './dropbox.svg';
import GoogleDriveLogo from './google_drive.png';

import { persistField } from '../../util/settings_persister';

import { Dropbox } from 'dropbox';

import _ from 'lodash';

function WebDAVForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return !isVisible ? (
    <div
      id="webdavLogin"
      onClick={() => {
        setIsVisible(true);
      }}
    >
      <h2>WebDAV</h2>
    </div>
  ) : (
    <div id="webdavLogin">
      <h2>WebDAV</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          persistField('authenticatedSyncService', 'WebDAV');
          persistField('webdavEndpoint', url);
          persistField('webdavUsername', username);
          persistField('webdavPassword', password);
          window.location = window.location.origin + '/';
        }}
      >
        <p>
          <label>URL:</label>
          <input
            name="url"
            type="url"
            value={url}
            className="textfield"
            onChange={(e) => {
              setUrl(e.target.value);
            }}
          />
        </p>
        <p>
          <label>Username:</label>
          <input
            type="text"
            className="textfield"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
        </p>
        <p>
          <label>Password:</label>
          <input
            type="password"
            className="textfield"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </p>
        <input type="submit" value="Sign-in" />
      </form>
    </div>
  );
}

function GoogleDriveNote() {
  const [isVisible, setIsVisible] = useState(false);

  return !isVisible ? (
    <div
      id="googleDriveNote"
      onClick={() => {
        setIsVisible(true);
      }}
    >
      <h4>Click to read news regarding use of Google drive</h4>
    </div>
  ) : (
    <div id="googleDriveNote">
      <h2>News regarding use of Google drive</h2>
      We are waiting for Google to put{' '}
      <a href="https://github.com/200ok-ch/organice/issues/127">
        Google Drive for this instance into production mode
      </a>
      . Until that has happend, only 100 users can use this instance of organice. If you cannot log
      in here, but want to use Google Drive,{' '}
      <a href="https://organice.200ok.ch/documentation.html#google_drive">
        here are the instructions
      </a>{' '}
      on running your own instance of organice with Google Drive enabled.
      <p>
        If you don't want to do that, you are welcome to use Dropbox or WebDAV as synchronisation
        back-ends.
      </p>
    </div>
  );
}

export default class SyncServiceSignIn extends PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, ['handleDropboxClick', 'handleGoogleDriveClick']);
  }

  handleDropboxClick() {
    persistField('authenticatedSyncService', 'Dropbox');

    const dropbox = new Dropbox({
      clientId: process.env.REACT_APP_DROPBOX_CLIENT_ID,
      fetch: fetch.bind(window),
    });
    const authURL = dropbox.auth.getAuthenticationUrl(window.location.origin + '/');
    window.location = authURL;
  }

  handleGoogleDriveClick() {
    try {
      gapi.load('client:auth2', () => {
        gapi.client
          .init({
            apiKey: process.env.REACT_APP_GOOGLE_DRIVE_API_KEY,
            clientId: process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            scope: 'https://www.googleapis.com/auth/drive',
          })
          .then(() => {
            persistField('authenticatedSyncService', 'Google Drive');

            gapi.auth2.getAuthInstance().signIn({
              ux_mode: 'redirect',
              redirect_uri: window.location.origin,
            });
          });
      });
    } catch (error) {
      alert(
        `The Google Drive API client isn't available - you might be blocking it with an ad blocker`
      );
      return;
    }
  }

  render() {
    return (
      <div className="sync-service-sign-in-container">
        <p className="sync-service-sign-in__help-text">
          organice syncs your files with Dropbox, Google Drive and WebDAV.
        </p>
        <p className="sync-service-sign-in__help-text">Click to sign in with:</p>

        <div className="sync-service-container" onClick={this.handleDropboxClick}>
          <img src={DropboxLogo} alt="Dropbox logo" className="dropbox-logo" />
        </div>

        <div className="sync-service-container">
          <img
            src={GoogleDriveLogo}
            onClick={this.handleGoogleDriveClick}
            alt="Google Drive logo"
            className="google-drive-logo"
          />
          <GoogleDriveNote />
        </div>

        <div className="sync-service-container">
          <WebDAVForm />
        </div>
      </div>
    );
  }
}
