import { Ingredient } from './ingredient';

export interface IngredientList {
    ingredientList: Array<Ingredient>;
    isCloudSynced?: boolean;
}
