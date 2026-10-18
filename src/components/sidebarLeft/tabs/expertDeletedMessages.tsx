import {createResource, For} from 'solid-js';
import Section from '@components/section';
import Row from '@components/rowTsx';
import CheckboxFieldTsx from '@components/checkboxFieldTsx';
import RadioFieldTsx from '@components/radioFieldTsx';
import {IconTsx} from '@components/iconTsx';
import confirmationPopup from '@components/confirmationPopup';
import {toastNew} from '@components/toast';
import I18n, {i18n, LangPackKey} from '@lib/langPack';
import rootScope from '@lib/rootScope';
import {joinDeepPath} from '@helpers/object/setDeepProperty';
import classNames from '@helpers/string/classNames';
import {usePromiseCollector} from '@components/solidJsTabs/promiseCollector';
import {useAppSettings} from '@stores/appSettings';
import {DELETED_MESSAGE_MARKS} from '@appManagers/utils/messages/isSavedDeletedMessage';
import styles from '@components/sidebarLeft/tabs/expertDeletedMessages.module.scss';

// Settings → Expert → Deleted Messages: keeping them, how they look, and clearing them.
export default function ExpertDeletedMessages() {
  const promiseCollector = usePromiseCollector();
  const [appSettings, setAppSettings] = useAppSettings();

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
      <Section caption="Expert.SaveDeletedMessages.Caption">
        <Row>
          <Row.CheckboxFieldToggle>
            <CheckboxFieldTsx stateKey={joinDeepPath('settings', 'expert', 'saveDeletedMessages')} toggle />
          </Row.CheckboxFieldToggle>
          <Row.Title>{i18n('Expert.SaveDeletedMessages')}</Row.Title>
        </Row>
      </Section>
      <Section name="Expert.DeletedLook">
        <form>
          {([['faded', 'Expert.DeletedLook.Faded'], ['normal', 'Expert.DeletedLook.Normal']] as const).map(([value, langKey]) => (
            <Row>
              <Row.RadioField>
                <RadioFieldTsx name="expert-deleted-look" value={value} stateKey={joinDeepPath('settings', 'expert', 'deletedLook')} />
              </Row.RadioField>
              <Row.Title>{i18n(langKey)}</Row.Title>
            </Row>
          ))}
        </form>
      </Section>
      <Section name="Expert.DeletedMark" caption="Expert.DeletedMark.Caption">
        {/* the word, or an icon in its place: each choice shows itself */}
        <div class={styles.marks}>
          <For each={DELETED_MESSAGE_MARKS}>{(mark) => {
            const selected = () => (appSettings.expert?.deletedMark || 'delete') === mark;
            return (
              <button
                type="button"
                class={classNames(styles.mark, selected() && styles.selected)}
                aria-pressed={selected()}
                aria-label={I18n.format(`Expert.DeletedMark.${mark}` as LangPackKey, true)}
                onClick={() => setAppSettings('expert', 'deletedMark', mark)}
              >
                {mark === 'text' ? <i class={styles.word}>{i18n('Expert.DeletedMessage')}</i> : <IconTsx icon={mark} />}
              </button>
            );
          }}</For>
        </div>
      </Section>
      <Section>
        <Row color="danger" clickable={clearSaved} disabled={!savedCount()}>
          <Row.Icon icon="delete" />
          {/* the count's place is there from the start: a right side that appears later takes the title with it */}
          <Row.Title class="danger" titleRight={<span>{savedCount() || ''}</span>}>
            {i18n('Expert.ClearDeletedMessages')}
          </Row.Title>
        </Row>
      </Section>
    </>
  );
}
