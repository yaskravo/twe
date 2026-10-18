import type {BaseTheme} from '@layer';
import type {LangPackKey} from '@lib/langPack';

// * Expert's colours (Settings → Expert → Appearance), applied by helpers/themeController.ts. Both
// * stand in for what a built-in theme ships with only — its stock accent, its stock wallpaper — so
// * an accent or a wallpaper picked in Telegram's own settings stays.

// * the accents to pick from, named by Telegram's own colour names; orange first, across the colour
// * wheel from the purple of Telegram's night theme
export const EXPERT_ACCENTS: {color: number, name: LangPackKey}[] = [
  {color: 0xF0812A, name: 'ColorOrange'},
  {color: 0xE5533D, name: 'ColorRed'},
  {color: 0xE05A9B, name: 'ColorPink'},
  {color: 0x8774E1, name: 'ColorViolet'},
  {color: 0x3390EC, name: 'ColorBlue'},
  {color: 0x1EA59C, name: 'ColorCyan'},
  {color: 0x52A447, name: 'ColorGreen'}
];
export const DEFAULT_EXPERT_ACCENT = EXPERT_ACCENTS[0].color;

// * how round Expert's corners are — bubbles, menus — as steps of the slider, the middle one the design's own
export const EXPERT_CORNER_SCALES = [.5, .75, 1, 1.25, 1.5];
export const DEFAULT_EXPERT_CORNERS = 2;

// * the wallpapers: Telegram's pattern over warm gradients in place of its greens, blues and
// * purples, one set of four colours for the light themes and one for the night
export type ExpertWallpaper = 'apricot' | 'rose' | 'sunset' | 'sand' | 'honey' | 'telegram';
type WallpaperColors = [number, number, number, number];
export const EXPERT_WALLPAPERS: {[wallpaper in Exclude<ExpertWallpaper, 'telegram'>]: {light: WallpaperColors, night: WallpaperColors}} = {
  apricot: {light: [0xfbe3c0, 0xf2b27a, 0xf8d29d, 0xe8956a], night: [0xffc48c, 0xee8a4f, 0xc2573a, 0x8c3b2b]},
  rose: {light: [0xfde2d8, 0xf4a99a, 0xf9cdb9, 0xe88a8a], night: [0xffb3a0, 0xef7f78, 0xb84a5c, 0x6e2c43]},
  sunset: {light: [0xffd29d, 0xf7a072, 0xf5a3a3, 0xd39bd6], night: [0xffb075, 0xf06f6f, 0xb05ba8, 0x5b3e9e]},
  sand: {light: [0xf3ead8, 0xdccaa6, 0xefe2c6, 0xc9b28a], night: [0xe8d3a8, 0xc9a46b, 0x8e6f45, 0x4f3d2a]},
  honey: {light: [0xfff0b8, 0xf6cf6a, 0xfbe39a, 0xeab14d], night: [0xffd36b, 0xe8a93a, 0xa8742a, 0x5e4320]}
};
export const EXPERT_WALLPAPER_CHOICES = [...Object.keys(EXPERT_WALLPAPERS), 'telegram'] as ExpertWallpaper[];
export const DEFAULT_EXPERT_WALLPAPER: ExpertWallpaper = 'apricot';

export function getExpertWallpaperColors(wallpaper: ExpertWallpaper, baseTheme: BaseTheme['_']) {
  const colors = EXPERT_WALLPAPERS[wallpaper as Exclude<ExpertWallpaper, 'telegram'>];
  if(!colors || baseTheme === 'baseThemeTinted') {
    return;
  }

  return baseTheme === 'baseThemeNight' ? colors.night : colors.light;
}
