import { HomeContent } from './HomeContent';

/**
 * HOME PAGE — **David chose variant C on 2026-08-26** (M10.3, U-3).
 *
 * How it leads: **evidence first, invitation second**. Show that real L1s are running
 * with real owners, and only then invite the reader to launch their own. The other two
 * variants (A — led with a promise; B — put the naming field straight on the home
 * page) were removed along with the variant switcher; the history is in git if it
 * needs reading again.
 *
 * 🔴 **A KNOWN WEAKNESS OF THIS VARIANT, written down so nobody is surprised:** it
 * gets stronger as the directory fills up, and today the directory is **thin** (2 L1s,
 * both belonging to the system). That is why `ChainTable` has an empty state written
 * as an **invitation** ("you would be the first") rather than a blank box — choosing
 * variant C is a bet that the directory will fill, and the screen has to survive that
 * wait without looking broken.
 */
export default function HomePage() {
  return <HomeContent />;
}
