// config/passportConfig.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const user = require('../models/userModel'); // Adjust the path as necessary

// Configure Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'signinContact',
    passwordField: 'signinPassword'
  },
  async (signinContact, signinPassword, done) => {
    try {
      const matchedUser = await user.findOne({ userid: signinContact });

      if (!matchedUser) {
        return done(null, false, { message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(signinPassword, matchedUser.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, matchedUser);
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const matchedUser = await user.findById(id);
    done(null, matchedUser);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
