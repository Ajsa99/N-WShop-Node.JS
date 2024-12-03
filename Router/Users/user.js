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

// DELETE ruta za brisanje korisnika
app.delete('/deleteuser/:id', (req, res) => {
    const id = req.params.id;

    // Provera validnosti ID-a
    if (!id || isNaN(id)) {
        return res.status(400).send({ error: "Neispravan ID korisnika." });
    }

    // SQL upit za proveru postojanja korisnika
    const sqlCheck = "SELECT * FROM user WHERE iduser = ?";
    db.query(sqlCheck, [id], (error, result) => {
        if (error) {
            console.error("Greška pri proveri korisnika:", error.message);
            return res.status(500).send({ error: "Greška na serveru." });
        }

        if (result.length === 0) {
            return res.status(404).send({ error: "Korisnik nije pronađen." });
        }

        // SQL upit za brisanje korisnika
        const sqlDelete = "DELETE FROM user WHERE iduser = ?";
        db.query(sqlDelete, [id], (deleteError, deleteResult) => {
            if (deleteError) {
                console.error("Greška pri brisanju korisnika:", deleteError.message);
                return res.status(500).send({ error: "Greška na serveru prilikom brisanja korisnika." });
            }

            // Provera koliko je redova obrisano
            if (deleteResult.affectedRows === 0) {
                return res.status(404).send({ error: "Korisnik nije pronađen za brisanje." });
            }

            res.send({ message: "Korisnik je uspešno obrisan." });
        });
    });
});

module.exports = router;
