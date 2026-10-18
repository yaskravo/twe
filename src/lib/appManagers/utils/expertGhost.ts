import type {StateSettings} from '@config/state';

// * Expert's ghost mode (the side menu, Settings → Expert): nothing tells others the user is here —
// * chats are read on this device only, no "typing…", the status stays offline, stories are watched
// * unseen. It only holds requests back and never sends one an official client would not: what the
// * user does on purpose (a message sent, Mark as Read) still goes out, the way any client sends it
export default function isGhost(settings: StateSettings) {
  return !!settings?.expert?.ghost?.enabled;
}
