import {describe, expect, it} from 'vitest';
import mergeSavedDeletedMids from '@appManagers/utils/messages/mergeSavedDeletedMids';

// * the server leaves a deleted message out of every page of history; Expert puts the ones it kept back
// * into the page they belong to, so after a reload they are where they were
describe('mergeSavedDeletedMids', () => {
  const merge = (pageMids: number[], savedMids: number[], options: {
    offsetId?: number,
    isTopEnd?: boolean,
    isBottomEnd?: boolean
  } = {}) => {
    const added = mergeSavedDeletedMids({
      pageMids,
      savedMids,
      offsetId: options.offsetId,
      isTopEnd: !!options.isTopEnd,
      isBottomEnd: !!options.isBottomEnd
    });
    return {pageMids, added};
  };

  it('puts a message deleted between two of the page back between them', () => {
    expect(merge([30, 20, 10], [25, 15])).toEqual({pageMids: [30, 25, 20, 15, 10], added: 2});
  });

  it('leaves out what lies past the page when the page is not the end there', () => {
    expect(merge([30, 20, 10], [40, 5])).toEqual({pageMids: [30, 20, 10], added: 0});
  });

  it('takes the newest ones when the page is the bottom of the history', () => {
    expect(merge([30, 20], [40, 35, 5], {isBottomEnd: true})).toEqual({pageMids: [40, 35, 30, 20], added: 2});
  });

  it('takes the oldest ones when the page is the top of the history', () => {
    expect(merge([30, 20], [40, 5], {isTopEnd: true})).toEqual({pageMids: [30, 20, 5], added: 1});
  });

  it('covers the gap up to the message the page was loaded from', () => {
    // * the previous page ended at 90; the next one, loaded from it, starts at 88 — 89 was deleted
    expect(merge([88, 80], [89], {offsetId: 90})).toEqual({pageMids: [89, 88, 80], added: 1});
  });

  it('puts every saved message into an empty history', () => {
    expect(merge([], [7, 3], {isTopEnd: true, isBottomEnd: true})).toEqual({pageMids: [7, 3], added: 2});
  });

  it('puts nothing into an empty page that is not the whole history', () => {
    expect(merge([], [7, 3], {isBottomEnd: true})).toEqual({pageMids: [], added: 0});
  });

  it('does not add a message the page already has', () => {
    expect(merge([30, 20], [30, 25])).toEqual({pageMids: [30, 25, 20], added: 1});
  });
});
