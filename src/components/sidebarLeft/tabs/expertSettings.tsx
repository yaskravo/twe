import Section from '@components/section';
import Row from '@components/rowTsx';
import {i18n} from '@lib/langPack';
import {useSuperTab} from '@components/solidJsTabs/superTabProvider';
import {AppExpertAppearanceTab, AppExpertDeletedMessagesTab, AppExpertPerformanceTab, type AppExpertSettingsTab} from '@components/solidJsTabs/tabs';
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
      <Section noContent caption="Expert.About" captionArgs={[`${App.version} (${App.build})`]} />
    </>
  );
}
