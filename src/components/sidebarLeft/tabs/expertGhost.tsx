import Section from '@components/section';
import Row from '@components/rowTsx';
import CheckboxFieldTsx from '@components/checkboxFieldTsx';
import {i18n, LangPackKey} from '@lib/langPack';
import {joinDeepPath} from '@helpers/object/setDeepProperty';
import {GHOST_TRACES, GhostTrace} from '@appManagers/utils/expertGhost';

const TRACE_ROWS: {[trace in GhostTrace]: {icon: Icon, title: LangPackKey, subtitle: LangPackKey}} = {
  read: {icon: 'checks', title: 'Expert.Ghost.Read', subtitle: 'Expert.Ghost.Read.Subtitle'},
  typing: {icon: 'keyboard', title: 'Expert.Ghost.Typing', subtitle: 'Expert.Ghost.Typing.Subtitle'},
  online: {icon: 'online', title: 'Expert.Ghost.Online', subtitle: 'Expert.Ghost.Online.Subtitle'},
  stories: {icon: 'stories', title: 'Expert.Ghost.Stories', subtitle: 'Expert.Ghost.Stories.Subtitle'}
};

// Settings → Expert → Ghost Mode: the switch (also in the side menu) and what it hides
export default function ExpertGhost() {
  return (
    <>
      <Section caption="Expert.Ghost.Caption">
        <Row>
          <Row.CheckboxFieldToggle>
            <CheckboxFieldTsx stateKey={joinDeepPath('settings', 'expert', 'ghost', 'enabled')} toggle />
          </Row.CheckboxFieldToggle>
          <Row.Title>{i18n('Expert.Ghost.Enable')}</Row.Title>
        </Row>
      </Section>
      <Section name="Expert.Ghost.Hide">
        {GHOST_TRACES.map((trace) => {
          const row = TRACE_ROWS[trace];
          return (
            <Row>
              <Row.Icon icon={row.icon} />
              <Row.CheckboxFieldToggle>
                <CheckboxFieldTsx stateKey={joinDeepPath('settings', 'expert', 'ghost', trace)} toggle />
              </Row.CheckboxFieldToggle>
              <Row.Title>{i18n(row.title)}</Row.Title>
              <Row.Subtitle>{i18n(row.subtitle)}</Row.Subtitle>
            </Row>
          );
        })}
      </Section>
    </>
  );
}
