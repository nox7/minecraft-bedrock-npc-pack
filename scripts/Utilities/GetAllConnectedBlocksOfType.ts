import { Block } from "@minecraft/server";
import { CuboidRegion } from "../PathfindingSuite/Region/CuboidRegion";

/**
 * Gets a list of all Blocks that are connected to fromBlock and any blocks of the same type recursively.
 * @param fromBlock
 */

// TODO resolve duplicate returns problem
export function GetAllConnectedBlocksOfType(fromBlock: Block, blockIdentifiers: string[], maxBlocksToReturn = 30): Block[]{
    const blocks: Block[] = [];
    const blocksToIterate: Block[] = [fromBlock];
    const locationHashOfStartBlock: string = `${fromBlock.location.x},${fromBlock.location.y},${fromBlock.location.z},`;
    const iteratedPositions: {[key: string]: boolean} = {
        [locationHashOfStartBlock]: true
    };

    // Check start block does or does not match desired identifiers
    for (const blockIdentifier of blockIdentifiers){
        // Is the current `next` block a match for the blockIdentifiers?
        if (fromBlock.permutation.matches(blockIdentifier)){
            blocks.push(fromBlock);
            break;
        }
    }

    while (blocksToIterate.length > 0){
        const next: Block | undefined = blocksToIterate.pop();
        if (next !== undefined){

            // Safe-guard against massive loops
            // Or protect in the case a player's trees touch their house
            // so this doesn't magically delete too many of their blocks if that case happens
            if (blocks.length >= maxBlocksToReturn){
                break;
            }

            const cuboidRegionAroundBlock: CuboidRegion = CuboidRegion.FromCenterLocation(next.location, 1, false);
            for (const location of cuboidRegionAroundBlock.GetAllLocationsInRegion()){
                const locationHashOfBlock: string = `${location.x},${location.y},${location.z},`;
                if (!(locationHashOfBlock in iteratedPositions)){
                    iteratedPositions[locationHashOfBlock] = true;
                    try{
                        const block: Block | undefined = fromBlock.dimension.getBlock(location);
                        if (block !== undefined){
                            // Is this block one of the matches we need?
                            for (const blockIdentifier of blockIdentifiers){
                                if (block.permutation.matches(blockIdentifier)){
                                    blocks.push(block);
                                    blocksToIterate.push(block);
                                    break;
                                }
                            }
                        }
                    }catch(e){}
                }
            }
        }
    }

    return blocks;
}