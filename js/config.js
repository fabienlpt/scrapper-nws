export const recette_config = `CREATE TABLE IF NOT EXISTS recettes (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    ingredients JSON,
    instructions JSON
)`;

export const ingredients_config = `CREATE TABLE IF NOT EXISTS ingredients (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
)`;

export const ingredients_recettes_config = `CREATE TABLE IF NOT EXISTS ingredients_recettes (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    recette_id INT(11) NOT NULL,
    ingredient_id INT(11) NOT NULL,
    FOREIGN KEY (recette_id) REFERENCES recettes(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
)`;

export const sqlConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "restaurant",
};

export const mongoUrl = "mongodb+srv://fabienlpt:ZelUXj195anP8zYh@restaurant.g3uerf0.mongodb.net/?retryWrites=true&w=majority";

export const recipesJsonFilePath = "./json/recettes.json";