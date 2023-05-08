import { MongoClient, ServerApiVersion } from "mongodb";
import fs from "fs";
import {
  mongoUrl,
  recipesJsonFilePath,
} from "./config.js";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongoUrl, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const database = client.db("restaurant");
    database.collection('recettes').drop()
    await database.createCollection("recettes")
    database.collection('ingredients').drop()
    await database.createCollection('ingredients');
    database.collection('ingredients_recettes').drop()
    await database.createCollection('ingredients_recettes');

    const data = await fs.promises.readFile(recipesJsonFilePath, "utf8");
    const recettes = JSON.parse(data);

    for (const recette of recettes) {
      const existingRecipe = await database.collection('recettes').findOne({ titre: recette.titre });
      let recetteId;
      if (!existingRecipe) {
        // Si la recette n'existe pas, on l'insère
        const result = await database.collection('recettes').insertOne({ titre: recette.titre, image: recette.image, ingredients: recette.ingredients, instructions: recette.instructions });
        recetteId = result.insertedId;
      } else {
        // Sinon, on récupère l'ID de la recette existante
        recetteId = existingRecipe._id;
      }

      for (const ingredient of recette.ingredients) {
        const existingIngredient = await database.collection('ingredients').findOne({ nom: ingredient.name });
        let ingredientId;
        if (!existingIngredient) { 
          // Si l'ingrédient n'existe pas, on l'insère
          const ingredientResult = await database.collection('ingredients').insertOne({ nom: ingredient.name });
          ingredientId = ingredientResult.insertedId;
        } else {
          // Sinon, on récupère l'ID de l'ingrédient existant
          ingredientId = existingIngredient._id;
        }

        await database.collection('ingredients_recettes').insertOne({ recette_id: recetteId, ingredient_id: ingredientId });
      }
    }
    console.log(`Les données sont bien rentrées dans la base de données`);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
