const express = require("express");
const multer = require("multer");
const FormData = require("form-data");
const axios = require("axios");
const db = require("../../db/db");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/AddProduct', upload.array('slike', 10), async (req, res) => {
    try {
      const { naziv, cena } = req.body;
      const karakteristike = JSON.parse(req.body.karakteristike || '[]');
  
      // Validacija ulaznih podataka
      if (!naziv || isNaN(cena) || cena <= 0 || !req.files || req.files.length === 0) {
        return res.status(400).send({ error: "Molimo unesite sve potrebne podatke i validne slike!" });
      }
  
      // Upload slika na imgbb
      const promises = req.files.map(file => {
        const formData = new FormData();
        formData.append('image', file.buffer.toString('base64')); // Pretvaranje u base64
        return axios.post('https://api.imgbb.com/1/upload?key=2eb6cdef8717cde21ad05d076cfc4150', formData);
      });
  
      const responses = await Promise.all(promises);
      const slikeUrls = responses.map(response => response.data.data.url);
  
      // Ubacivanje proizvoda u bazu
      const connection = db.promise();
      const [productResult] = await connection.query("INSERT INTO Proizvod (naziv, cena) VALUES (?, ?)", [naziv, cena]);
      const idProizvod = productResult.insertId;
  
      // Ubacivanje slika u bazu
      const slikeValues = slikeUrls.map(url => [url, idProizvod]);
      await connection.query("INSERT INTO Slike (naziv, idProizvod) VALUES ?", [slikeValues]);
  
      // Ubacivanje karakteristika u bazu
      if (karakteristike.length > 0) {
        const karakteristikeValues = karakteristike.map(k => [k.naziv, k.opis, idProizvod]);
        await connection.query("INSERT INTO Karakteristike (naziv, opis, idProizvod) VALUES ?", [karakteristikeValues]);
      }
  
      res.send({ message: "Proizvod je uspešno dodat." });
    } catch (error) {
      console.error("Došlo je do greške:", error.message);
      res.status(500).send({ error: "Došlo je do greške prilikom dodavanja proizvoda." });
    }
  });
  

// Pregled svih proizvoda
router.get('/products', (req, res) => {
    
  const sqlGetProducts = `
  SELECT 
      p.idProizvod, 
      p.naziv, 
      p.cena, 
      p.istaknut,
      GROUP_CONCAT(DISTINCT s.naziv SEPARATOR ', ') AS slikeNaziv, 
      GROUP_CONCAT(DISTINCT k.naziv SEPARATOR ', ') AS karakteristikaNaziv, 
      GROUP_CONCAT(DISTINCT k.opis SEPARATOR ', ') AS karakteristikaOpis
  FROM 
      Proizvod AS p
  LEFT JOIN 
      Slike AS s ON p.idProizvod = s.idProizvod
  LEFT JOIN 
      Karakteristike AS k ON p.idProizvod = k.idProizvod
  GROUP BY 
      p.idProizvod
  ORDER BY 
      p.naziv; 
`;



    db.query(sqlGetProducts, (error, result) => {
      if (error) {
          console.error("SQL Query Error:", error.code, error.sqlMessage, error.sql); // Detaljni log
          return res.status(500).send({ error: "Error fetching products." });
      }
      console.log("SQL Result:", result);
      res.send(result);
  });
  
  
});

router.put('/UpdateProduct/:idProizvod', async (req, res) => {
    const { idProizvod } = req.params;
    const { naziv, cena, karakteristike } = req.body;
  
    // Validating the input data
    if (!naziv || isNaN(cena) || cena <= 0) {
      return res.status(400).send({ error: "Molimo unesite validne podatke o proizvodu." });
    }
  
    try {
      const connection = db.promise();
  
      // Update product name and price
      await connection.query(
        "UPDATE Proizvod SET naziv = ?, cena = ? WHERE idProizvod = ?",
        [naziv, cena, idProizvod]
      );
  
      // Remove existing characteristics and re-insert the updated ones
      await connection.query("DELETE FROM Karakteristike WHERE idProizvod = ?", [idProizvod]);
  
      // Insert new characteristics
      if (karakteristike.length > 0) {
        const karakteristikeValues = karakteristike.map(k => [k.naziv, k.opis, idProizvod]);
        await connection.query("INSERT INTO Karakteristike (naziv, opis, idProizvod) VALUES ?", [karakteristikeValues]);
      }
  
      res.send({ message: "Proizvod uspešno izmenjen." });
    } catch (error) {
      console.error("Error updating product:", error.message);
      res.status(500).send({ error: "Došlo je do greške prilikom izmene proizvoda." });
    }
  });
  

