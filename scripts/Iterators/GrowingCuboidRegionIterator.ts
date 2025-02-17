import { Vector3 } from "@minecraft/server"
import { CuboidRegion } from "../PathfindingSuite/Region/CuboidRegion";

/**
 * Iterator that provides Vector3 locations in a growing cuboid fashion.
 */
export class GrowingCuboidIterator implements Iterable<Vector3[]> {

    private CenterLocation: Vector3;
    private MaxCuboidRaidus: number;
    private CurrentRadius: number = 1;

    /**
     * Maximum number of Vector3s to provide each time the generator yields.
     */
    public ChunkSize: number = 10;

    public constructor (
      centerLocation: Vector3,
      maxCuboidRadius: number
      ) {
      this.CenterLocation = centerLocation;
      this.MaxCuboidRaidus = maxCuboidRadius;
    }
  
    /**
     * Iterates the cuboid in chunks
     */
    public *[Symbol.iterator](): IterableIterator<Vector3[]> {
      let currentChunk: Vector3[] = [];
      while (this.CurrentRadius <= this.MaxCuboidRaidus){
        for (const position of CuboidRegion.GetPositionsAlongOuterEdgeOfCube(this.CenterLocation, this.CurrentRadius)){
          currentChunk.push(position);
          if (currentChunk.length === this.ChunkSize){
            yield currentChunk;
            currentChunk = [];
          }
        }

        // If the currentChunk has more positions and we just finished the last iteration, yield the remaining positions
        if (currentChunk.length > 0 && this.CurrentRadius > this.MaxCuboidRaidus){
          yield currentChunk;
        }

        this.CurrentRadius++;
      }
    }
  }