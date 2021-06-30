/**
 * Handles Single Sign through Clemson's System using SAML2 over Shibboleth, using passport and passport-saml. 
 */

import app from "../main"
import passport from "passport"
import { Strategy as SAMLStrategy } from "passport-saml"
import * as bodyParser from "body-parser"

passport.use("sso", new SAMLStrategy({
    path: "/auth/callback",
    entryPoint: "https://idp.clemson.edu/idp/profile/SAML2/Redirect/SSO",
    issuer: "CEVAC",
    cert: "cert"
}, (request, profile, done) => {
    console.log("AUTH", profile);
    done(null);
}))


app.get("/auth", passport.authenticate("sso"))


app.post(
    "/auth/callback",
    bodyParser.urlencoded({ extended: true }),
    passport.authenticate("sso", { failureRedirect: "/", failureFlash: true }),
    function (req, res) {
        console.log(req.user, req.isAuthenticated())

      res.redirect("/");
    }
  );