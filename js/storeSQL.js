import mysql from 'mysql2/promise';
import fs from 'fs';

(async () => {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "restaurant",
    });

    await connection.execute(`CREATE TABLE IF NOT EXISTS recettes (
      id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      titre VARCHAR(255) NOT NULL,
      image VARCHAR(255),
      instructions JSON
    )`);
  
    await connection.execute(`CREATE TABLE IF NOT EXISTS ingredients (
      id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(255) NOT NULL
    )`);
  
    await connection.execute(`CREATE TABLE IF NOT EXISTS ingredients_recettes (
      id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      recette_id INT(11) NOT NULL,
      ingredient_id INT(11) NOT NULL,
      FOREIGN KEY (recette_id) REFERENCES recettes(id),
      FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
    )`);
  
    const jsonFilePathRecipes = "./json/recettes.json";
  
    try {
      const data = await fs.promises.readFile(jsonFilePathRecipes, "utf8");
      const recipes = JSON.parse(data);
      for (const recipe of recipes) {
        const [existingRecipe] = await connection.execute(
          "SELECT id FROM recettes WHERE titre = ?",
          [recipe.titre]
        );
        let recetteId;
        if (existingRecipe.length === 0) {
          const [result] = await connection.execute(
            "INSERT INTO recettes (titre, image, instructions) VALUES (?, ?, ?)",
            [recipe.titre, recipe.image, JSON.stringify(recipe.instructions)]
          );
          recetteId = result.insertId;
        } else {
          recetteId = existingRecipe[0].id;
        }
        for (const ingredient of recipe.ingredients) {
          const [existingIngredient] = await connection.execute(
            "SELECT id FROM ingredients WHERE nom = ?",
            [ingredient.name]
          );
          let ingredientId;
          if (existingIngredient.length === 0) {
            const [ingredientResult] = await connection.execute(
              "INSERT INTO ingredients (nom) VALUES (?)",
              [ingredient.name]
            );
            ingredientId = ingredientResult.insertId;
          } else {
            ingredientId = existingIngredient[0].id;
          }
  
          await connection.execute(
            "INSERT INTO ingredients_recettes (recette_id, ingredient_id) VALUES (?, ?)",
            [recetteId, ingredientId]
          );
        }
      }
      console.log(
        `Les recettes et les ingrédients ont été insérés avec succès dans la base de données!`
      );
    } catch (err) {
      console.error(err);
    }
  
    await connection.end();
  })();
