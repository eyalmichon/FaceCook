import pandas as pd
import re
import csv
import warnings
from cdifflib import CSequenceMatcher
import difflib
difflib.SequenceMatcher = CSequenceMatcher


def similar(a, b):
    return CSequenceMatcher(None, a, b).ratio()


warnings.simplefilter(action='ignore', category=FutureWarning)

# nutrition = pd.read_csv(r'C:\Users\Maoz\PycharmProjects\FoodDatabase\nutrition.csv')

df = pd.read_json(r'C:\Users\Maoz\PycharmProjects\food_database\data\recipes_with_nutritional_info.json')
# df.to_csv(r'C:\Users\Maoz\PycharmProjects\food_database\New File Name.csv')

df = df[df['url'].str.contains("food.com") == True]

df['url'] = df['url'].astype('str')
df['url'] = df['url'].str.replace('([^\s\d])', '', regex=True)
df['url'] = df['url'].astype('str')
# pre processing

df['unit'] = df['unit'].astype('str')
df['unit'] = df['unit'].str.replace("'", "")
df['unit'] = df['unit'].str.replace('"', "")
df['unit'] = df['unit'].str.replace("text: ", "")
df['unit'] = df['unit'].str.strip('[]')
df['unit'] = df['unit'].str.replace("{", "")
df['unit'] = df['unit'].str.replace("}", "")
df['unit'] = df['unit'].str.replace(" ", "")

df['ingredients'] = df['ingredients'].astype('str')
df['ingredients'] = df['ingredients'].str.replace("'", "")
df['ingredients'] = df['ingredients'].str.replace('"', "")
df['ingredients'] = df['ingredients'].str.replace(', ', " ")
df['ingredients'] = df['ingredients'].str.replace("text: ", "")
df['ingredients'] = df['ingredients'].str.strip('[]')
df['ingredients'] = df['ingredients'].str.replace("} {", ",")
df['ingredients'] = df['ingredients'].str.replace("}", "")
df['ingredients'] = df['ingredients'].str.replace("{", "")

# dupes
# test = df.title.isin(df.title.drop_duplicates(keep=False))
# df = df[test]

# df['unit'] = df['unit'].str.split(',')
#
# df = df.explode('unit')
# https://www.kaggle.com/datasets/trolukovich/nutritional-values-for-common-foods-and-products
df2 = pd.read_csv(r'C:\Users\Maoz\PycharmProjects\food_database\data\recipes.csv')
df['url'] = df['url'].astype('int64')
# dupes
# test = df2.Name.isin(df2.Name.drop_duplicates(keep=False))
# df2 = df2[test]

merged_inner = pd.merge(left=df, right=df2, left_on='url', right_on='RecipeId')

# remove dupes
test3 = merged_inner.RecipeId.isin(merged_inner.RecipeId.drop_duplicates(keep=False))
merged_inner = merged_inner[test3]

# lower letter
# merged_inner = merged_inner.applymap(lambda s: s.lower() if type(s) == str else s)


merged_inner['RecipeIngredientQuantities'] = merged_inner['RecipeIngredientQuantities'].astype('str')
merged_inner['RecipeIngredientQuantities'] = merged_inner['RecipeIngredientQuantities'].str.replace("c", "")
merged_inner['RecipeIngredientQuantities'] = merged_inner['RecipeIngredientQuantities'].str.replace('"', "")
merged_inner['RecipeIngredientQuantities'] = merged_inner['RecipeIngredientQuantities'].str.strip('()')

df3 = pd.read_csv(r'C:\Users\Maoz\PycharmProjects\food_database\data\reviews.csv')
#


# fix
merged_inner["unit"] = merged_inner["unit"].str.split(",")
merged_inner["RecipeIngredientQuantities"] = merged_inner["RecipeIngredientQuantities"].str.split(", ")
merged_inner["ingredients"] = merged_inner["ingredients"].str.split(",")

merged_inner = merged_inner.loc[merged_inner['unit'].str.len() == merged_inner['RecipeIngredientQuantities'].str.len()]
merged_inner = merged_inner.loc[
    merged_inner['ingredients'].str.len() == merged_inner['RecipeIngredientQuantities'].str.len()]
merged_inner = merged_inner.loc[merged_inner['unit'].str.len() == merged_inner['ingredients'].str.len()]

# merged_inner['RecipeInstructions'] = merged_inner['RecipeInstructions'].astype('str')
# merged_inner['RecipeInstructions'] = merged_inner['RecipeInstructions'].str.replace("'", "")
# merged_inner['RecipeInstructions'] = merged_inner['RecipeInstructions'].str.replace('"', '')
# merged_inner['RecipeInstructions'] = merged_inner['RecipeInstructions'].str.strip("c")
# merged_inner['RecipeInstructions'] = merged_inner['RecipeInstructions'].str.replace('(', '')
# merged_inner['RecipeInstructions'] = merged_inner['RecipeInstructions'].str.replace(')', '')
# merged_inner["RecipeInstructions"] = merged_inner["RecipeInstructions"].str.split(", ")
#
# merged_inner['Images'] = merged_inner['Images'].astype('str')
# merged_inner['Images'] = merged_inner['Images'].str.replace("'", "")
# merged_inner['Images'] = merged_inner['Images'].str.replace('"', '')
# merged_inner['Images'] = merged_inner['Images'].str.replace('(', '')
# merged_inner['Images'] = merged_inner['Images'].str.replace(')', '')
# merged_inner['Images'] = merged_inner['Images'].str.replace('character', '')
# merged_inner['Images'] = merged_inner['Images'].str.replace('0', '')

