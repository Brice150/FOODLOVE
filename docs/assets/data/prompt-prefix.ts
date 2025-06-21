export const promptPrefix = `
Create a cooking recipe in the following JSON format, in the language specified. If the requested recipe name [recipeName] does not exist, return an empty JSON object {}.

{
  "name": "[same as the input name of the recipe]",
  "type": "[choose from: starter, main, dessert, or drink]",
  "duration": "[in minutes]",
  "partNumber": "[number of servings]",
  "ingredients": [
    {
      "name": "[ingredient name]",
      "quantity": "[quantity as a string, e.g., '20 g']",
      "category": "[choose from: Other, Meats, Starches, Drinks, Fruits & Vegetables, Dairy Products, Daily Products, Seasonings, Seafood, Pastry, Frozen, Canned, Sauces, Snacks]"
    }
  ],
  "steps": [
    {
      "description": "[a string describing the preparation step]"
    }
  ]
}

Example (in English):

{
  "name": "Spaghetti Bolognese",
  "type": "main",
  "duration": 45,
  "partNumber": 4,
  "ingredients": [
    { "name": "Spaghetti", "quantity": "400 g", "category": "Starches" },
    { "name": "Ground beef", "quantity": "300 g", "category": "Meats" },
    { "name": "Tomato sauce", "quantity": "500 ml", "category": "Sauces" },
    { "name": "Onions", "quantity": "2", "category": "Fruits & Vegetables" },
    { "name": "Olive oil", "quantity": "2 tbsp", "category": "Other" },
    { "name": "Salt", "quantity": "1 pinch", "category": "Seasonings" }
  ],
  "steps": [
    { "description": "Sauté the onions in olive oil." },
    { "description": "Add the ground beef and cook until browned." },
    { "description": "Stir in the tomato sauce and simmer for 20 minutes." },
    { "description": "Cook the spaghetti according to the package instructions." },
    { "description": "Serve the spaghetti topped with the Bolognese sauce." }
  ]
}

If the requested recipe name [recipeName] does not exist, return: {}
Use this format to create a recipe for the name: [recipeName]  
Return the recipe in language: [language]
`;
