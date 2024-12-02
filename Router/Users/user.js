// User.js
const express = require("express");
const db = require("../../db/db");
const router = express.Router();

router.get('/userInformation/:id', (req, res) => {
    const id = req.params.id;
    const sqlGet = "SELECT * FROM user WHERE iduser = ?";
    db.query(sqlGet, id, (error, result) => {
        if (error) {
            console.log(error);
            return res.status(500).send({ error: "Greška pri dobijanju podataka." });
        }
        res.send(result);
    });
});

router.get('/allusers', (req, res) => {
    const sqlGet = "SELECT * FROM user";
    db.query(sqlGet, (error, result) => {
        if (error) {
            console.log(error);
            return res.status(500).send({ error: "Greška pri dobijanju korisnika." });
        }
        res.send(result);
    });
});

router.delete('/deleteuser/:id', (req, res) => {
    const { id } = req.params;
    const sqlDelete = "DELETE FROM user WHERE iduser = ?";
    db.query(sqlDelete, [id], (error, result) => {
        if (error) {
            console.log(error);
            return res.status(500).send({ error: "Greška pri brisanju korisnika." });
        }
        if (result.affectedRows > 0) {
            return res.send({ message: "Korisnik uspešno obrisan." });
        } else {
            return res.status(404).send({ message: "Korisnik nije pronađen." });
        }
    });
});

module.exports = router;
