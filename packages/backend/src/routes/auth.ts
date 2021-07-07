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
import { devCredentials } from "../config.json"

passport.use("sso", new SAMLStrategy({
  path: "/auth/callback",
  entryPoint: "https://idp.clemson.edu/idp/profile/SAML2/Redirect/SSO",
  issuer: "CEVAC",
  cert: "cert"
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
  "/auth/callback",
  bodyParser.urlencoded({ extended: true }),
  passport.authenticate("sso", { failureRedirect: "/", failureFlash: true }),
  function (req, res) {
    console.log(req.user, req.isAuthenticated())

    res.redirect("/");
  }
);


export default router;