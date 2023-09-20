import { comment, blockComment, shoppingList as shoppingListRegex, tokens } from './tokens';
import { Ingredient, Cookware, Step, Metadata, Item, ShoppingList } from './cooklang';

/**
 * @property defaultCookwareAmount The default value to pass if there is no cookware amount. By default the amount is 161
 * @property defaultIngredientAmount The default value to pass if there is no ingredient amount. By default the amount is "some"
 * @property includeStepNumber Whether or not to include the step number in ingredient and cookware nodes
 *
 */
export interface ParserOptions {
	defaultCookwareAmount?: string | number;
	defaultIngredientAmount?: string | number;
	includeStepNumber?: boolean;
}

export interface ParseResult {
	ingredients: Array<Ingredient>;
	cookwares: Array<Cookware>;
	metadata: Metadata;
	steps: Array<Step>;
	shoppingList: ShoppingList;
}

export default class Parser {
	defaultCookwareAmount: string | number;
	defaultIngredientAmount: string | number;
	includeStepNumber: boolean;
	defaultUnits = '';

	constructor(options?: ParserOptions) {
		this.defaultCookwareAmount = options?.defaultCookwareAmount ?? 1;
		this.defaultIngredientAmount = options?.defaultIngredientAmount ?? '';
		this.includeStepNumber = options?.includeStepNumber ?? false;
	}

	parse(source: string): ParseResult {
		const ingredients: Array<Ingredient> = [];
		const cookwares: Array<Cookware> = [];
		const metadata: Metadata = {};
		const steps: Array<Step> = [[]];
		const shoppingList: ShoppingList = {};
		// console.log(`source`, source)

		// Comments
		source = source.replace(comment, '').replace(blockComment, ' ');

        // console.log(`source`, source)

		const paragraphs = source.split(/\r?\n\n\n/).filter((l) => l.trim().length > 0);
		// console.log(`paragraphs`, paragraphs);

		for (let i = 0; i < paragraphs.length; i++) {
			const paragraph = paragraphs[i];

			let currentStep = i;
            steps[currentStep] = []

			let pos = 0;

			// console.log('paragraph', paragraph)
			// console.log(`paragraph.matchAll(tokens)`, [...paragraph.matchAll(tokens)])

			for (let match of paragraph.matchAll(tokens)) {
				const groups = match.groups;
				// console.log(`groups`, groups)
				if (!groups) continue;

				// linebreak
				if (groups.lineBreak) {
					steps[currentStep].push({
						type: 'text',
						value: '\n'
					});
				}

				// text
				if (pos < (match.index || 0)) {
					steps[currentStep].push({
						type: 'text',
						value: paragraph.substring(pos, match.index)
					});
				}

				// metadata
				if (groups.key && groups.value) {
					metadata[groups.key.trim()] = groups.value.trim();
				}

				// single word ingredient
				if (groups.sIngredientName) {
					const ingredient: Ingredient = {
						type: 'ingredient',
						name: groups.sIngredientName,
						quantity: this.defaultIngredientAmount,
						units: this.defaultUnits,
						group: groups.mIngredientGroup,
						// group: groups.mIngredientGroup ?? currentStep,
						step: currentStep,
					};

					if (this.includeStepNumber) ingredient.step = i;

					ingredients.push(ingredient);
					steps[currentStep].push(ingredient);
				}

				// multiword ingredient
				if (groups.mIngredientProse) {
					const measurements = groups.mIngredientMeasurements.split('|')
					const ingredient: Ingredient = {
						type: 'ingredient',
						name: groups.mIngredientName ?? groups.mIngredientProse,
						prose: groups.mIngredientProse,
						descriptor: groups.mIngredientDescriptor,
						quantity: parseQuantity(measurements[0].split('%')[0]) ?? this.defaultIngredientAmount,
						units: parseUnits(measurements[0].split('%')[1]) ?? this.defaultUnits,
						measurements,
						group: groups.mIngredientGroup,
						// group: groups.mIngredientGroup ?? currentStep,
						step: currentStep,
					};
					// console.log(`ingredient`, ingredient)

					if (this.includeStepNumber) ingredient.step = i;

					ingredients.push(ingredient);
					steps[currentStep].push(ingredient);
				}

				// single word cookware
				if (groups.sCookwareName) {
					const cookware: Cookware = {
						type: 'cookware',
						name: groups.sCookwareName,
						quantity: this.defaultCookwareAmount
					};

					if (this.includeStepNumber) cookware.step = i;

					cookwares.push(cookware);
					steps[currentStep].push(cookware);
				}

				// multiword cookware
				if (groups.mCookwareName) {
					const cookware: Cookware = {
						type: 'cookware',
						name: groups.mCookwareName,
						quantity: parseQuantity(groups.mCookwareQuantity) ?? this.defaultCookwareAmount
					};

					if (this.includeStepNumber) cookware.step = i;

					cookwares.push(cookware);
					steps[currentStep].push(cookware);
				}

				// timer
				if (groups.timerQuantity) {
					steps[currentStep].push({
						type: 'timer',
						name: groups.timerName,
						quantity: parseQuantity(groups.timerQuantity) ?? 0,
						units: parseUnits(groups.timerUnits) ?? this.defaultUnits
					});
				}
				// title
				if (groups.title) {
					steps[currentStep].push({
						type: 'title',
						value: groups.title,
					});
				}
				if (groups.highlightProse) {
					steps[currentStep].push({
						type: 'highlight',
						class: groups.highlightClass,
						value: groups.highlightProse,
					});
				}

				pos = (match.index || 0) + match[0].length;
			}

			// If the entire line hasn't been parsed yet
			if (pos < paragraph.length) {
				// Add the rest as a text item
				steps[currentStep].push({
					type: 'text',
					value: paragraph.substring(pos)
				});
			}
		}
        // console.log(`steps`, steps)

		return { ingredients, cookwares, metadata, steps, shoppingList };
	}
}

export function parseQuantity(quantity?: string): string | number | undefined {
	if (!quantity || quantity.trim() === '') {
		return undefined;
	}

	quantity = quantity.trim();

	const [left, right] = quantity.split('/');

	const [numLeft, numRight] = [Number(left), Number(right)];

	if (right && isNaN(numRight)) return quantity;

	if (!isNaN(numLeft) && !numRight) return numLeft;
	else if (!isNaN(numLeft) && !isNaN(numRight) && !(left.startsWith('0') || right.startsWith('0')))
		return numLeft / numRight;

	return quantity.trim();
}

export function parseUnits(units?: string): string | undefined {
	if (!units || units.trim() === '') {
		return undefined;
	}

	return units.trim();
}

function parseShoppingListCategory(items: string): Array<Item> {
	const list = [];

	for (let item of items.split('\n')) {
		item = item.trim();

		if (item == '') continue;

		const [name, synonym] = item.split('|');

		list.push({
			name: name.trim(),
			synonym: synonym?.trim() || ''
		});
	}

	return list;
}
