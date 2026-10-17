/**
 * Puts the saved deleted messages that belong to a page of history into that page, so they take
 * their place in it again after a reload — the server leaves them out of every page it returns.
 *
 * A page covers the ids between its first and last message and the message it was loaded from
 * (`offsetId`), so a message deleted right between two pages still lands in one of them. Past the
 * page's edge it only reaches when the page is the history's end on that side.
 *
 * `pageMids` is ordered newest first and is changed in place; returns how many ids were added.
 */
export default function mergeSavedDeletedMids(options: {
  pageMids: number[],
  savedMids: Iterable<number>,
  offsetId?: number,
  isTopEnd: boolean,
  isBottomEnd: boolean
}) {
  const {pageMids, savedMids, offsetId, isTopEnd, isBottomEnd} = options;
  let upper = pageMids[0], lower = pageMids[pageMids.length - 1];
  if(offsetId) {
    upper = upper === undefined ? offsetId : Math.max(upper, offsetId);
    lower = lower === undefined ? offsetId : Math.min(lower, offsetId);
  }

  // * an empty page with nothing to anchor it says where nothing is only when it is the whole history
  if(upper === undefined && !(isTopEnd && isBottomEnd)) {
    return 0;
  }

  const present = new Set(pageMids);
  const added: number[] = [];
  for(const mid of savedMids) {
    if(
      !present.has(mid) &&
      (isBottomEnd || mid <= upper) &&
      (isTopEnd || mid >= lower)
    ) {
      present.add(mid);
      added.push(mid);
    }
  }

  if(added.length) {
    pageMids.push(...added);
    pageMids.sort((a, b) => b - a);
  }

  return added.length;
}
