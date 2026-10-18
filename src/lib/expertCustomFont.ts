import CacheStorageController from '@lib/files/cacheStorage';
import {CUSTOM_FONT_FAMILY} from '@config/font';

// * A font file the user gave Expert (Settings → Expert → Appearance → Font): kept on this device
// * and registered with the document under its own family name, which config/font.ts draws with.
const FILE_NAME = 'font';

let storage: CacheStorageController;
let face: FontFace;
let loadPromise: Promise<boolean>;

const getStorage = () => storage ??= new CacheStorageController('cachedExpertFonts');

async function readFace(source: ArrayBuffer) {
  const newFace = new FontFace(CUSTOM_FONT_FAMILY, source);
  // * rejects what is not a font
  await newFace.load();
  return newFace;
}

function install(newFace: FontFace) {
  if(face) {
    document.fonts.delete(face);
  }

  document.fonts.add(face = newFace);
}

export async function setCustomFontFile(file: File) {
  const newFace = await readFace(await file.arrayBuffer());
  await getStorage().saveFile(FILE_NAME, file);
  install(newFace);
  loadPromise = Promise.resolve(true);
}

export function loadCustomFont() {
  return loadPromise ??= getStorage().getFile(FILE_NAME)
  .then((blob: Blob) => blob.arrayBuffer())
  .then(readFace)
  .then((newFace) => {
    install(newFace);
    return true;
  }, () => {
    // * gone with the cache, or never there: the interface stays in the fallback fonts
    loadPromise = undefined;
    return false;
  });
}
