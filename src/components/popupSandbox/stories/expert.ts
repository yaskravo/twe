/*
 * Expert's own popups: what a release brought, and the licence. They read no manager: the release
 * notes are the static changelogs/<lang>_<version>.md files the build writes.
 */

import {defineStories} from '../registry';

defineStories('Expert', [
  {
    id: 'expert/whatsNew',
    title: 'What\'s New in Expert',
    open: async() => {
      const {showExpertChangelog} = await import('@components/popups/expertAbout');
      await showExpertChangelog();
    }
  },
  {
    id: 'expert/license',
    title: 'Expert licence',
    open: async() => {
      const {showExpertLicense} = await import('@components/popups/expertAbout');
      showExpertLicense();
    }
  }
]);
