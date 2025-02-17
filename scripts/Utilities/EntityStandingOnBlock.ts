import { Vector3Utils } from "@minecraft/math";
import { Block, Player, Vector3 } from "@minecraft/server";

export class EntityStandingOnBlock{

    /**
     * Because players can sometimes have the majority of their hitbox off a block and still be colliding
     * with the edge of a block, this code will detect which block is being used
     * to still keep the player standing on it - even if they are crouching over air.
     * @param player 
     * @returns 
     */
    public static GetClosestBlockPlayerIsStandingOn(player: Player): Block | undefined{
        const dimension = player.dimension;
        const playerLocation: Vector3 = player.location;
        
        // The player can only possibly be on non-air blocks when not flying
        // Additionally, only blocks at the same Y axis as the player count
        // Finally, the block whose center is closest to the player is the right block
        const considerations: Vector3[] = [
            {x: playerLocation.x, y: playerLocation.y - 1, z: playerLocation.z},
            {x: playerLocation.x, y: playerLocation.y - 1, z: playerLocation.z - 1},
            {x: playerLocation.x, y: playerLocation.y - 1, z: playerLocation.z + 1},
            {x: playerLocation.x + 1, y: playerLocation.y - 1, z: playerLocation.z},
            {x: playerLocation.x + 1, y: playerLocation.y - 1, z: playerLocation.z + 1},
            {x: playerLocation.x + 1, y: playerLocation.y - 1, z: playerLocation.z - 1},
            {x: playerLocation.x - 1, y: playerLocation.y - 1, z: playerLocation.z},
            {x: playerLocation.x - 1, y: playerLocation.y - 1, z: playerLocation.z + 1},
            {x: playerLocation.x - 1, y: playerLocation.y - 1, z: playerLocation.z - 1}
        ];

        let closestBlock: Block | undefined;
        let closestLocation: Vector3 | undefined;
        let closestDistance: number | undefined;
        for (const location of considerations){
            try{
                const block = dimension.getBlock(location);
                console.warn(block?.typeId);
                if (block !== undefined && block.isValid && !block.isAir){
                    if (closestBlock === undefined){
                        closestBlock = block;
                        closestLocation = location;
                        closestDistance = Vector3Utils.distance(player.location, block.center());
                    }else{
                        const distance = Vector3Utils.distance(player.location, block.center());
                        if (distance < <number>closestDistance){
                            closestDistance = distance;
                            closestBlock = block;
                            closestLocation = location;
                        }
                    }
                }
            }catch(e){}
        }

        return closestBlock;
    }
}