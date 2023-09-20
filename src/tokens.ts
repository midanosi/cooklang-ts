const metadata = /^>>\s*(?<key>.+?):\s*(?<value>.+)/;

const multiwordIngredient = /@(?<mIngredientProse>[^@#~$[]+?)(\[(?<mIngredientName>.*?)\])?(\((?<mIngredientDescriptor>.*?)\))?\{(?<mIngredientMeasurements>(?:\|)?([^}]*))\}(?::(?<mIngredientGroup>[^@#~$[]+):)?/;
// const multiwordIngredient = /@(?<mIngredientProse>[^@#~$[]+?)(\[(?<mIngredientName>.*?)\])?(\((?<mIngredientDescriptor>.*?)\))?\{(?<mIngredientQuantity>.*?)(?:%(?<mIngredientUnits>[^}]+?))?\}/;
const singleWordIngredient = /@(?<sIngredientName>[^\s\t\p{Zs}\p{P}]+)/;

const multiwordCookware = /#(?<mCookwareName>[^@#~$[]+?)\{(?<mCookwareQuantity>.*?)\}/;
const singleWordCookware = /#(?<sCookwareName>[^\s\t\p{Zs}\p{P}]+)/;

const highlight = 
/\$(?<highlightProse>[^@#~$[]+?)(\[(?<highlightClass>.+?)\])?\{(?<highlightMeasurements>(?:\|)?([^}]*))\}/;

const timer = /~(?<timerName>.*?)(?:\{(?<timerQuantity>.*?)(?:%(?<timerUnits>.+?))?\})/;

const title = /# (?<title>.*?)\s*#*$/;

export const comment = /--.*/g;
export const blockComment = /\s*\[\-.*?\-\]\s*/g;

export const shoppingList = /\[(?<name>.+)\]\n(?<items>[^]*?)(?:\n\n|$)/g;
export const tokens = new RegExp([
    metadata,
    multiwordIngredient,
    singleWordIngredient,
    multiwordCookware,
    singleWordCookware,
    highlight,
    timer,
    title,
].map(r => r.source).join('|'), 'gum');
