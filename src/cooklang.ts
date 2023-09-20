/**
 * An ingredient
 *
 * @see {@link https://cooklang.org/docs/spec/#ingredients|Cooklang Ingredient}
 */
export interface Ingredient {
    type: 'ingredient';
    name: string;
    prose?: string;
    descriptor?: string;
    quantity: string | number;
    units: string;
    step?: number;
    measurements?: Array<string>
    group?: string;
}

/**
 * A piece of cookware
 *
 * @see {@link https://cooklang.org/docs/spec/#cookware|Cooklang Cookware}
 */
export interface Cookware {
    type: 'cookware';
    name: string;
    quantity: string | number;
    step?: number;
}

/**
 * A timer
 *
 * @see {@link https://cooklang.org/docs/spec/#timer|Cooklang Timer}
 */
export interface Timer {
    type: 'timer';
    name?: string;
    quantity: string | number;
    units: string;
}

/**
 * A piece of text
 */
export interface Text {
    type: 'text';
    value: string;
}

/**
 * A title of a step
 */
export interface Title {
    type: 'title';
    value: string;
}

/**
 * A piece of text to be highlighted in some way
 */
export interface Highlight {
    type: 'highlight';
    class: string;
    value: string;
    concise?: string;
}

/**
 * A step consisting of multiple ingredients, cookware, timers, and text
 */
export type Step = Array<Ingredient | Cookware | Timer | Text | Title | Highlight>;

/**
 * A recipes metadata
 *
 * @see {@link https://cooklang.org/docs/spec/#metadata|Cooklang Metadata}
 */
export type Metadata = Record<string, string>;

/**
 * A shopping list item
 *
 * @see {@link https://cooklang.org/docs/spec/#the-shopping-list-specification|Cooklang Shopping List}
 */
export interface Item {
    name: string;
    synonym?: string;
}

/**
 * A shopping list consisting of categories and their items
 *
 * @see {@link https://cooklang.org/docs/spec/#the-shopping-list-specification|Cooklang Shopping List}
 */
export type ShoppingList = Record<string, Array<Item>>;
