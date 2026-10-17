import {createResource} from 'solid-js';
import Section from '@components/section';
import Row from '@components/rowTsx';
import CheckboxFieldTsx from '@components/checkboxFieldTsx';
import RadioFieldTsx from '@components/radioFieldTsx';
import confirmationPopup from '@components/confirmationPopup';
import {toastNew} from '@components/toast';
import {i18n} from '@lib/langPack';
import rootScope from '@lib/rootScope';
import {joinDeepPath} from '@helpers/object/setDeepProperty';
import {usePromiseCollector} from '@components/solidJsTabs/promiseCollector';
import App from '@config/app';

// Settings → Expert: what the Expert fork adds on top of the client.
export default function ExpertSettings() {
  const promiseCollector = usePromiseCollector();

  const [savedCount, {refetch}] = createResource(() => {
    const promise = rootScope.managers.appDeletedMessagesManager.getSavedCount();
    promiseCollector.collect(promise);
    return promise;
  });

  const clearSaved = async() => {
    try {
      await confirmationPopup({
        descriptionLangKey: 'Expert.ClearDeletedMessages.Confirm',
        button: {
          langKey: 'Delete',
          isDanger: true
        }
      });
    } catch(err) {
      return;
    }

    await rootScope.managers.appDeletedMessagesManager.clearSaved();
    refetch();
    toastNew({langPackKey: 'Expert.ClearDeletedMessages.Done'});
  };

  return (
    <>
      <Section name="Expert.DeletedMessages" caption="Expert.SaveDeletedMessages.Caption">
        <Row>
          <Row.CheckboxFieldToggle>
            <CheckboxFieldTsx stateKey={joinDeepPath('settings', 'expert', 'saveDeletedMessages')} toggle />
          </Row.CheckboxFieldToggle>
          <Row.Title>{i18n('Expert.SaveDeletedMessages')}</Row.Title>
        </Row>
        <Row>
          <Row.CheckboxFieldToggle>
            <CheckboxFieldTsx stateKey={joinDeepPath('settings', 'expert', 'fadeDeletedMessages')} toggle />
          </Row.CheckboxFieldToggle>
          <Row.Title>{i18n('Expert.FadeDeletedMessages')}</Row.Title>
        </Row>
        <Row color="danger" clickable={clearSaved} disabled={!savedCount()}>
          <Row.Icon icon="delete" />
          {/* the count's place is there from the start: a right side that appears later takes the title with it */}
          <Row.Title class="danger" titleRight={<span>{savedCount() || ''}</span>}>
            {i18n('Expert.ClearDeletedMessages')}
          </Row.Title>
        </Row>
      </Section>
      <Section name="Expert.Design" caption="Expert.Design.Caption">
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
      <Section noContent caption="Expert.About" captionArgs={[`${App.version} (${App.build})`]} />
    </>
  );
}
