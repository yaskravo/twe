// * the faces the interface can be drawn in: Telegram's Roboto, those Expert's design offers in its
// * place (Settings → Expert; scss/fonts/_nunito.scss, _rubik.scss), Nunito first, and the user's
// * own — a font installed on the device, by name, or a font file (lib/expertCustomFont.ts)
export type InterfaceFont = 'nunito' | 'rubik' | 'system' | 'roboto' | 'device' | 'file';
export const INTERFACE_FONTS = ['nunito', 'rubik', 'system', 'roboto'] as const;
export const DEFAULT_EXPERT_FONT: InterfaceFont = 'nunito';
export const CUSTOM_FONT_FAMILY = 'Expert Custom Font';

const FALLBACK_FONT_FAMILY = '-apple-system, apple color emoji, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';
const INTERFACE_FONT_FAMILIES: {[font in typeof INTERFACE_FONTS[number]]: string} = {
  nunito: 'Nunito, ' + FALLBACK_FONT_FAMILY,
  rubik: 'Rubik, ' + FALLBACK_FONT_FAMILY,
  // * the device's own: San Francisco on Apple devices, Segoe UI on Windows
  system: '-apple-system, apple color emoji, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  roboto: 'Roboto, ' + FALLBACK_FONT_FAMILY
};

export function getInterfaceFontFamily(font: InterfaceFont, deviceFont?: string) {
  if(font === 'device') {
    // * a name the user typed, quoted, without what would end the quotes or the declaration
    const name = deviceFont?.replace(/["\\;{}]/g, '').trim();
    return name ? `"${name}", ${FALLBACK_FONT_FAMILY}` : INTERFACE_FONT_FAMILIES[DEFAULT_EXPERT_FONT as 'nunito'];
  }

  if(font === 'file') {
    return `"${CUSTOM_FONT_FAMILY}", ${FALLBACK_FONT_FAMILY}`;
  }

  return INTERFACE_FONT_FAMILIES[font];
}

export const FontSize = '16px';
export const FontWeight = '400';
export const FontWeightBold = '500';
// * live bindings: text measured on a canvas has to be measured in the font the interface is drawn in,
// * so they follow it (setInterfaceFont) — read them when measuring, not once.
// * FontFamilyName is the face the app waits for before showing itself (helpers/dom/loadFonts.ts)
export let FontFamilyName = 'Roboto';
export let FontFamily = INTERFACE_FONT_FAMILIES.roboto;
export let FontFull = `${FontWeight} ${FontSize} ${FontFamily}`;
export let FontFullBold = `${FontWeightBold} ${FontSize} ${FontFamily}`;

export function setInterfaceFont(fontFamily: string) {
  FontFamily = fontFamily;
  FontFamilyName = fontFamily.split(',')[0];
  FontFull = `${FontWeight} ${FontSize} ${FontFamily}`;
  FontFullBold = `${FontWeightBold} ${FontSize} ${FontFamily}`;
}
