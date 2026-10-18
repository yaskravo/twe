// * Expert's ghost mode drawn as a ghost (the icon font has none), in the current colour and the
// * size of the text around it, as the font's icons are
const GHOST_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" style="display: block" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M4.5 19.9V10.5a7.5 7.5 0 0 1 15 0v9.4c-1.25 0-1.25-1.6-2.5-1.6s-1.25 1.6-2.5 1.6-1.25-1.6-2.5-1.6-1.25 1.6-2.5 1.6-1.25-1.6-2.5-1.6S5.75 19.9 4.5 19.9z"/>' +
  '<ellipse cx="9.4" cy="10.8" rx="1.15" ry="1.5" fill="currentColor" stroke="none"/>' +
  '<ellipse cx="14.6" cy="10.8" rx="1.15" ry="1.5" fill="currentColor" stroke="none"/>' +
  '</svg>';

export default function GhostIcon(className?: string) {
  const icon = document.createElement('span');
  icon.classList.add('ghost-icon');
  if(className) icon.classList.add(className);
  icon.innerHTML = GHOST_SVG;
  return icon;
}
