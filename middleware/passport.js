require('dotenv').config();
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../db/db.config');

// LinkedIn Strategy Configuration
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CLIENT_URL,
      scope: ['openid', 'profile', 'email'],
      // state: 'your_unique_random_string',
    },
    async (accessToken, refreshToken, profile, cb) => {
      // Check if the LinkedIn profile already exists in your database
      console.log(profile, accessToken);
      await prisma.user
        .findFirst({ where: { linkedinId: profile.id } })
        .then((existingUser) => {
          if (existingUser) {
            return cb(null, existingUser);
          } else {
            // If not, create a new user in your database
            prisma.user
              .create({
                data: {
                  linkedinId: profile.id,
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  password: '',
                  refreshToken: refreshToken,
                },
              })
              .then((newUser) => {
                return cb(null, newUser);
              })
              .catch((err) => {
                return cb(err, null);
              });
          }
        })
        .catch((err) => {
          return cb(err, null);
        });
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CLIENT_URL,
    },
    async (accessToken, refreshToken, profile, cb) => {
      // Check if the LinkedIn profile already exists in your database
      console.log(profile);
      await prisma.user
        .findFirst({ where: { googleId: profile.id } })
        .then((existingUser) => {
          if (existingUser) {
            return cb(null, existingUser);
          } else {
            // If not, create a new user in your database
            prisma.user
              .create({
                data: {
                  googleId: profile.id,
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  password: '',
                  refreshToken: refreshToken,
                },
              })
              .then((newUser) => {
                return cb(null, newUser);
              })
              .catch((err) => {
                return cb(err, null);
              });
          }
        })
        .catch((err) => {
          return cb(err, null);
        });
    }
  )
);

// Serialization and Deserialization of the user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  prisma.user
    .findUnique({ where: { id } })
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

module.exports = passport;
