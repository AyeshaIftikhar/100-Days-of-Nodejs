const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const oauthConfig = require('./oauth');

// Serialize user into the sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the sessions
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: oauthConfig.google.clientID,
      clientSecret: oauthConfig.google.clientSecret,
      callbackURL: oauthConfig.google.callbackURL,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0].value,
            provider: 'google'
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          user.avatar = profile.photos[0].value;
          user.provider = 'google';
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: oauthConfig.github.clientID,
      clientSecret: oauthConfig.github.clientSecret,
      callbackURL: oauthConfig.github.callbackURL,
      proxy: true,
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // GitHub may not return email in profile
        const email = profile.emails ? profile.emails[0].value : `${profile.username}@users.noreply.github.com`;
        
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            githubId: profile.id,
            email,
            name: profile.displayName || profile.username,
            avatar: profile.photos[0].value,
            provider: 'github'
          });
        } else if (!user.githubId) {
          user.githubId = profile.id;
          user.avatar = profile.photos[0].value;
          user.provider = 'github';
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;