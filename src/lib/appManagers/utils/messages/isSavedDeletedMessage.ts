import type {Message} from '@layer';

export type SavedDeletedMessage = Message.message & {
  pFlags: Message.message['pFlags'] & {is_deleted: true},
  deletedDate: number
};

/**
 * A message someone else deleted that Expert kept on this device (Settings → Expert → Save deleted
 * messages). It no longer exists on the server, so it can only be read: nothing can be sent about
 * it — no reply, reaction, forward, edit, pin or deletion.
 */
export default function isSavedDeletedMessage(message: unknown): message is SavedDeletedMessage {
  const value = message as Partial<Message.message>;
  return value?._ === 'message' && !!value.pFlags?.is_deleted;
}
