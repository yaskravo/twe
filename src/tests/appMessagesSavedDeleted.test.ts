import {describe, expect, it, vi} from 'vitest';
import type {Message, MessagesMessages} from '@layer';
import '@helpers/peerIdPolyfill';

vi.mock('@lib/mainWorker/mainMessagePort', () => ({
  default: {
    getInstance: () => ({invokeVoid: () => {}})
  }
}));

import {AppMessagesManager} from '@appManagers/appMessagesManager';

// * Expert keeps a message someone else deleted: it stays where it was, flagged, and is put back into
// * the history after a reload. A deletion this client made itself still deletes.
const PEER_ID = 1000001 as PeerId;

function textMessage(mid: number, pFlags: Message.message['pFlags'] = {}): Message.message {
  return {
    _: 'message',
    pFlags,
    id: mid,
    mid,
    date: mid,
    message: 'text ' + mid,
    peer_id: {_: 'peerUser', user_id: PEER_ID.toUserId()},
    peerId: PEER_ID
  } as Message.message;
}

function createManager(options: {enabled?: boolean, saved?: number[]} = {}) {
  const manager = new AppMessagesManager() as any;
  const log = Object.assign(() => {}, {error: () => {}, warn: () => {}, debug: () => {}});
  const messages = new Map<number, Message.message>();
  const storage = {key: `${PEER_ID}_history`, type: 'history'};
  Object.assign(manager, {
    searchesStorage: {},
    historiesStorage: {},
    references: {},
    log,
    appPeersManager: {getPeerMigratedTo: (): PeerId => undefined, isForum: () => false, isBotforum: () => false, isBroadcast: () => false},
    getMigration: (): undefined => undefined,
    appDeletedMessagesManager: {
      isEnabled: () => options.enabled ?? true,
      remember: vi.fn(),
      getSavedMids: () => options.saved ?? []
    },
    rootScope: {dispatchEvent: vi.fn()},
    getHistoryMessagesStorage: () => storage,
    getMessageFromStorage: (_: unknown, mid: number) => messages.get(mid),
    setMessageToStorage: vi.fn(),
    applyDeletedMessageCounts: vi.fn(),
    resetPinnedMessagesCache: vi.fn(),
    modifyCachedMentions: vi.fn(),
    getThreadKey: () => ''
  });

  return {manager, messages};
}

describe('a message someone else deleted', () => {
  it('stays, flagged as deleted, read and unpinned, and is kept on the device', () => {
    const {manager, messages} = createManager();
    const message = textMessage(10, {unread: true, pinned: true});
    messages.set(10, message);

    expect(manager.keepDeletedMessages(PEER_ID, [10])).toEqual([]);
    expect(message.pFlags.is_deleted).toBe(true);
    expect(message.deletedDate).toBeGreaterThan(0);
    expect(message.pFlags.unread).toBeUndefined();
    expect(message.pFlags.pinned).toBeUndefined();
    expect(manager.appDeletedMessagesManager.remember).toHaveBeenCalledWith(PEER_ID, [message]);
    expect(manager.applyDeletedMessageCounts.mock.calls[0][1].unread).toBe(1);
    expect(manager.rootScope.dispatchEvent).toHaveBeenCalledWith('message_edit', expect.objectContaining({mid: 10, message}));
  });

  it('is deleted as before when saving is off', () => {
    const {manager, messages} = createManager({enabled: false});
    messages.set(10, textMessage(10));

    expect(manager.keepDeletedMessages(PEER_ID, [10])).toEqual([10]);
    expect(messages.get(10).pFlags.is_deleted).toBeUndefined();
  });

  it('is deleted when the client does not have it, or it was never sent', () => {
    const {manager, messages} = createManager();
    messages.set(11, textMessage(11, {is_outgoing: true}));
    messages.set(12, {...textMessage(12), _: 'messageService'} as any);

    expect(manager.keepDeletedMessages(PEER_ID, [10, 11, 12])).toEqual([10, 11, 12]);
    expect(manager.appDeletedMessagesManager.remember).not.toHaveBeenCalled();
  });

  it('is not kept twice', () => {
    const {manager, messages} = createManager();
    messages.set(10, textMessage(10, {is_deleted: true}));

    expect(manager.keepDeletedMessages(PEER_ID, [10])).toEqual([]);
    expect(manager.appDeletedMessagesManager.remember).not.toHaveBeenCalled();
  });

  it('is kept only when the deletion came from the server', () => {
    const {manager} = createManager();
    manager.onUpdateDeleteMessages = vi.fn();
    const update = {_: 'updateDeleteMessages', messages: [10], pts: 1, pts_count: 1};

    manager.apiUpdatesManager = {isLocalUpdate: () => false};
    manager.onUpdateDeleteMessagesEvent(update);
    manager.apiUpdatesManager = {isLocalUpdate: () => true};
    manager.onUpdateDeleteMessagesEvent(update);

    expect(manager.onUpdateDeleteMessages.mock.calls.map((call: any[]) => call[1].keepDeleted)).toEqual([true, false]);
  });

  it('takes its place in the history again after a reload', () => {
    const {manager} = createManager({saved: [26203, 26100]});
    const historyStorage = manager.getHistoryStorage(PEER_ID);
    manager.mergeHistoryResult({
      peerId: PEER_ID,
      offsetId: 0,
      addOffset: 0,
      limit: 3,
      slicedArray: historyStorage.history,
      historyStorage,
      historyResult: {
        _: 'messages.messagesSlice',
        pFlags: {},
        count: 10,
        messages: [26205, 26204, 26202].map((mid) => textMessage(mid)),
        chats: [],
        users: []
      } as MessagesMessages.messagesMessagesSlice
    });

    // * 26100 is older than the page, which is not the top of the history: its own page brings it
    expect(Array.from(historyStorage.history.first)).toEqual([26205, 26204, 26203, 26202]);
  });
});
