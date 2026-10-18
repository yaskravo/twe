import {createSignal, For, JSX, Show} from 'solid-js';
import Section from '@components/section';
import Row from '@components/rowTsx';
import CheckboxFieldTsx from '@components/checkboxFieldTsx';
import RadioFieldTsx from '@components/radioFieldTsx';
import I18n, {i18n, LangPackKey} from '@lib/langPack';
import {joinDeepPath} from '@helpers/object/setDeepProperty';
import {useAppSettings} from '@stores/appSettings';
import {useSuperTab} from '@components/solidJsTabs/superTabProvider';
import {AppBackgroundColorTab, type AppExpertAppearanceTab} from '@components/solidJsTabs/tabs';
import {InputFieldTsx} from '@components/inputFieldTsx';
import {toastNew} from '@components/toast';
import requestFile from '@helpers/files/requestFile';
import {getInterfaceFontFamily, INTERFACE_FONTS} from '@config/font';
import {DEFAULT_EXPERT_ACCENT, DEFAULT_EXPERT_CORNERS, DEFAULT_EXPERT_WALLPAPER, EXPERT_ACCENTS, EXPERT_CORNER_SCALES, EXPERT_WALLPAPER_CHOICES, EXPERT_WALLPAPERS} from '@config/expertAppearance';
import RangeSettingSelector from '@components/rangeSettingSelector';
import {IconTsx} from '@components/iconTsx';
import ProgressivePreloader from '@components/preloader';
import deferredPromise from '@helpers/cancellablePromise';
import noop from '@helpers/noop';
import {getWallPaperColors} from '@helpers/color';
import {subscribeOn} from '@helpers/solid/subscribeOn';
import rootScope from '@lib/rootScope';
import {ThemeSection} from '@components/sidebarLeft/tabs/generalSettings';
import {AppBackgroundTab, prepareWallPaperImageUpload, WALLPAPER_IMAGE_TYPES} from '@components/sidebarLeft/tabs/background';
import {DEFAULT_THEME} from '@config/state';
import type {ThemeSettings, WallPaper} from '@layer';
import themeController from '@helpers/themeController';
import classNames from '@helpers/string/classNames';
import useIsNightTheme from '@hooks/useIsNightTheme';
import styles from '@components/sidebarLeft/tabs/expertAppearance.module.scss';

const toHex = (color: number) => '#' + color.toString(16).padStart(6, '0');

// * a wallpaper's preview: its gradient, darkened at night the way a night wallpaper is a dark pattern
const getWallpaperPreview = (colors: (number | string)[], night: boolean) => {
  const stops = colors.map((color) => typeof(color) === 'number' ? toHex(color) : color);
  const gradient = stops.length > 1 ? `linear-gradient(135deg, ${stops.join(', ')})` : stops[0];
  return night ? `linear-gradient(rgba(0, 0, 0, .55), rgba(0, 0, 0, .55)), ${gradient}` : gradient;
};

// * Telegram's own wallpaper, for its tile
const getTelegramWallpaperColors = (night: boolean) => {
  const stock = (DEFAULT_THEME.settings as ThemeSettings[]).find((s) => s.base_theme._ === (night ? 'baseThemeNight' : 'baseThemeClassic'));
  return getWallPaperColors(stock.wallpaper);
};

// * what the theme shows now: its stock wallpaper (which Expert's stands in for), the user's own
// * colour or photo, or another one picked in Telegram's settings
const readWallpaperState = () => {
  const settings = themeController.getThemeSettings(themeController.getTheme());
  const wallPaper = settings?.wallpaper;
  const stock = !!settings && themeController.hasStockWallPaper(settings);
  const kind = stock || !wallPaper ? undefined :
    wallPaper._ === 'wallPaperNoFile' ? 'color' as const :
    !(wallPaper as WallPaper.wallPaper).pFlags?.pattern ? 'photo' as const :
    undefined;
  return {stock, kind, colors: kind === 'color' ? getWallPaperColors(wallPaper) : []};
};

const WallpaperTile = (props: {
  active: boolean,
  background?: string,
  icon?: Icon,
  label: LangPackKey,
  onClick: (e: MouseEvent & {currentTarget: HTMLButtonElement}) => void
}) => (
  <button
    type="button"
    class={classNames(styles.wallpaper, props.active && styles.active)}
    aria-pressed={props.active}
    onClick={props.onClick}
  >
    <span class={classNames(styles.preview, !props.background && styles.blank)} style={props.background ? {background: props.background} : undefined}>
      {props.icon && !props.background && <IconTsx icon={props.icon} />}
    </span>
    <span class={styles.name}>{i18n(props.label)}</span>
  </button>
);

