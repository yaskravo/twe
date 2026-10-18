import {For} from 'solid-js';
import PopupElement, {createPopup} from '@components/popups/indexTsx';
import I18n, {i18n} from '@lib/langPack';
import parseMarkdown from '@lib/richTextProcessor/parseMarkdown';
import wrapRichText from '@lib/richTextProcessor/wrapRichText';
import safeWindowOpen from '@helpers/dom/safeWindowOpen';
import styles from '@components/popups/expertAbout.module.scss';

// * Expert's own releases, newest first: a release adds its version here and its notes to
// * CHANGELOG.md, CHANGELOG_ru.md and CHANGELOG_uk.md (served as changelogs/<lang>_<version>.md)
export const EXPERT_VERSIONS = ['2.3'];

const SOURCE_URL = 'https://github.com/yaskravo/twe';
const LICENSE_URL = 'https://www.gnu.org/licenses/gpl-3.0.html';

// ! the notes are written in English, Russian and Ukrainian only, by the author's rule: every other
// ! language reads the English, and no CHANGELOG_<lang>.md is added for one
const RELEASE_NOTES_LANGS = new Set(['en', 'ru', 'uk']);

// * a release's notes in the interface's language, or in English where there are none in it
async function getReleaseNotes(version: string) {
  const langCode = (I18n.getLastRequestedLangCode() || 'en').split('-', 1)[0];
  for(const lang of new Set([RELEASE_NOTES_LANGS.has(langCode) ? langCode : 'en', 'en'])) {
    const response = await fetch(`changelogs/${lang}_${version}.md`).catch((): Response => undefined);
    if(response?.ok) {
      const [text, entities] = parseMarkdown(await response.text(), []);
      return wrapRichText(text, {entities});
    }
  }
}

/** What Expert's releases brought: after an update just the new one, from Settings → Expert all of them. */
export async function showExpertChangelog(versions = EXPERT_VERSIONS) {
  const releases = (await Promise.all(versions.map(async(version): Promise<{version: string, notes: DocumentFragment}> => ({version, notes: await getReleaseNotes(version)}))))
  .filter((release) => release.notes);
  if(!releases.length) {
    return;
  }

  createPopup(() => (
    <PopupElement class={styles.popup} closable>
      <PopupElement.Header>
        <PopupElement.Title title="Expert.WhatsNew" />
      </PopupElement.Header>
      <PopupElement.Body class={styles.body}>
        <For each={releases}>{(release) => (
          <section class={styles.release}>
            <h3 class={styles.version}>Expert {release.version}</h3>
            <div class={styles.notes}>{release.notes}</div>
          </section>
        )}</For>
      </PopupElement.Body>
      <PopupElement.Buttons>
        <PopupElement.Button langKey="OK" />
      </PopupElement.Buttons>
    </PopupElement>
  ));
}

/** The licence Expert is shared under, in plain words, with the way to its full text and to the code. */
export function showExpertLicense() {
  createPopup(() => (
    <PopupElement class={styles.popup} closable>
      <PopupElement.Header>
        <PopupElement.Title title="Expert.License" />
      </PopupElement.Header>
      <PopupElement.Body class={styles.body}>
        <p class={styles.paragraph}>{i18n('Expert.License.Text')}</p>
        <p class={styles.paragraph}>{i18n('Expert.License.Credits')}</p>
      </PopupElement.Body>
      <PopupElement.Buttons>
        <PopupElement.Button langKey="OK" />
        <PopupElement.Button langKey="Expert.License.Full" callback={() => safeWindowOpen(LICENSE_URL)} />
        <PopupElement.Button langKey="Expert.License.Source" callback={() => safeWindowOpen(SOURCE_URL)} />
      </PopupElement.Buttons>
    </PopupElement>
  ));
}
