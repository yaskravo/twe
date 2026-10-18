import type {BaseTheme} from '@layer';
import type {LangPackKey} from '@lib/langPack';

// * Expert's colours (Settings → Expert → Appearance), applied by helpers/themeController.ts. Both
// * stand in for what a built-in theme ships with only — its stock accent, its stock wallpaper — so
// * an accent or a wallpaper picked in Telegram's own settings stays.

// * the accents to pick from for the user's own background (Expert's bring theirs), named by
// * Telegram's own colour names; orange first, across the colour wheel from the purple of Telegram's
// * night theme
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
// * purples — light ones for the light themes, dark ones for the night, drawn under a soft pattern
// * (EXPERT_NIGHT_WALLPAPER_INTENSITY) rather than as Telegram's coloured lines on black — each with
// * the accent it is picked with, the way a theme of Telegram's pairs its wallpaper with an accent
export type ExpertWallpaper = 'apricot' | 'rose' | 'sunset' | 'sand' | 'honey' | 'telegram';
type WallpaperColors = [number, number, number, number];
export const EXPERT_WALLPAPERS: {[wallpaper in Exclude<ExpertWallpaper, 'telegram'>]: {light: WallpaperColors, night: WallpaperColors, accent: number}} = {
  apricot: {light: [0xfbe3c0, 0xf2b27a, 0xf8d29d, 0xe8956a], night: [0x3d2416, 0x5a3420, 0x2e1b12, 0x4d2c1a], accent: 0xF0812A},
  rose: {light: [0xfde2d8, 0xf4a99a, 0xf9cdb9, 0xe88a8a], night: [0x3d1f2a, 0x5a2a3c, 0x2e1720, 0x4c2232], accent: 0xE05A9B},
  sunset: {light: [0xffd29d, 0xf7a072, 0xf5a3a3, 0xd39bd6], night: [0x3d2230, 0x4d2848, 0x2b1830, 0x2c2452], accent: 0x8774E1},
  sand: {light: [0xf3ead8, 0xdccaa6, 0xefe2c6, 0xc9b28a], night: [0x332a1e, 0x4a3c2a, 0x262017, 0x3f3424], accent: 0x1EA59C},
  honey: {light: [0xfff0b8, 0xf6cf6a, 0xfbe39a, 0xeab14d], night: [0x382c12, 0x54401a, 0x2a2210, 0x4a3818], accent: 0x52A447}
};
export const EXPERT_NIGHT_WALLPAPER_INTENSITY = 40;
// * Telegram's own wallpaper goes with Telegram's blue
const TELEGRAM_WALLPAPER_ACCENT = 0x3390EC;

export function getExpertWallpaperAccent(wallpaper: ExpertWallpaper) {
  return EXPERT_WALLPAPERS[wallpaper as Exclude<ExpertWallpaper, 'telegram'>]?.accent ?? TELEGRAM_WALLPAPER_ACCENT;
}
export const EXPERT_WALLPAPER_CHOICES = [...Object.keys(EXPERT_WALLPAPERS), 'telegram'] as ExpertWallpaper[];
export const DEFAULT_EXPERT_WALLPAPER: ExpertWallpaper = 'apricot';

export function getExpertWallpaperColors(wallpaper: ExpertWallpaper, baseTheme: BaseTheme['_']) {
  const colors = EXPERT_WALLPAPERS[wallpaper as Exclude<ExpertWallpaper, 'telegram'>];
  if(!colors || baseTheme === 'baseThemeTinted') {
    return;
  }

  return baseTheme === 'baseThemeNight' ? colors.night : colors.light;
}
