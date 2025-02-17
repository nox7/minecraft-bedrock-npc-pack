import { Vector3 } from "@minecraft/server"

/**
 * OctahedronIterator. Adopted to TS and Bedrock API from: PrismarineJS/prismarine-world
 * All credit to PrismarineJS
 */
export class OctahedronIterator implements Iterable<Vector3> {

    private start: Vector3;
    private MaxDistance: number;
    private X: number;
    private Y: number;
    private Z: number;
    private L: number;
    private R: number;

    public Apothem: number;

    public constructor (start: Vector3, maxDistance: number) {
      this.start = start;
      this.MaxDistance = maxDistance;
      this.Apothem = 1;
      this.X = -1;
      this.Y = -1;
      this.Z = -1;
      this.L = this.Apothem;
      this.R = this.L + 1;
    }
  
    public *[Symbol.iterator](): IterableIterator<Vector3> {
      while (this.Apothem <= this.MaxDistance){
        this.R -= 1
        if (this.R < 0) {
          this.L -= 1
          if (this.L < 0) {
            this.Z += 2
            if (this.Z > 1) {
              this.Y += 2
              if (this.Y > 1) {
                this.X += 2
                if (this.X > 1) {
                  this.Apothem += 1
                  this.X = -1
                }
                this.Y = -1
              }
              this.Z = -1
            }
            this.L = this.Apothem
          }
          this.R = this.L
        }
        const X = this.X * this.R
        const Y = this.Y * (this.Apothem - this.L)
        const Z = this.Z * (this.Apothem - (Math.abs(X) + Math.abs(Y)))
        yield {
          x: this.start.x + X,
          y: this.start.y + Y,
          z: this.start.z + Z,
        }
      }
    }
  }