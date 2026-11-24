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
  readonly hallOfFameHeading: Locator;
  readonly globalRankingsHeading: Locator;
  readonly rankingRows: Locator;
  readonly refreshButton: Locator;
  readonly homeButton: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main', { name: /Leaderboard/ });
    this.heading = this.main.getByRole('heading', { level: 1, name: 'LEADERBOARD' });
    this.hallOfFameHeading = this.main.getByRole('heading', { name: /Hall of Fame/ });
    this.globalRankingsHeading = this.main.getByRole('heading', { name: /Global Rankings/ });
    this.rankingRows = this.main.getByRole('list').last().getByRole('listitem');
    this.refreshButton = this.main.getByRole('button', { name: 'Refresh leaderboard' });
    this.homeButton = page
      .getByRole('navigation', { name: 'Bottom navigation' })
      .getByRole('button', {
        name: 'Home',
      });
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
}
