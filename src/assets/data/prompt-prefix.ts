export const promptPrefix = `
Create a cooking recipe in the following JSON format, in the language specified. The recipe can be generated based on one or more of the following inputs: [recipeName], [criteria]. If sufficient information is not provided to create a recipe, return an empty JSON object {}.

{
  "name": "[same as the input name of the recipe, or generated based on the input criteria]",
  "type": "[choose from: starter, main, dessert, or drink]",
  "duration": "[in minutes, estimated based on the complexity and steps]",
  "partNumber": "[number of servings, estimated or based on the input criteria]",
  "ingredients": [
    {
      "name": "[ingredient name]",
      "quantity": "[quantity as a string, e.g., '20 g', estimated if not specified]",
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
  "name": "Vegetable Stir-fry",
  "type": "main",
  "duration": 30,
  "partNumber": 4,
  "ingredients": [
    { "name": "Carrots", "quantity": "200 g", "category": "Fruits & Vegetables" },
    { "name": "Broccoli", "quantity": "150 g", "category": "Fruits & Vegetables" },
    { "name": "Soy sauce", "quantity": "2 tbsp", "category": "Sauces" },
    { "name": "Garlic", "quantity": "2 cloves", "category": "Fruits & Vegetables" },
    { "name": "Vegetable oil", "quantity": "2 tbsp", "category": "Other" }
  ],
  "steps": [
    { "description": "Chop the vegetables into bite-sized pieces." },
    { "description": "Heat the oil in a wok and sauté the garlic." },
    { "description": "Add the vegetables and stir-fry for 5-7 minutes." },
    { "description": "Add soy sauce and cook for another 2 minutes." },
    { "description": "Serve hot." }
  ]
}

If the requested recipe cannot be generated based on the inputs, return: {}
Use this format to create a recipe for the inputs: [recipeName], [criteria].
Return the recipe in language: [language].
`;
