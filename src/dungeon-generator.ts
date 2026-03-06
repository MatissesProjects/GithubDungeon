export enum TileType {
  Empty = 0,
  Room = 1,
  Enemy = 2,
  Trap = 3,
  Loot = 4,
  Wall = 5,
  Entrance = 6,
  Exit = 7,
}

export enum DungeonTheme {
  Classic = 'Classic',
  Underworld = 'Underworld',
  Crypt = 'Crypt',
}

export interface DungeonMetadata {
  hash: number;
  magnitude: number;
  difficulty: number;
  theme: DungeonTheme;
}

export interface DungeonMap {
  grid: TileType[][];
  width: number;
  height: number;
  rooms: RoomData[];
  metadata: DungeonMetadata;
}

export interface RoomData {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: TileType;
}

export class DungeonGenerator {
  /**
   * Generates a linear dungeon with one room per signature character.
   */
  static generateFromSignature(signature: string, totalWidth: number, totalHeight: number): DungeonMap {
    // 1. Calculate Global Deterministic Seeding (Identity)
    let hash = 0;
    for (let i = 0; i < signature.length; i++) {
      hash = ((hash << 5) - hash) + signature.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    // 2. Derived Statistical Metadata (Power Level)
    let magnitude = 0;
    for (let i = 0; i < signature.length; i++) {
      magnitude += parseInt(signature[i], 16) || 0;
    }

    const theme = this.pickTheme(hash);
    const difficulty = Math.floor(magnitude / 10);
    const metadata: DungeonMetadata = { hash, magnitude, difficulty, theme };

    const grid: TileType[][] = Array.from({ length: totalHeight }, () =>
      Array.from({ length: totalWidth }, () => TileType.Wall)
    );

    const rooms: RoomData[] = [];
    const numRooms = signature.length;
    
    // Use the signature length as the "DNA" for layout
    const slotSize = 5;
    const cols = Math.floor(totalWidth / slotSize);
    
    for (let i = 0; i < numRooms; i++) {
      // 3. Sequential Event Triggering (The "DNA Strands")
      const hexChar = signature[i];
      const hexVal = parseInt(hexChar, 16);
      
      const row = Math.floor(i / cols);
      const col = (row % 2 === 0) ? (i % cols) : (cols - 1 - (i % cols)); // Snake pattern
      
      const rx = col * slotSize + (hexVal % 2) + 1; // Jitter x based on DNA, +1 for border
      const ry = row * slotSize + (Math.floor(hexVal / 4) % 2) + 1; // Jitter y based on DNA, +1 for border
      
      // Variable room sizes based on hex value (DNA)
      const rw = 2 + (hexVal % 3); // 2 to 4
      const rh = 2 + (Math.floor(hexVal / 3) % 3); // 2 to 4
      
      const roomType = this.mapHexToTile(hexVal);
      
      // Carve room
      for (let y = ry; y < ry + rh; y++) {
        if (!grid[y] || y >= totalHeight - 1) continue;
        for (let x = rx; x < rx + rw; x++) {
          if (x < totalWidth - 1) {
            grid[y][x] = TileType.Room;
          }
        }
      }
      
      // Place specific object based on the DNA strand
      const ox = rx + (hexVal % rw);
      const oy = ry + (Math.floor(hexVal / 4) % rh);
      if (grid[oy] && ox < totalWidth) {
        grid[oy][ox] = roomType;
      }
      
      rooms.push({
        id: i,
        x: rx,
        y: ry,
        width: rw,
        height: rh,
        type: roomType
      });
      
      // Connect to previous room
      if (i > 0) {
        const prev = rooms[i - 1];
        this.carvePath(grid, prev.x + 1, prev.y + 1, rx + 1, ry + 1);
      }
    }

    return { grid, width: totalWidth, height: totalHeight, rooms, metadata };
  }

  private static pickTheme(hash: number): DungeonTheme {
    const absHash = Math.abs(hash);
    if (absHash % 3 === 0) return DungeonTheme.Crypt;
    if (absHash % 3 === 1) return DungeonTheme.Underworld;
    return DungeonTheme.Classic;
  }

  private static carvePath(grid: TileType[][], x1: number, y1: number, x2: number, y2: number) {
    const height = grid.length;
    const width = grid[0]?.length || 0;

    // Horizontal then vertical
    let cx = x1;
    let cy = y1;
    while (cx !== x2) {
      if (grid[cy] && cx > 0 && cx < width - 1) {
        grid[cy][cx] = TileType.Room;
      }
      cx += (x2 > x1 ? 1 : -1);
    }
    while (cy !== y2) {
      if (grid[cy] && cy > 0 && cy < height - 1 && cx < width - 1) {
        grid[cy][cx] = TileType.Room;
      }
      cy += (y2 > y1 ? 1 : -1);
    }
    if (grid[y2] && y2 > 0 && y2 < height - 1 && x2 > 0 && x2 < width - 1) {
      grid[y2][x2] = TileType.Room;
    }
  }

  private static mapHexToTile(val: number): TileType {
    if (val === 0) return TileType.Trap;
    if (val >= 1 && val <= 7) return TileType.Room; // Empty room
    if (val >= 8 && val <= 11) return TileType.Enemy;
    if (val >= 12 && val <= 14) return TileType.Loot;
    if (val === 15) return TileType.Exit; 
    return TileType.Room;
  }
}
