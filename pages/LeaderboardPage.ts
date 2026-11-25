import { Page, Locator } from '@playwright/test';

export interface RankingEntry {
  rank: string;
  name: string;
  xp: number;
}

/** "Leaderboard – Top Food Smashers" screen (reachable without login). */
export class LeaderboardPage {
  readonly main: Locator;
  readonly heading: Locator;
  readonly loggedInLabel: Locator;
  readonly xpPoints: Locator;
  readonly logoutButton: Locator;
  readonly banner: Locator;
  readonly currentRankingCard: Locator;
  readonly hallOfFameEntries: Locator;
  readonly hallOfFameHeading: Locator;
  readonly globalRankingsHeading: Locator;
  readonly rankingRows: Locator;
  readonly refreshButton: Locator;
  readonly homeButton: Locator;
  readonly bottomNav: Locator;
  /** Visible labels of the bottom navigation items (HOME, BOARD, FEAST…). */
  readonly bottomNavLabels: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main', { name: /Leaderboard/ });
    this.heading = this.main.getByRole('heading', { level: 1, name: 'LEADERBOARD' });
    // Header elements shown only when a user is logged in.
    this.loggedInLabel = this.main.getByText(/^Logged in:/);
    this.xpPoints = this.main.getByLabel('Your XP points');
    this.logoutButton = this.main.getByRole('button', { name: 'Logout' });
    this.banner = this.main.getByText(/Top Food Smashers ·/);
    // The text sits inside the card body that also holds the XP value and badge.
    this.currentRankingCard = this.main
      .getByText('YOUR CURRENT RANKING', { exact: true })
      .locator('..');
    this.hallOfFameEntries = this.main.locator('#hallOfFame > div');
    this.hallOfFameHeading = this.main.getByRole('heading', { name: /Hall of Fame/ });
    this.globalRankingsHeading = this.main.getByRole('heading', { name: /Global Rankings/ });
    this.rankingRows = this.main.getByRole('list').last().getByRole('listitem');
    this.refreshButton = this.main.getByRole('button', { name: 'Refresh leaderboard' });
    this.bottomNav = page.getByRole('navigation', { name: 'Bottom navigation' });
    this.homeButton = this.bottomNav.getByRole('button', {
      name: 'Home',
    });
    // Icon ligatures ("home", "leaderboard") are lowercase, so only the labels match.
    // FEAST stays in the DOM but is hidden for users who already booked, so keep only visible ones.
    this.bottomNavLabels = this.bottomNav
      .getByText(/^(HOME|BOARD|FEAST)$/)
      .filter({ visible: true });
  }

  /** Reads every Global Rankings row as { rank, name, xp }. */
  async getRankings(): Promise<RankingEntry[]> {
    const rows = await this.rankingRows.allInnerTexts();
    return rows.map((text) => {
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const xpMatch = text.match(/(\d+)\s*XP/);
      if (!xpMatch) throw new Error(`Could not read XP from ranking row: "${text}"`);
      return { rank: lines[0], name: lines[1], xp: Number(xpMatch[1]) };
    });
  }

  /** Reads every Hall of Fame card as { month, winner, xp }, in display order. */
  async getHallOfFame(): Promise<{ month: string; winner: string; xp: number }[]> {
    const cards = await this.hallOfFameEntries.allInnerTexts();
    return cards.map((text) => {
      const [month, winner, xpText] = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const xpMatch = (xpText ?? '').match(/(\d+)\s*XP/i);
      if (!xpMatch) throw new Error(`Could not read XP from Hall of Fame card: "${text}"`);
      return { month, winner, xp: Number(xpMatch[1]) };
    });
  }
}
