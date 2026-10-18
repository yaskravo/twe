import Section from '@components/section';
import Row from '@components/rowTsx';
import CheckboxFieldTsx from '@components/checkboxFieldTsx';
import {i18n} from '@lib/langPack';
import {useSuperTab} from '@components/solidJsTabs/superTabProvider';
import {AppExpertAppearanceTab, AppExpertDeletedMessagesTab, AppExpertPerformanceTab, type AppExpertSettingsTab} from '@components/solidJsTabs/tabs';
import {joinDeepPath} from '@helpers/object/setDeepProperty';
import GhostIcon from '@components/ghostIcon';
import App from '@config/app';

// Settings → Expert: what the Expert fork adds on top of the client, a screen for each part.
export default function ExpertSettings() {
  const [tab] = useSuperTab<typeof AppExpertSettingsTab>();

  return (
    <>
      <Section>
        <Row clickable={() => tab.slider.createTab(AppExpertDeletedMessagesTab).open()}>
          <Row.Icon icon="delete" />
          <Row.Title>{i18n('Expert.DeletedMessages')}</Row.Title>
        </Row>
        <Row clickable={() => tab.slider.createTab(AppExpertAppearanceTab).open()}>
          <Row.Icon icon="appearance_filled" />
          <Row.Title>{i18n('Expert.Design')}</Row.Title>
        </Row>
        <Row clickable={() => tab.slider.createTab(AppExpertPerformanceTab).open()}>
          <Row.Icon icon="sputnik_filled" />
          <Row.Title>{i18n('Expert.Performance')}</Row.Title>
        </Row>
      </Section>
      {/* the same switch as in the side menu */}
      <Section caption="Expert.Ghost.Caption">
        <Row>
          <Row.Icon icon="eyecross">{GhostIcon('row-icon-icon')}</Row.Icon>
          <Row.CheckboxFieldToggle>
            <CheckboxFieldTsx stateKey={joinDeepPath('settings', 'expert', 'ghost', 'enabled')} toggle />
          </Row.CheckboxFieldToggle>
          <Row.Title>{i18n('Expert.Ghost')}</Row.Title>
        </Row>
      </Section>
      <Section caption="Expert.About" captionArgs={[`${App.version} (${App.build})`]}>
        <Row clickable={() => import('@components/popups/expertAbout').then(({showExpertChangelog}) => showExpertChangelog())}>
          <Row.Icon icon="gift_filled" />
          <Row.Title>{i18n('Expert.WhatsNew')}</Row.Title>
        </Row>
        <Row clickable={() => import('@components/popups/expertAbout').then(({showExpertLicense}) => showExpertLicense())}>
          <Row.Icon icon="info_filled" />
          <Row.Title>{i18n('Expert.License')}</Row.Title>
        </Row>
      </Section>
    </>
  );
}
