import {describe, expect, it, vi} from 'vitest';
import '@helpers/peerIdPolyfill';
import {AppMessagesManager} from '@appManagers/appMessagesManager';
import createHistoryStorage from '@appManagers/utils/messages/createHistoryStorage';

// Expert's ghost mode (utils/expertGhost.ts): what reads, types or watches on the user's behalf
// stays on this device, what the user does on purpose still reaches the server
const USER_ID = 777 as UserId;
const PEER_ID = USER_ID.toPeerId();
const MAX_ID = 50;

function makeManager(ghost: boolean) {
  const manager = new AppMessagesManager() as any;
  const historyStorage = createHistoryStorage({type: 'history', peerId: PEER_ID});
  const invokeApi = vi.fn((method: string) => Promise.resolve({_: 'messages.affectedMessages', pts: 1, pts_count: 1, method}));
  const processLocalUpdate = vi.fn();

  Object.assign(manager, {
    log: Object.assign(() => {}, {error() {}, warn() {}, debug() {}}),
    appStateManager: {settings: {expert: {ghost: {enabled: ghost}}}},
    apiManager: {invokeApi},
    apiUpdatesManager: {processLocalUpdate},
    rootScope: {dispatchEvent() {}},
    appPeersManager: {
      peerId: 1 as PeerId,
      isChannel: () => false,
      isForum: () => false,
      isBotforum: () => false,
      isMonoforum: () => false,
      getInputPeerById: () => ({_: 'inputPeerUser'}),
      getOutputPeer: () => ({_: 'peerUser'}),
      getPeerString: () => ''
    },
    dialogsStorage: {getAnyDialog: (): any => undefined},
    getHistoryStorage: () => historyStorage,
    getReadMaxIdIfUnread: () => MAX_ID - 10,
    getMessageByPeer: (): any => undefined,
    isEphemeralMessageId: () => false,
    isEphemeralMessage: () => false,
    canSendToPeer: () => Promise.resolve(true),
    typings: {}
  });

  const calledMethods = () => invokeApi.mock.calls.map(([method]) => method);
  return {manager, historyStorage, processLocalUpdate, calledMethods};
}

describe('ghost mode', () => {
  it('reads a chat on this device only', async() => {
    const {manager, historyStorage, processLocalUpdate, calledMethods} = makeManager(true);
    await manager.readHistory({peerId: PEER_ID, maxId: MAX_ID});

    expect(calledMethods()).toEqual([]);
    expect(processLocalUpdate).toHaveBeenCalledWith(expect.objectContaining({_: 'updateReadHistoryInbox', max_id: MAX_ID}));
    // * still unread on the server, so a later read has to go there
    expect(historyStorage.triedToReadMaxId).toBeUndefined();
  });

  it('lets a read the user asked for reach the server', async() => {
    const {manager, calledMethods} = makeManager(true);
    await manager.readHistory({peerId: PEER_ID, maxId: MAX_ID, force: true, explicit: true});

    expect(calledMethods()).toEqual(['messages.readHistory']);
  });

  it('reads as before with ghost mode off', async() => {
    const {manager, calledMethods} = makeManager(false);
    await manager.readHistory({peerId: PEER_ID, maxId: MAX_ID});

    expect(calledMethods()).toEqual(['messages.readHistory']);
  });

  it('listens to a voice message without telling its sender', async() => {
    const {manager, processLocalUpdate, calledMethods} = makeManager(true);
    await manager.readMessages(PEER_ID, [MAX_ID]);

    expect(calledMethods()).toEqual([]);
    expect(processLocalUpdate).toHaveBeenCalledWith(expect.objectContaining({_: 'updateReadMessagesContents', messages: [MAX_ID]}));
  });

  it('sends no typing, but still stops a bot when asked', async() => {
    const {manager, calledMethods} = makeManager(true);
    expect(await manager.setTyping(PEER_ID, {_: 'sendMessageTypingAction'})).toBe(false);
    expect(await manager.setTyping(PEER_ID, {_: 'sendMessageChooseStickerAction'})).toBe(false);
    expect(await manager.setTyping(PEER_ID, {_: 'sendMessageEmojiInteractionSeen', emoticon: '❤'})).toBe(false);
    expect(calledMethods()).toEqual([]);

    await manager.setTyping(PEER_ID, {_: 'sendMessageStopDraftAction', random_id: '1'}, true);
    expect(calledMethods()).toEqual(['messages.setTyping']);
  });
});
