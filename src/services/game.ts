export interface GameSummary {
  season: string
  territoryCount: number
  resourceCount: number
}

export async function getGameSummary(): Promise<GameSummary> {
  // TODO: 接入后端后替换为 request<GameSummary>('/game/summary')。
  return {
    season: '春·建安元年',
    territoryCount: 3,
    resourceCount: 1280,
  }
}