# info = merged_inner[['RecipeId','Description','Images','RecipeYield']]
# info.columns = ['recipe_id','description','image_url','recipe_yield']
# info.to_csv(r'C:\Users\Maoz\PycharmProjects\FoodDatabase\recipe_info.csv',index=False)
# #
# #
# instructions = merged_inner[['RecipeId', 'RecipeInstructions']]
# instructions = instructions.explode(["RecipeInstructions"])
# instructions['index'] = range(1, len(instructions) + 1)
# instructions.columns = ['recipe_id', 'instruction', 'instruction_id']
# instructions.to_csv(r'C:\Users\Maoz\PycharmProjects\FoodDatabase\instructions.csv', index=False)

# test = merged_inner[['RecipeId','title','AuthorId','DatePublished','CookTime','Calories','FatContent','ProteinContent','SodiumContent','SaturatedFatContent','SugarContent','CarbohydrateContent','RecipeCategory']]
# test.columns = ['recipe_id', 'name', 'contributor_id', 'date_submitted', 'minutes', 'kcal', 'fat', 'protein', 'sodium', 'saturate_fat', 'sugar', 'carbohydrates', 'category']
# test.to_csv(r'C:\Users\Maoz\PycharmProjects\FoodDatabase\Recipes.csv')


# Explode the entire data frame

test = merged_inner[['RecipeId', 'ingredients', 'RecipeIngredientQuantities', 'unit', 'nutr_per_ingredient']]
test = test.explode(["unit", "RecipeIngredientQuantities", "ingredients", "nutr_per_ingredient"])
test.columns = ['recipe_id', 'food_name', 'quantity', 'unit', "nutr_per_ingredient"]


# test.to_csv(r'C:\Users\Maoz\PycharmProjects\FoodDatabase\RecipesToIngredients.csv',index=False)
def complex_function(x, y=0):
    if " - " in x:
        output = x.split(" - ")
        return (complex_function(output[0]) + complex_function(output[1])) / 2
    elif " -" in x:
        output = x.split(" -")
        return (complex_function(output[0]) + complex_function(output[1])) / 2
    elif " " in x:
        output = x.split(" ")
        fractions = output[1].split("/")
        return float(output[0]) + float(fractions[0]) / float(fractions[1])
    elif "/" in x:
        output = x.split("/")
        return float(output[0]) / float(output[1])
    elif x.isnumeric():
        return float(x)
    else:
        return 0


nutrition = pd.read_csv(r'C:\Users\Maoz\PycharmProjects\FoodDatabase\nutrition.csv')


def complex_function2(x, y=0):
    score = 0
    food = ""
    for food2 in nutrition['name']:
        new = similar(x, food2)
        if score < new:
            score = new
            food = food2
    return food


food = test['food_name'].drop_duplicates().to_frame()
food['name'] = food['food_name'].apply(complex_function2)


# test['quantity'] = test['quantity'].apply(complex_function)
# RecipesToIngredients = test[['recipe_id', 'food_name', 'quantity', 'unit']]
# RecipesToIngredients.to_csv(r'C:\Users\Maoz\PycharmProjects\FoodDatabase\RecipesToIngredients.csv', index=False)
#
# ingredients = test[['food_name', 'quantity', 'unit', 'nutr_per_ingredient']]
# ingredients = ingredients.drop_duplicates(['food_name', 'quantity', 'unit'])
# ingredients.to_csv(r'C:\Users\Maoz\PycharmProjects\FoodDatabase\ingredients.csv', index=False)

# ingredients['quantity'] = ingredients['quantity'].apply(complex_function)


df4 = pd.read_csv(r'C:\Users\Maoz\PycharmProjects\FoodDatabase\Recipes.csv')
merged_inner2 = pd.merge(left=df3, right=df4, left_on='RecipeId', right_on='recipe_id')
test2 = merged_inner2[['AuthorId', 'RecipeId', 'DateSubmitted', 'DateModified', 'Rating', 'Review']]
test2.columns = ['user_id', 'recipe_id', 'date_submitted', 'date_modified', 'rating', 'review']
test2['date_submitted'] = test2['date_submitted'].str.replace("T", " ")
test2['date_submitted'] = test2['date_submitted'].str.replace("Z", "")
test2['date_modified'] = test2['date_modified'].str.replace("T", " ")
test2['date_modified'] = test2['date_modified'].str.replace("Z", "")

# test2.to_csv(r'C:\Users\Maoz\PycharmProjects\FoodDatabase\Reviews.csv', index=False)


print("hello")
# pd.concat([test,test2]).drop_duplicates().sort_values(by='AuthorId').to_csv(r'C:\Users\Maoz\PycharmProjects\FoodDatabase\Users.csv')
