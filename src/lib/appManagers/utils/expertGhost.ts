import type {StateSettings} from '@config/state';

// * Expert's ghost mode (Settings → Expert → Ghost Mode): the traces of the user's presence that are
// * not sent. Nothing is sent in their place, so to the server it is a client that simply does not
// * read, type, go online or watch stories — no request it would not otherwise see.
export type GhostTrace = 'read' | 'typing' | 'online' | 'stories';
export const GHOST_TRACES: GhostTrace[] = ['read', 'typing', 'online', 'stories'];

export default function isGhost(settings: StateSettings, trace: GhostTrace) {
  const ghost = settings?.expert?.ghost;
  return !!ghost?.enabled && ghost[trace] !== false;
}
