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

export interface DungeonMap {
  grid: TileType[][];
  width: number;
  height: number;
  rooms: RoomData[];
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
    const grid: TileType[][] = Array.from({ length: totalHeight }, () =>
      Array.from({ length: totalWidth }, () => TileType.Wall)
    );

    const rooms: RoomData[] = [];
    const numRooms = signature.length;
    
    // We want to fit all rooms in the grid. 
    // Let's arrange them in a snake-like pattern or just a long corridor.
    // For 32 chars, a 8x4 or similar layout of "room slots"
    const slotSize = 5; // 5x5 slot for each room
    const cols = Math.floor(totalWidth / slotSize);
    
    for (let i = 0; i < numRooms; i++) {
      const hexChar = signature[i];
      const hexVal = parseInt(hexChar, 16);
      
      const row = Math.floor(i / cols);
      const col = (row % 2 === 0) ? (i % cols) : (cols - 1 - (i % cols)); // Snake pattern
      
      const rx = col * slotSize + (hexVal % 2); // Jitter x
      const ry = row * slotSize + (Math.floor(hexVal / 4) % 2); // Jitter y
      
      // Variable room sizes based on hex value
      const rw = 2 + (hexVal % 3); // 2 to 4
      const rh = 2 + (Math.floor(hexVal / 3) % 3); // 2 to 4
      
      const roomType = this.mapHexToTile(hexVal);
      
      // Carve room
      for (let y = ry; y < ry + rh; y++) {
        if (!grid[y]) continue;
        for (let x = rx; x < rx + rw; x++) {
          if (x < totalWidth) {
            grid[y][x] = TileType.Room;
          }
        }
      }
      
      // Place specific object at a random-ish spot in the room
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

    return { grid, width: totalWidth, height: totalHeight, rooms };
  }

  private static carvePath(grid: TileType[][], x1: number, y1: number, x2: number, y2: number) {
    // Horizontal then vertical
    let cx = x1;
    let cy = y1;
    while (cx !== x2) {
      if (grid[cy] && grid[cy][cx] !== undefined) {
        grid[cy][cx] = TileType.Room;
      }
      cx += (x2 > x1 ? 1 : -1);
    }
    while (cy !== y2) {
      if (grid[cy] && grid[cy][cx] !== undefined) {
        grid[cy][cx] = TileType.Room;
      }
      cy += (y2 > y1 ? 1 : -1);
    }
    if (grid[y2] && grid[y2][x2] !== undefined) {
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
