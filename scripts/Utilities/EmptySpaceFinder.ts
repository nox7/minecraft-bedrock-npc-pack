import { Dimension, Vector3 } from "@minecraft/server";
import { CuboidRegion } from "../PathfindingSuite/Region/CuboidRegion";

export class EmptySpaceFinder{

    private Region: CuboidRegion;
    private Dimension: Dimension;

    /**
     * What will be considered empty space
     */
    private EmptySpaceNames: string[] = ["minecraft:air"];

    public constructor(region: CuboidRegion, dimension: Dimension){
        this.Region = region;
        this.Dimension = dimension;
    }

    /**
     * Gets all empty blocks in the region
     * @param dimension
     * @returns 
     */
    public GetAllEmptyLocations(): Vector3[]{
        const emptyLocations = [];
        const corner1 = this.Region.Corner1;
        const corner2 = this.Region.Corner2;
        const top: Vector3 = {
            x: Math.min(corner1.x, corner2.x),
            y: Math.min(corner1.y, corner2.y),
            z: Math.min(corner1.z, corner2.z),
        };

        const bottom: Vector3 = {
            x: Math.max(corner1.x, corner2.x),
            y: Math.max(corner1.y, corner2.y),
            z: Math.max(corner1.z, corner2.z),
        };

        for (let x = top.x; x <= bottom.x; x++){
            for (let y = top.y; y <= bottom.y; y++){
                for (let z = top.z; z <= bottom.z; z++){
                    const block = this.Dimension.getBlock({x: x, y: y, z :z});
                    for (const blockName of this.EmptySpaceNames){
                        try{
                            if (block?.permutation.matches(blockName)){
                                emptyLocations.push(block.location);
                            }
                        }catch(e){}
                    }
                }
            }
        }

        return emptyLocations;;
    }
}