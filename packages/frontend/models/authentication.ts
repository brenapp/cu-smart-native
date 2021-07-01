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

import useGlobalHook from 'use-global-hook';

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
