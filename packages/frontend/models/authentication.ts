/**
 * Authentication global hook
 *
 * Components that need to make use of authentication data should simply use this global hook
 *
 * ```
 * const auth = useAuthentication()
 *
 * if (!auth.isAuthenticated()) {
 *  auth.authenticate();
 * }
 *
 * ```
 *
 */

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import useGlobalHook, { Store } from 'use-global-hook';
import AuthenticationScreen from '../screens/Authentication/AuthenticationScreen';

// from @types/node-saml
export interface Profile {
  issuer?: string;
  sessionIndex?: string;
  nameID?: string;
  nameIDFormat?: string;
  nameQualifier?: string;
  spNameQualifier?: string;
  ID?: string;
  mail?: string; // InCommon Attribute urn:oid:0.9.2342.19200300.100.1.3
  email?: string; // `mail` if not present in the assertion
  ['urn:oid:0.9.2342.19200300.100.1.3']?: string;
  getAssertionXml?(): string; // get the raw assertion XML
  getAssertion?(): Record<string, unknown>; // get the assertion XML parsed as a JavaScript object
  getSamlResponseXml?(): string; // get the raw SAML response XML
  [attributeName: string]: unknown; // arbitrary `AttributeValue`s
}

export interface AuthenticationState {
  authenticated: boolean;

  // Token issued by the server
  token?: string;

  // SAML2 profile
  profile?: Profile;
}

export interface AuthenticationActions {
  setPartialState: (state: Partial<AuthenticationState>) => void;

  // Sets the users token after a successful login
  setToken: (token: string) => void;

  logout: () => void;
}

function setPartialState(
  store: Store<AuthenticationState, AuthenticationActions>,
  state: Partial<AuthenticationState>
) {
  store.setState({ ...store.state, ...state });
}


function setToken(
  store: Store<AuthenticationState, AuthenticationActions>,
  token: string
) {
  store.actions.setPartialState({ authenticated: true, token });
}

function logout(
  store: Store<AuthenticationState, AuthenticationActions>,
) {
  store.actions.setPartialState({ authenticated: false, token: "" });
}

const actions = {
  setPartialState,
  setToken,
  logout
};

const initialState: AuthenticationState = {
  authenticated: true,
  token: undefined,
  profile: undefined
}

const useAuthenticationState = useGlobalHook<AuthenticationState, AuthenticationActions>(
  React,
  initialState,
  actions
);


export default function useAuthentication() {
  const [data, actions] = useAuthenticationState();
  const navigation = useNavigation();

  return {
    ...data,

    authenticate() {
      navigation.navigate(AuthenticationScreen.name)
    },

    // Re-export some actions
    logout: actions.logout,
    setToken: actions.setToken
  }
};