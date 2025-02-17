import { Block, Dimension, Vector3 } from "@minecraft/server";

/**
 * Attempts to safely fetch a block from a Vector3 location and catches exceptions related
 * to unloaded chunks or world boundaries. In either case, will return undefined.
 * @param dimension 
 * @param location 
 * @returns 
 */
export function TryGetBlock(dimension: Dimension, location: Vector3): Block | undefined{
    let block: Block | undefined;
    try{
        block = dimension.getBlock(location);
    }catch(e){}

    return block;
}