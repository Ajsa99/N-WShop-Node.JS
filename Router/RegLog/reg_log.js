const express = require("express");
const db = require("../../db/db")
const router = express.Router();

const bcrypt = require("bcryptjs");
const { sign } = require("jsonwebtoken");

const { validateToken } = require("../../middlewares/AuthMidleware");

const jwt = require("jsonwebtoken");

//Reg-Log
router.post('/register', (req, res) => {

    const { Email, Password, PPassword } = req.body;

    const sqlGet = "SELECT email FROM user WHERE email = ?";

    db.query(sqlGet, Email, (error, result) => {

        if (result.length === 0) {

            if (Password === PPassword) {

                bcrypt.hash(Password, 10, (err, hash) => {

                    if (err) {
                        console.log(err);
                        res.status(500).send({ error: "Greška pri šifrovanju lozinke." });
                        return;
                    }

                    db.query("INSERT INTO user (email, lozinka) VALUES (?, ?)",
                        [Email, hash], (err, result) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send({ error: "Greška pri upisu u bazu." });
                            } else {
                                res.send({ message: "Registracija uspešna." });
                            }
                        }
                    );
                });

            } else {
                res.send({ passwordErr: "Šifre se ne podudaraju." });
            }

        } else {
            res.send({ message: "E-mail adresa je već registrovana." });
        }
    });
});


router.post('/login', (req, res) => {

    const { Email, Password } = req.body;

    const sqlGet = "select * from user WHERE email = ?";

    db.query(sqlGet, [Email], (err, result) => {
        if (err) {
            res.send({ err: err });
            return;
        }

        if (result.length > 0) {
            bcrypt.compare(Password, result[0].lozinka, (err, response) => {
                if (response) {
                    // Ako je autentikacija uspešna, generišite token
                    const accessToken = sign(
                        { email: result[0].email, id: result[0].iduser },
                        "importantsecret"
                    );
                    res.send({ token: accessToken, email: Email, id: result[0].iduser });
                } else {
                    res.send({ message: "Pogrešna kombinacija email/lozinka!" });
                }
            });
        } else {
            res.send({ message: "Korisnik ne postoji." });
        }
    });
});

router.get('/auth', validateToken, (req, res) => {
    res.send(req.user);
})

module.exports = router;