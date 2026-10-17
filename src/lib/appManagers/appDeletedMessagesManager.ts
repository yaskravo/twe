import type {State} from '@config/state';
import {AppManager} from '@appManagers/manager';
import {AccountDatabase, getDatabaseState} from '@config/databases/state';
import AppStorage from '@lib/storage';
import isSavedDeletedMessage, {SavedDeletedMessage} from '@appManagers/utils/messages/isSavedDeletedMessage';
import getPeerIdsFromMessage from '@appManagers/utils/messages/getPeerIdsFromMessage';

type StoredPeer = Record<number, SavedDeletedMessage>;

/**
 * Expert's copy of the messages other people deleted (Settings → Expert → Save deleted messages).
 *
 * `appMessagesManager` decides what to keep — a deletion that came from the server for a message
 * this client has — and leaves the message where it was, flagged `is_deleted`. This manager keeps
 * those messages on the device, one record per chat, and hands them back the first time the
 * chat's history is loaded after a reload, so they take their place among the server's messages
 * again. Nothing of it leaves the device.
 */
export default class AppDeletedMessagesManager extends AppManager {
  private storage: AppStorage<Record<string, StoredPeer>, AccountDatabase>;
  private state: State;
  private peers: Map<PeerId, Map<number, SavedDeletedMessage>>;
  private loading: Map<PeerId, Promise<void>>;

  protected after() {
    this.clear(true);
    this.storage = new AppStorage(getDatabaseState(this.getAccountNumber()), 'deletedMessages');

    return this.appStateManager.getState().then((state) => {
      this.state = state;
    });
  }

  public clear = (init?: boolean) => {
    this.peers = new Map();
    this.loading = new Map();
  };

  public isEnabled() {
    return !!this.state?.settings?.expert?.saveDeletedMessages;
  }

  /**
   * Makes the chat's saved deleted messages known to `appMessagesManager`. Resolves at once once
   * they are, so the history can always wait for it.
   */
  public loadPeer(peerId: PeerId): Promise<void> {
    if(this.peers.has(peerId)) {
      return Promise.resolve();
    }

    let promise = this.loading.get(peerId);
    if(promise) {
      return promise;
    }

    promise = this.storage.get(this.getKey(peerId)).then((stored) => {
      const peer = new Map<number, SavedDeletedMessage>();
      try {
        const messages = stored ? Object.values(stored) : [];
        if(messages.length) {
          this.appMessagesManager.saveMessages(messages);
          for(const message of messages) {
            if(!isSavedDeletedMessage(message)) {
              continue;
            }

            // * saving it again read the dialog's read mark, which the server no longer counts it in
            delete message.pFlags.unread;
            peer.set(message.mid, message);
          }
        }
      } catch(err) {
        this.log.error('can\'t restore deleted messages', peerId, err);
      }

      this.peers.set(peerId, peer);
      this.requestPeers(peerId);
    }).finally(() => {
      this.loading.delete(peerId);
    });

    this.loading.set(peerId, promise);
    return promise;
  }

  public getSavedMids(peerId: PeerId): Iterable<number> {
    return this.peers.get(peerId)?.keys() ?? [];
  }

  public async remember(peerId: PeerId, messages: SavedDeletedMessage[]) {
    // * the chat's earlier ones have to be read first, or this record would replace them
    await this.loadPeer(peerId);
    const peer = this.peers.get(peerId);
    for(const message of messages) {
      peer.set(message.mid, message);
    }

    this.persist(peerId);
  }

  /**
   * Drops messages that are gone for good — deleted here, or cleared from Settings.
   */
  public forget(peerId: PeerId, mids: Iterable<number>) {
    const peer = this.peers.get(peerId);
    if(!peer) {
      return;
    }

    let changed = false;
    for(const mid of mids) {
      changed = peer.delete(mid) || changed;
    }

    if(changed) {
      this.persist(peerId);
    }
  }

  public async getSavedCount() {
    const stored = await this.storage.getAll() as StoredPeer[];
    let count = 0;
    for(const peer of stored) {
      if(peer) {
        count += Object.keys(peer).length;
      }
    }

    return count;
  }

  /**
   * Deletes every saved copy: the ones on screen leave their chats the way a deletion does.
   */
  public async clearSaved() {
    for(const [peerId, peer] of this.peers) {
      if(peer.size) {
        this.appMessagesManager.dropSavedDeletedMessages(peerId, [...peer.keys()]);
      }

      this.peersStorage.requestPeersForKey([], `deletedMessages_${peerId}`);
    }

    this.peers.clear();
    await this.storage.clear();
  }

  private getKey(peerId: PeerId) {
    return '' + peerId;
  }

  private persist(peerId: PeerId) {
    const peer = this.peers.get(peerId);
    const key = this.getKey(peerId);
    if(peer.size) {
      this.storage.set({[key]: Object.fromEntries(peer)});
    } else {
      this.storage.delete(key);
    }

    this.requestPeers(peerId);
  }

  // * the authors and everyone the messages mention have to outlive a reload with them
  private requestPeers(peerId: PeerId) {
    const peerIds = new Set<PeerId>();
    for(const message of this.peers.get(peerId).values()) {
      getPeerIdsFromMessage(message).forEach((peerId) => peerIds.add(peerId));
    }

    this.peersStorage.requestPeersForKey(peerIds, `deletedMessages_${peerId}`);
  }
}
