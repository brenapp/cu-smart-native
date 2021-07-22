/**
 * Handles Single Sign through Clemson"s System using SAML2 over Shibboleth, using passport and
 * passport-saml. Additionally provides a development login system using simple usernames and
 * passwords. This system is temporary until we can get the authentication system working!
 */

import passport from "passport"
import { Strategy as SAMLStrategy } from "passport-saml"
import { Strategy as LocalStrategy } from "passport-local"
import * as bodyParser from "body-parser"
import { Router } from "express"
import { saml, devCredentials } from "../config.json";



passport.use("sso", new SAMLStrategy({
  callbackUrl: saml.callbackUrl,
  entryPoint: saml.entryPoint,
  issuer: saml.issuer,
  privateKey: saml.privateKey, //SP private key in .pem format
  cert: saml.cert, //IdP public key in .pem format
  decryptionPvk: saml.decryptionPvk, //same as privateKey
  identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient', 
  authnContext: ['urn:oasis:names:tc:SAML:2.0:ac:classes:unspecified'],
  authnRequestBinding: 'HTTP-REDIRECT',
  protocol: 'https://',
  signatureAlgorithm: 'sha256',
  acceptedClockSkewMs: -1
}, (request, profile, done) => {
  console.log("AUTH", profile);
  done(null);
}))

passport.use("local", new LocalStrategy((username, password, done) => {

  const usernames = Object.keys(devCredentials);

  if (!usernames.includes(username)) {
    return done(null, false, { "message": "Incorrect username" })
  }

  // Cast: we are ensuring that username is a key in the above section
  if (password != (devCredentials as Record<string, string>)[username]) {
    return done(null, false, { "message": "Incorrect password" })
  };

  return done(null, username);

}));


const router = Router();

router.get("/auth", passport.authenticate("sso"));
router.post("/auth/dev", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/failure",
}))

router.post(
  saml.callbackUrl,
  bodyParser.urlencoded({ extended: true }),
  passport.authenticate("sso", { failureRedirect: "/", failureFlash: true }),
  function (req, res) {
    console.log(req.user, req.isAuthenticated())

    res.redirect("/");
  }
);


export default router;