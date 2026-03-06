import { DungeonGenerator, TileType } from './dungeon-generator';

describe('DungeonGenerator', () => {
  const signature = 'a1b2c3d4e5f60789';
  const width = 50;
  const height = 50;

  test('should generate a map with correct dimensions', () => {
    const map = DungeonGenerator.generateFromSignature(signature, width, height);
    expect(map.width).toBe(width);
    expect(map.height).toBe(height);
    expect(map.grid.length).toBe(height);
    expect(map.grid[0].length).toBe(width);
  });

  test('should have walls on the borders', () => {
    const map = DungeonGenerator.generateFromSignature(signature, width, height);
    // Top and bottom borders
    for (let x = 0; x < width; x++) {
      expect(map.grid[0][x]).toBe(TileType.Wall);
      expect(map.grid[height - 1][x]).toBe(TileType.Wall);
    }
    // Left and right borders
    for (let y = 0; y < height; y++) {
      expect(map.grid[y][0]).toBe(TileType.Wall);
      expect(map.grid[y][width - 1]).toBe(TileType.Wall);
    }
  });

  test('should be deterministic for the same signature', () => {
    const map1 = DungeonGenerator.generateFromSignature(signature, width, height);
    const map2 = DungeonGenerator.generateFromSignature(signature, width, height);
    expect(map1.grid).toEqual(map2.grid);
  });
});