const FONT_NAMES: {[font in typeof INTERFACE_FONTS[number]]: () => JSX.Element} = {
  nunito: () => 'Nunito',
  rubik: () => 'Rubik',
  system: () => i18n('Expert.Font.System'),
  roboto: () => i18n('Expert.Font.Telegram')
};

// Settings → Expert → Appearance: Expert's look or Telegram's, the theme, and what the look is made of —
// accent, chat background, corners, text size, font.
export default function ExpertAppearance() {
  const [tab] = useSuperTab<typeof AppExpertAppearanceTab>();
  const [appSettings, setAppSettings] = useAppSettings();
  const isNight = useIsNightTheme();
  const fontStateKey = joinDeepPath('settings', 'expert', 'font');

  const [wallpaperState, setWallpaperState] = createSignal(readWallpaperState());
  subscribeOn(rootScope)('theme_changed', () => setWallpaperState(readWallpaperState()));

  // * the photo uploads in the background, its progress on the tile, and becomes the wallpaper once up
  const uploadPhoto = (preview: HTMLElement) => {
    requestFile(WALLPAPER_IMAGE_TYPES).then(async(file) => {
      let upload: Awaited<ReturnType<typeof prepareWallPaperImageUpload>>;
      try {
        upload = await prepareWallPaperImageUpload(file);
      } catch(err) {
        toastNew({langPackKey: 'Error.AnError'});
        return;
      }

      const {uploadDeferred, releaseUploadPreview} = upload;
      const deferred = deferredPromise<void>();
      deferred.addNotifyListener = uploadDeferred.addNotifyListener.bind(uploadDeferred);
      deferred.cancel = uploadDeferred.cancel;
      uploadDeferred.then((wallPaper) => AppBackgroundTab.setBackgroundDocument(wallPaper)).then(deferred.resolve, deferred.reject);
      deferred.then(releaseUploadPreview, releaseUploadPreview);
      deferred.catch((error: ApiError) => {
        if(error?.type !== 'DOWNLOAD_CANCELED' && error?.type !== 'UPLOAD_CANCELED') {
          toastNew({langPackKey: 'Error.AnError'});
        }
      });

      const preloader = new ProgressivePreloader({isUpload: true, cancelable: true, tryAgainOnFail: false});
      preloader.attach(preview, false, deferred);
    }, noop);
  };

  const uploadFont = async() => {
    let file: File;
    try {
      file = await requestFile('.ttf,.otf,.woff,.woff2');
    } catch(err) {
      return;
    }

    try {
      const {setCustomFontFile} = await import('@lib/expertCustomFont');
      await setCustomFontFile(file);
    } catch(err) {
      toastNew({langPackKey: 'Expert.Font.File.Invalid'});
      return;
    }

    setAppSettings('expert', 'fontFileName', file.name);
    setAppSettings('expert', 'font', 'file');
  };

  return (
    <>
      <Section name="Expert.Style" caption="Expert.Design.Caption">
        <form>
          {([['expert', 'Expert.Design.Expert'], ['classic', 'Expert.Design.Classic']] as const).map(([value, langKey]) => (
            <Row>
              <Row.RadioField>
                <RadioFieldTsx name="expert-design" value={value} stateKey={joinDeepPath('settings', 'expert', 'design')} />
              </Row.RadioField>
              <Row.Title>{i18n(langKey)}</Row.Title>
            </Row>
          ))}
        </form>
      </Section>
      {/* Telegram's own theme settings, the same block as in General Settings */}
      <ThemeSection />
      <Show when={appSettings.expert?.design !== 'classic'}>
        <Section name="Expert.Accent">
          <div class={styles.swatches}>
            <For each={EXPERT_ACCENTS}>{({color, name}) => {
              const active = () => (appSettings.expert?.accent ?? DEFAULT_EXPERT_ACCENT) === color;
              return (
                <button
                  type="button"
                  class={classNames('accent-circle', styles.swatch, active() && 'accent-circle--active')}
                  style={{'--accent-circle-ring': toHex(color), '--accent-circle-fill-1': toHex(color)}}
                  aria-pressed={active()}
                  aria-label={I18n.format(name, true)}
                  onClick={() => themeController.setExpertAccent(color)}
                >
                  <div class="accent-circle__inner" />
                </button>
              );
            }}</For>
          </div>
        </Section>
        <Section name="Expert.Wallpaper" caption="Expert.Wallpaper.Caption">
          <div class={styles.wallpapers}>
            <For each={EXPERT_WALLPAPER_CHOICES}>{(wallpaper) => (
              <WallpaperTile
                active={wallpaperState().stock && (appSettings.expert?.wallpaper || DEFAULT_EXPERT_WALLPAPER) === wallpaper}
                background={getWallpaperPreview(wallpaper === 'telegram' ?
                  getTelegramWallpaperColors(isNight()) :
                  EXPERT_WALLPAPERS[wallpaper as keyof typeof EXPERT_WALLPAPERS][isNight() ? 'night' : 'light'], isNight())}
                label={`Expert.Wallpaper.${wallpaper}` as LangPackKey}
                onClick={() => themeController.setExpertWallpaper(wallpaper)}
              />
            )}</For>
            {/* the user's own: a colour or gradient in Telegram's editor, or a photo */}
            <WallpaperTile
              active={wallpaperState().kind === 'color'}
              background={wallpaperState().kind === 'color' ? getWallpaperPreview(wallpaperState().colors, false) : undefined}
              icon="colorize"
              label="Expert.Wallpaper.color"
              onClick={() => tab.slider.createTab(AppBackgroundColorTab).open()}
            />
            <WallpaperTile
              active={wallpaperState().kind === 'photo'}
              icon="image"
              label="Expert.Wallpaper.photo"
              onClick={(e) => uploadPhoto(e.currentTarget.firstElementChild as HTMLElement)}
            />
          </div>
        </Section>
      </Show>
      <Section name="Expert.Elements">
        <RangeSettingSelector
          textLeft={i18n('TextSize')}
          textRight={(value) => '' + value}
          step={1}
          value={appSettings.messagesTextSize}
          minValue={12}
          maxValue={20}
          onChange={(value) => setAppSettings('messagesTextSize', value)}
        />
        <Show when={appSettings.expert?.design !== 'classic'}>
          <RangeSettingSelector
            textLeft={i18n('Expert.Corners')}
            textRight={(value) => Math.round(EXPERT_CORNER_SCALES[value] * 100) + '%'}
            step={1}
            value={appSettings.expert?.corners ?? DEFAULT_EXPERT_CORNERS}
            minValue={0}
            maxValue={EXPERT_CORNER_SCALES.length - 1}
            onChange={(value) => setAppSettings('expert', 'corners', value)}
          />
        </Show>
      </Section>
      <Show when={appSettings.expert?.design !== 'classic'}>
        <Section name="Expert.Font" caption="Expert.Font.Caption">
          <form>
            {INTERFACE_FONTS.map((font) => (
              <Row>
                <Row.RadioField>
                  <RadioFieldTsx name="expert-font" value={font} stateKey={fontStateKey} />
                </Row.RadioField>
                {/* each name in its own font, so the list shows what it chooses */}
                <Row.Title>
                  <span style={{'font-family': getInterfaceFontFamily(font)}}>{FONT_NAMES[font]()}</span>
                </Row.Title>
              </Row>
            ))}
            <Row>
              <Row.RadioField>
                <RadioFieldTsx name="expert-font" value="device" stateKey={fontStateKey} />
              </Row.RadioField>
              <Row.Title>{i18n('Expert.Font.Device')}</Row.Title>
            </Row>
            <Show when={appSettings.expert?.fontFileName}>
              <Row>
                <Row.RadioField>
                  <RadioFieldTsx name="expert-font" value="file" stateKey={fontStateKey} />
                </Row.RadioField>
                <Row.Title>
                  <span style={{'font-family': getInterfaceFontFamily('file')}} dir="auto">{appSettings.expert.fontFileName}</span>
                </Row.Title>
              </Row>
            </Show>
          </form>
          <Row clickable={uploadFont}>
            <Row.Icon icon="upload" />
            <Row.Title>{i18n('Expert.Font.Upload')}</Row.Title>
          </Row>
        </Section>
        <Show when={appSettings.expert?.font === 'device'}>
          <Section caption="Expert.Font.Device.Caption">
            <div class="input-wrapper">
              <InputFieldTsx
                label="Expert.Font.Device.Name"
                name="expert-device-font"
                value={appSettings.expert.deviceFont}
                onRawInput={(value) => setAppSettings('expert', 'deviceFont', value)}
              />
            </div>
          </Section>
        </Show>
      </Show>
    </>
  );
}
