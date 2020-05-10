const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const connection = require('./database.js');


function initializePassport(passport, getUserByEmail, getUserById) {
    const authUser = async (email, password, done) => {
        const user = getUserByEmail(email, async function (user) {
            if (user == null) {
                return done(null, false, { message: 'Email is incorrect' });
            }

            try {
                if (await bcrypt.compare(password, user.password)) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'password is incorrect' });
                }
            } catch (e) {
                console.log(e);
                return done(e);
            }
        });
    }

    const registerUser = async (email, password, done) => {
        try {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            console.log("pass:  " + hashedPassword);
            let query = "INSERT INTO korisnicki_racuni(pravo_pristupa, password, email) VALUES (?,?,?)";
            let user = {
                email: email,
                password: password
            }
            connection.query(
                query,
                [
                    3,
                    hashedPassword,
                    email
                ],
                function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        return done(null, false, { message: 'email vec postoji' })
                    }
                    user.id = results.insertId;
                    return done(null, user);
                });
        } catch (e) {
            console.log(e);
            return done(null, false, { message: 'email vec postoji2' })
        }
    }
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email'
    }, authUser));

    passport.use('local-register', new LocalStrategy({
        usernameField: 'email'
    }, registerUser));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        getUserById(id, done);
    });
}

module.exports = initializePassport;