/**
 * Handles Single Sign through Clemson's System using SAML2 over Shibboleth, using passport and passport-saml. 
 */

import app from "../main"
import passport from "passport"
import { Strategy as SAMLStrategy } from "passport-saml"

passport.use("sso", new SAMLStrategy({
    path: "/login/callback",
    entryPoint: "https://idp.clemson.edu/idp/profile/SAML2/Redirect/SSO",
    issuer: "CEVAC",
    cert: "cert"
}, (request, profile, done) => {

}))


app.get("/auth", passport.authenticate("sso"))