import Section from '@components/section';
import Row from '@components/rowTsx';
import RadioFieldTsx from '@components/radioFieldTsx';
import {i18n} from '@lib/langPack';
import {joinDeepPath} from '@helpers/object/setDeepProperty';
import isWeakDevice from '@helpers/isWeakDevice';
import {useSuperTab} from '@components/solidJsTabs/superTabProvider';
import {AppPowerSavingTab, type AppExpertPerformanceTab} from '@components/solidJsTabs/tabs';

// Settings → Expert → Performance: the light mode that keeps the client smooth on weak computers.
export default function ExpertPerformance() {
  const [tab] = useSuperTab<typeof AppExpertPerformanceTab>();

  return (
    <>
      <Section name="Expert.LightMode" caption="Expert.LightMode.Caption">
        <form>
          {([['auto', 'Expert.LightMode.Auto'], ['on', 'Expert.LightMode.On'], ['off', 'Expert.LightMode.Off']] as const).map(([value, langKey]) => (
            <Row>
              <Row.RadioField>
                <RadioFieldTsx name="expert-light-mode" value={value} stateKey={joinDeepPath('settings', 'expert', 'lightMode')} />
              </Row.RadioField>
              <Row.Title>{i18n(langKey)}</Row.Title>
              {/* what automatic means here, on this computer */}
              {value === 'auto' && (
                <Row.Subtitle>{i18n(isWeakDevice() ? 'Expert.LightMode.AutoOn' : 'Expert.LightMode.AutoOff')}</Row.Subtitle>
              )}
            </Row>
          ))}
        </form>
      </Section>
      {/* Telegram's own Power Saving switches, one by one */}
      <Section>
        <Row clickable={() => tab.slider.createTab(AppPowerSavingTab).open()}>
          <Row.Icon icon="sputnik_filled" />
          <Row.Title>{i18n('LiteMode.EnableText')}</Row.Title>
        </Row>
      </Section>
    </>
  );
}
