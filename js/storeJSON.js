import puppeteer from 'puppeteer';
import fs from 'fs';

async function getElemsFromRecipe(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const title = await page.$eval("h1", (el) => el.textContent.trim());
    const image = await page.$eval(
      ".img-placeholder img",
      (img) => img.src
    );
    const instructions = await page.$$eval(".mntl-sc-block-group--LI", (steps) =>
      steps.map((step) => {
        const instruction = step.querySelector("p").textContent;
        return instruction;
      })
        
    );

    const ingredientsElems = await page.$$('.mntl-structured-ingredients__list-item');
    const ingredients = [];
    for (const elem of ingredientsElems) {
        // ingredient name get span where variable data-ingredient-name="true"
        const ingredientNameElem = await elem.$('span[data-ingredient-name="true"]');
        const ingredientNameProp = await ingredientNameElem.getProperty('textContent');
        const ingredientName = await ingredientNameProp.jsonValue();
        // ingredient quantity get span where variable data-ingredient-quantity="true"
        const ingredientQuantityElem = await elem.$('span[data-ingredient-quantity="true"]');
        const ingredientQuantityProp = await ingredientQuantityElem.getProperty('textContent');
        const ingredientQuantity = await ingredientQuantityProp.jsonValue();
        // ingredient unit get span where variable data-ingredient-unit="true"
        const ingredientUnitElem = await elem.$('span[data-ingredient-unit="true"]');
        const ingredientUnitProp = await ingredientUnitElem.getProperty('textContent');
        const ingredientUnit = await ingredientUnitProp.jsonValue();

        const ingredient = {
            name: ingredientName,
            quantity: ingredientQuantity,
            unit: ingredientUnit,
        };
        ingredients.push(ingredient);
    }
    
    await browser.close();
    const data = {
        titre : title,
        image: image,
        ingredients: ingredients,
        instructions: instructions,
    };
    return data;
}

async function insertJson (recipes, ingredients) {
  fs.writeFile("./json/recettes.json", JSON.stringify(recipes), (err) => {
    if (err) throw err;
    console.log("Le fichier JSON a été créé avec succès!");
  });
  fs.writeFile("./json/ingredients.json", JSON.stringify(ingredients), (err) => {
    if (err) throw err;
    console.log("Le fichier JSON a été créé avec succès!");
  });
}

async function scrapeRecipes(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  
  const hrefs = await page.$$eval(".mntl-card-list-items", (links) =>
    links.map((link) => link.href)
  );
  const recipes = [];
  const ingredients = [];
  for (const href of hrefs) {
    if( href.startsWith('https://www.allrecipes.com/recipe/')) {
      const recipeData = await getElemsFromRecipe(href);
      const recipe = {
          titre:  recipeData.titre,
          image: recipeData.image,
          ingredients: recipeData.ingredients,
          instructions: recipeData.instructions,
      };

      for (const ingredient of recipeData.ingredients) {
        if (!ingredients.includes(ingredient.name))
          ingredients.push({ name: ingredient.name });
      }

      recipes.push(recipe);
      console.log(recipe);
    }
  }
  insertJson(recipes, ingredients);
  await browser.close();
}

scrapeRecipes('https://www.allrecipes.com/recipes/');