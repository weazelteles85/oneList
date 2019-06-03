import { Ingredient } from './ingredient';

export interface IngredientList {
    updatedBy: string;
    ingredientList: Array<Ingredient>;
    isCloudSynced?: boolean;
}
