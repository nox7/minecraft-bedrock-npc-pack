import { Vector3Utils } from "@minecraft/math";
import { Block, Dimension, Vector3 } from "@minecraft/server";

export class RadiusFinder{
    /**
     * Fetches a block
     * @param center 
     * @param blockTypeId 
     * @param maxRadius 
     */
    public async GetBlockInRadius(center: Vector3, blockTypeId: string, radius: number, dimension: Dimension): Promise<Block | undefined>{
        const topRight: Vector3 = {x: center.x + radius, y: center.y + radius, z: center.z + radius};
        const bottomLeft: Vector3 = {x: center.x - radius, y: center.y - radius, z: center.z - radius};
        for (let y = bottomLeft.y; y <= topRight.y; y++){
            for (let x = bottomLeft.x; x <= topRight.x; x++){
                for (let z = bottomLeft.z; z <= topRight.z; z++){
                    const location: Vector3 = {x: x, y: y, z:z};
                    const isLocationInRadius: boolean = Vector3Utils.distance(location, center) <= radius;
                    if (isLocationInRadius){
                        let blockAtLocation: Block | undefined;
                        try{
                            blockAtLocation = dimension.getBlock(location);
                        }catch(e){}
                        if (blockAtLocation !== undefined){
                            if (blockAtLocation.typeId === blockTypeId){
                                return blockAtLocation;
                            }
                        }
                    }
                }
            }
        }
    }
}