import {createEffect, createSignal, For, JSX, onCleanup, Show} from 'solid-js';
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
import {DEFAULT_EXPERT_ACCENT, DEFAULT_EXPERT_CORNERS, DEFAULT_EXPERT_WALLPAPER, EXPERT_ACCENTS, EXPERT_CORNER_SCALES, EXPERT_WALLPAPER_CHOICES, getExpertWallpaperAccent} from '@config/expertAppearance';
import {getRgbColorFromTelegramColor, mixColors, rgbaToHexa} from '@helpers/color';
import RangeSettingSelector from '@components/rangeSettingSelector';
import {IconTsx} from '@components/iconTsx';
import ProgressivePreloader from '@components/preloader';
import deferredPromise from '@helpers/cancellablePromise';
import noop from '@helpers/noop';
import {subscribeOn} from '@helpers/solid/subscribeOn';
import rootScope from '@lib/rootScope';
import {AppBackgroundTab, prepareWallPaperImageUpload, WALLPAPER_IMAGE_TYPES} from '@components/sidebarLeft/tabs/background';
import type {BaseTheme, WallPaper} from '@layer';
import themeController from '@helpers/themeController';
import classNames from '@helpers/string/classNames';
import styles from '@components/sidebarLeft/tabs/expertAppearance.module.scss';

const toHex = (color: number) => '#' + color.toString(16).padStart(6, '0');

// * what the theme shows now: its stock wallpaper (which Expert's stands in for), the user's own
// * colour or photo, or another one picked in Telegram's settings; and the base the previews take,
// * whose own Expert wallpapers they show (Dark has none: it shows the night ones)
const readWallpaperState = () => {
  const theme = themeController.getTheme();
  const settings = themeController.getThemeSettings(theme);
  const wallPaper = settings?.wallpaper;
  const stock = !!settings && themeController.hasStockWallPaper(settings);
  const kind = stock || !wallPaper ? undefined :
    wallPaper._ === 'wallPaperNoFile' ? 'color' as const :
    !(wallPaper as WallPaper.wallPaper).pFlags?.pattern ? 'photo' as const :
    undefined;
  const baseTheme = themeController.getBaseThemeForName(theme.name);
  return {
    stock,
    kind,
    wallPaper: kind ? wallPaper : undefined,
    baseTheme: baseTheme === 'baseThemeTinted' ? 'baseThemeNight' as const : baseTheme
  };
};

// * an outgoing bubble in an accent: a light tint of it by day, the accent itself at night
const getOutgoingBubbleColor = (accent: number, baseTheme: BaseTheme['_']) => {
  const rgb = getRgbColorFromTelegramColor(accent);
  return rgbaToHexa(baseTheme === 'baseThemeNight' ? rgb : mixColors(rgb, [255, 255, 255], .3));
};

// * a wallpaper the way a chat shows it, with a bubble of each side — Telegram's own rendering and
// * tile, as in its theme picker; or an icon, for a choice with nothing to show yet
const WallpaperTile = (props: {
  active: boolean,
  wallPaper?: WallPaper,
  baseTheme: BaseTheme['_'],
  // * the accent the wallpaper goes with, for the outgoing bubble
  accent?: number,
  icon?: Icon,
  label: LangPackKey,
  onClick: (e: MouseEvent & {currentTarget: HTMLButtonElement}) => void
}) => {
  let tile: HTMLButtonElement;
  createEffect(() => {
    const result = props.wallPaper && AppBackgroundTab.addWallPaper(props.wallPaper, undefined, props.baseTheme);
    if(!result) {
      return;
    }

    tile.prepend(result.container);
    onCleanup(() => {
      result.dispose();
      result.container.remove();
    });
  });

  return (
    <div class={classNames(styles.wallpaper, props.active && styles.active)}>
      <button
        ref={tile}
        type="button"
        class={classNames('theme-container', styles.tile, props.active && 'active', !props.wallPaper && styles.blank)}
        style={props.accent !== undefined ? {'--light-filled-message-out-primary-color': getOutgoingBubbleColor(props.accent, props.baseTheme)} : undefined}
        aria-pressed={props.active}
        aria-label={I18n.format(props.label, true)}
        onClick={props.onClick}
      >
        <Show when={props.wallPaper} fallback={<IconTsx icon={props.icon} />}>
          <div class="theme-bubble is-in" />
          <div class="theme-bubble is-out" />
        </Show>
      </button>
      <span class={styles.name}>{i18n(props.label)}</span>
    </div>
  );
};

const FONT_NAMES: {[font in typeof INTERFACE_FONTS[number]]: () => JSX.Element} = {
  nunito: () => 'Nunito',
  rubik: () => 'Rubik',
  system: () => i18n('Expert.Font.System'),
  roboto: () => i18n('Expert.Font.Telegram')
};

// Settings → Expert → Appearance: Expert's look or Telegram's, and what the look is made of — accent,
// chat background, corners, text size, font. Telegram's own theme settings stay in General Settings.
export default function ExpertAppearance() {
  const [tab] = useSuperTab<typeof AppExpertAppearanceTab>();
  const [appSettings, setAppSettings] = useAppSettings();
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
                  onClick={() => themeController.setExpertLook({accent: color})}
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
                wallPaper={themeController.getExpertWallPaper(wallpaper, wallpaperState().baseTheme)}
                baseTheme={wallpaperState().baseTheme}
                accent={getExpertWallpaperAccent(wallpaper)}
                label={`Expert.Wallpaper.${wallpaper}` as LangPackKey}
                onClick={() => themeController.setExpertLook({wallpaper, accent: getExpertWallpaperAccent(wallpaper)})}
              />
            )}</For>
            {/* the user's own: a colour or gradient in Telegram's editor, or a photo */}
            <WallpaperTile
              active={wallpaperState().kind === 'color'}
              wallPaper={wallpaperState().kind === 'color' ? wallpaperState().wallPaper : undefined}
              baseTheme={wallpaperState().baseTheme}
              icon="colorize"
              label="Expert.Wallpaper.color"
              onClick={() => tab.slider.createTab(AppBackgroundColorTab).open()}
            />
            <WallpaperTile
              active={wallpaperState().kind === 'photo'}
              wallPaper={wallpaperState().kind === 'photo' ? wallpaperState().wallPaper : undefined}
              baseTheme={wallpaperState().baseTheme}
              icon="image"
              label="Expert.Wallpaper.photo"
              onClick={(e) => uploadPhoto(e.currentTarget)}
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
