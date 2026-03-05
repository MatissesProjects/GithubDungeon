export enum TileType {
  Empty = 0,
  Room = 1,
  Enemy = 2,
  Trap = 3,
  Loot = 4,
  Wall = 5,
}

export interface DungeonMap {
  grid: TileType[][];
  width: number;
  height: number;
}

export class DungeonGenerator {
  /**
   * Generates a dungeon map from a hex signature.
   * Each character in the hex signature (0-F) determines a tile's content.
   * @param signature The hex signature (e.g., commit hash or daily summary)
   * @param width The width of the dungeon grid
   * @param height The height of the dungeon grid
   */
  static generateFromSignature(signature: string, width: number, height: number): DungeonMap {
    const grid: TileType[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => TileType.Wall)
    );

    // Use the signature to fill the grid
    // For simplicity, we loop through the grid and map hex chars to tiles
    for (let y = 1; y < height - 1; y++) {
      const row = grid[y];
      if (!row) continue;
      for (let x = 1; x < width - 1; x++) {
        const sigIndex = (y * width + x) % signature.length;
        const hexChar = signature[sigIndex];
        if (hexChar === undefined) continue;
        const hexVal = parseInt(hexChar, 16);

        row[x] = this.mapHexToTile(hexVal);
      }
    }

    return { grid, width, height };
  }

  private static mapHexToTile(val: number): TileType {
    if (val === 0) return TileType.Trap;
    if (val >= 1 && val <= 8) return TileType.Empty; // Mostly empty space (rooms)
    if (val >= 9 && val <= 11) return TileType.Enemy;
    if (val >= 12 && val <= 14) return TileType.Loot;
    if (val === 15) return TileType.Room; // Special landmark
    return TileType.Empty;
  }
}
