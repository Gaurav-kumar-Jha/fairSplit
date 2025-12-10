const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register', { pageTitle: 'Register' });
});

router.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            res.redirect('/');
        });
    } catch (e) {
        console.log(e);
        res.redirect('/register');
    }
});

router.get('/login', (req, res) => {
    res.render('users/login', { pageTitle: 'Login' });
});

router.post('/login', (req, res, next) => {
    console.log("Attempting login for:", req.body.username);

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("Login Error:", err);
            return next(err);
        }
        if (!user) {
            console.log("Login Failed:", info);
            // Redirect with error message
            return res.render('users/login', { pageTitle: 'Login', error: info ? info.message : 'Invalid username or password' });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error("req.logIn Error:", err);
                return next(err);
            }
            console.log("Login Successful for:", user.username);

            // Explicitly save session before redirect to ensure cookie is set
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return next(err);
                }
                res.redirect('/');
            });
        });
    })(req, res, next);
});

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;
