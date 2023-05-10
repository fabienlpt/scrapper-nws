import mysql from "mysql2/promise";
import express from "express";

const app = express();

// create a connection to the database
const dbConnection = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "restaurant",
});

// get all recipes
app.get("/recettes", async (req, res) => {
  const [recipes] = await dbConnection.execute("SELECT * FROM recettes");

  res.json(recipes);
});

// get recipe by id
app.get("/recettes/:id", async (req, res) => {
  const [recipe] = await dbConnection.execute(
    "SELECT * FROM recettes WHERE id = ?",
    [req.params.id]
  );

  res.json(recipe[0]);
});

// get recipe by name
app.get("/recettes/nom/:nom", async (req, res) => {
  const [recipe] = await dbConnection.execute(
    "SELECT * FROM recettes WHERE titre = ?",
    [req.params.nom]
  );

  res.json(recipe[0]);
});

// get recipe by ingredients
app.get("/recettes/ingredients/:ingredients", async (req, res) => {
  const [recipe] = await dbConnection.execute(
    `SELECT recettes.* FROM recettes
    JOIN ingredients_recettes ON recettes.id = ingredients_recettes.recette_id
    JOIN ingredients ON ingredients_recettes.ingredient_id = ingredients.id
    WHERE ingredients.nom = ?`,
    [req.params.ingredients]
  );
  
  res.json(recipe);
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});