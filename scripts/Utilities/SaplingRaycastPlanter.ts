import { Block, BlockRaycastHit, BlockRaycastOptions, Dimension, Vector3 } from "@minecraft/server";

/**
 * A utility class that has functions that take Vector3 locations and raycast down from them to try and find plantable blocks (such as dirt or grass). Additionally,
 * the functions check if the block above the plantable block is checked if it is air.
 */
export class SaplingRaycastPlanter{
    /**
     * Takes a list of Vector3 locations and raycasts down from all of them to try and see if there are plantable locations at or beneath the locations provided.
     * Returns the block _above_ the plantable location if it is air. If it is not air, then no block is returned for that raycast. You should check the returned 
     * array length matches the input array length to verify if all locations are plantable.
     * 
     * Raycasts are a max distance of 5
     */
    public GetPlantableAirBlocksFromLocations(dimension: Dimension, locations: Vector3[]): Block[]{
        const plantableAirBlocks: Block[] = [];
        const raycastOptions: BlockRaycastOptions = {
            includeLiquidBlocks: false,
            includePassableBlocks: false,
            maxDistance: 5
        };

        for (const location of locations){
            const raycastHit: BlockRaycastHit | undefined = dimension.getBlockFromRay(location, {x: 0, y: -1, z:0}, raycastOptions);
            if (raycastHit !== undefined){
                const raycastHitBlock: Block = raycastHit.block
                if (raycastHitBlock.isValid){
                    const airBlock: Block | null = this.GetPlantableBlockFromRaycastHitBlock(raycastHitBlock);
                    if (airBlock !== null){
                        plantableAirBlocks.push(airBlock);
                    }
                }
            }
        }

        return plantableAirBlocks;
    }

    /**
     * Returns the minecraft:air block above the raycastHitBlock block if
     * 1. The raycastHitBlock is a grass or dirt block
     * 2. If there is minecraft:air above it
     * @param raycastHitBlock
     */
    private GetPlantableBlockFromRaycastHitBlock(raycastHitBlock: Block): Block | null{
        if (raycastHitBlock.typeId === "minecraft:grass" || raycastHitBlock.typeId === "minecraft:dirt"){
            let blockAbove: Block | undefined;
            try{
                blockAbove = raycastHitBlock.above(1);
            }catch(e){}

            if (blockAbove !== undefined){
                if (blockAbove.typeId === "minecraft:air"){
                    return blockAbove;
                }
            }
        }

        return null;
    }
}