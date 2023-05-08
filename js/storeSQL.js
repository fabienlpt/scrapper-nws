import mysql from "mysql2/promise";
import fs from "fs";
import {
  recette_config,
  ingredients_config,
  ingredients_recettes_config,
  sqlConfig,
  recipesJsonFilePath
} from "./config.js";

(async () => {  
  const dbConnection = await mysql.createConnection(sqlConfig);

  try {
    // drop all tables if they exist
    await dbConnection.execute("DROP TABLE IF EXISTS ingredients_recettes");
    await dbConnection.execute("DROP TABLE IF EXISTS ingredients");
    await dbConnection.execute("DROP TABLE IF EXISTS recettes");

    await dbConnection.execute(recette_config);
    await dbConnection.execute(ingredients_config);
    await dbConnection.execute(ingredients_recettes_config);

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
