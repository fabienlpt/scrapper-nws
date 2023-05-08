import mysql from "mysql2/promise";
import fs from "fs";

(async () => {
  const recipesJsonFilePath = "./json/recettes.json";
  
  const dbConnection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "restaurant",
  });

  try {
    // drop all tables if they exist
    await dbConnection.execute("DROP TABLE IF EXISTS ingredients_recettes");
    await dbConnection.execute("DROP TABLE IF EXISTS ingredients");
    await dbConnection.execute("DROP TABLE IF EXISTS recettes");

    // create recettes table to store recipes
    await dbConnection.execute(`CREATE TABLE IF NOT EXISTS recettes (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        titre VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        ingredients JSON,
        instructions JSON
      )`);

    // create ingredients table to store ingredients
    await dbConnection.execute(`CREATE TABLE IF NOT EXISTS ingredients (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL
      )`);

    // create ingredients_recettes table to store the relationship between recipes and ingredients
    await dbConnection.execute(`CREATE TABLE IF NOT EXISTS ingredients_recettes (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        recette_id INT(11) NOT NULL,
        ingredient_id INT(11) NOT NULL,
        FOREIGN KEY (recette_id) REFERENCES recettes(id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
      )`);

    const data = await fs.promises.readFile(recipesJsonFilePath, "utf8");
    const recipes = JSON.parse(data);

    for (const recipe of recipes) {
      // Vérifier si la recette existe déjà dans la base de données
      const [existingRecipe] = await dbConnection.execute(
        "SELECT id FROM recettes WHERE titre = ?",
        [recipe.titre]
      );

      let recetteId;
      if (!existingRecipe.length) {
        // Si la recette n'existe pas, on l'insère dans la base de données
        const [result] = await dbConnection.execute(
          "INSERT INTO recettes (titre, image, ingredients, instructions) VALUES (?, ?, ?, ?)",
          [recipe.titre, recipe.image, JSON.stringify(recipe.ingredients), JSON.stringify(recipe.instructions)]
        );
        recetteId = result.insertId;
      } else {
        // Si la recette existe déjà, on récupère son id
        recetteId = existingRecipe[0].id;
      }

      for (const ingredient of recipe.ingredients) {
        // Vérifier si l'ingrédient existe déjà dans la base de données
        const [existingIngredient] = await dbConnection.execute(
          "SELECT id FROM ingredients WHERE nom = ?",
          [ingredient.name]
        );

        let ingredientId;
        if (!existingIngredient.length) {
          // Si l'ingrédient n'existe pas, on l'insère dans la base de données
          const [ingredientResult] = await dbConnection.execute(
            "INSERT INTO ingredients (nom) VALUES (?)",
            [ingredient.name]
          );
          ingredientId = ingredientResult.insertId;
        } else {
          // Si l'ingrédient existe déjà, on récupère son id
          ingredientId = existingIngredient[0].id;
        }

        await dbConnection.execute(
          "INSERT INTO ingredients_recettes (recette_id, ingredient_id) VALUES (?, ?)",
          [recetteId, ingredientId]
        );
      }
    }
		console.log("Les données sont bien rentrées dans la base de données");

    await dbConnection.end();

  } finally {
    await dbConnection.end();
  }
})();