// Brisanje proizvoda i povezanih podataka iz Slike i Karakteristike tabela
router.delete('/DeleteProduct/:idProizvod', (req, res) => {
    const { idProizvod } = req.params;

    // Brisanje iz tabela Slike i Karakteristike
    const sqlDeleteSlike = "DELETE FROM Slike WHERE idProizvod = ?";
    const sqlDeleteKarakteristike = "DELETE FROM Karakteristike WHERE idProizvod = ?";

    db.query(sqlDeleteSlike, [idProizvod], (error) => {
        if (error) {
            return res.status(500).send({ error: "Error deleting images." });
        }

        db.query(sqlDeleteKarakteristike, [idProizvod], (error) => {
            if (error) {
                return res.status(500).send({ error: "Error deleting characteristics." });
            }

            // Brisanje iz tabele Proizvod
            const sqlDeleteProduct = "DELETE FROM Proizvod WHERE idProizvod = ?";
            db.query(sqlDeleteProduct, [idProizvod], (error) => {
                if (error) {
                    return res.status(500).send({ error: "Error deleting product." });
                }

                res.send({ message: "Product and all associated data deleted successfully." });
            });
        });
    });
});

router.get('/product/:idProizvod', (req, res) => {
    const { idProizvod } = req.params;

    const sqlGetProductById = `
        SELECT 
            p.idProizvod, 
            p.naziv, 
            p.cena,
            GROUP_CONCAT(DISTINCT s.naziv SEPARATOR ', ') AS slikeNaziv, 
            GROUP_CONCAT(DISTINCT k.naziv SEPARATOR ', ') AS karakteristikaNaziv, 
            GROUP_CONCAT(DISTINCT k.opis SEPARATOR ', ') AS karakteristikaOpis
        FROM sql7785299.Proizvod p
        LEFT JOIN sql7785299.Slike s ON p.idProizvod = s.idProizvod
        LEFT JOIN sql7785299.Karakteristike k ON p.idProizvod = k.idProizvod
        WHERE p.idProizvod = ?
        GROUP BY p.idProizvod
    `;

    db.query(sqlGetProductById, [idProizvod], (error, result) => {
        if (error) {
            return res.status(500).send({ error: "Error fetching product details." });
        }
        if (result.length === 0) {
            return res.status(404).send({ error: "Product not found." });
        }
        res.send(result[0]);
    });
});

router.get('/products/featured', (req, res) => {
  const query = `
    SELECT 
      p.idProizvod,
      p.naziv,
      p.cena,
      p.istaknut,
      s.naziv AS slika
    FROM Proizvod p
    LEFT JOIN Slike s ON p.idProizvod = s.idProizvod
    WHERE p.istaknut = 1
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send({ error: 'Error fetching featured products' });
    } else {
      // Grupisanje rezultata po proizvodima kako bi slike bile lista
      const groupedResults = results.reduce((acc, curr) => {
        const existingProduct = acc.find(p => p.idProizvod === curr.idProizvod);
        if (existingProduct) {
          existingProduct.slike.push(curr.slika);
        } else {
          acc.push({
            idProizvod: curr.idProizvod,
            naziv: curr.naziv,
            cena: curr.cena,
            istaknut: curr.istaknut,
            slike: curr.slika ? [curr.slika] : []
          });
        }
        return acc;
      }, []);

      res.json(groupedResults);
    }
  });
});



router.put('/update-featured', (req, res) => {
  const updatedProducts = req.body; // This will receive the updated product list

  // Create a promise for each product's update
  const updateQueries = updatedProducts.map((product) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE Proizvod SET istaknut = ${product.istaknut ? 1 : 0} WHERE idProizvod = ${product.idProizvod}`;
      db.query(sql, (error, result) => {
        if (error) {
          reject(error); // Reject the promise if there's an error
        } else {
          resolve(result); // Resolve the promise if the update is successful
        }
      });
    });
  });

  // Use Promise.all to execute all the update queries concurrently
  Promise.all(updateQueries)
    .then(() => {
      res.send({ message: 'Products successfully updated' });
    })
    .catch((error) => {
      console.error('Error updating featured products:', error);
      res.status(500).send({ error: 'Error updating products' });
    });
});

// Ruta za dobijanje informacija
router.get('/info', (req, res) => {
  const sqlGetAllInfo = `
      SELECT opis, instagram
      FROM Informacije
      WHERE idinformacije = 1
  `;

  db.query(sqlGetAllInfo, (error, results) => {
      if (error) {
          return res.status(500).send({ error: "Greška prilikom dohvatanja informacija." });
      }
      res.send(results[0]); // Vraćamo prvi red kao objekat
  });
});

// Ruta za ažuriranje informacija
router.put('/updateinfo', (req, res) => {
  const { opis, instagram } = req.body;

  if (!opis || !instagram) {
      return res.status(400).send({ error: "Opis i Instagram link ne mogu biti prazni." });
  }

  const sqlUpdateOpis = `
      UPDATE Informacije
      SET opis = ?, instagram = ?
      WHERE idinformacije = 1
  `;

  db.query(sqlUpdateOpis, [opis, instagram], (error, result) => {
      if (error) {
          console.error("Greška prilikom ažuriranja informacija:", error);
          return res.status(500).send({ error: "Greška prilikom ažuriranja informacija." });
      }
      res.send({ message: "Informacije uspešno ažurirane." });
  });
});

module.exports = router;
