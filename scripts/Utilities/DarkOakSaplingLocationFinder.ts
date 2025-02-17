import { Vector3Utils } from "@minecraft/math";
import { Block, Dimension, Vector3 } from "@minecraft/server";

/**
 * A utility class that can be used to try and find the 4 root blocks of a dark oak tree
 * when provided one of the root blocks.
 */
export class DarkOakSaplingLocationFinder{
    private RootBlock: Block;

    public constructor(rootBlock: Block){
        this.RootBlock = rootBlock;
    }

    /**
     * Attempts to find the 2x2 grid (4 Vector3 locations) of where 4 dark oak saplings
     * should be placed in an attempt to regrow the dark oak tree where it originally grew from.
     */
    public GetSaplingLocationsForReplanting(): Vector3[]{
        // Because the RootBlock can only ever be in a "corner" of the 2x2 grid (since a 2x2 only has 4 spaces and thus 4 corners)
        // We can check the 3 blocks around it in rotating fashion to determine if the other corners are all dark oak logs
        // as well. If so, then those 3 locations + the RootBlock location are where the saplings need to go.

        if (!this.RootBlock.isValid){
            throw "RootBlock is not a valid block anymore - or never was. Could have been unloaded when tried.";
        }

        const rootBlockLocation: Vector3 = this.RootBlock.location;

        // top-left corner check
        // [x] = root block location
        // [?] = positions being checked for dark oak logs
        /**
         * [?][?]
         * [?][x]
         */
        let topLeftCornerCheck: Vector3[] = [
            this.RootBlock.location,
            Vector3Utils.add(rootBlockLocation, {x: -1, y: 0, z:0}),
            Vector3Utils.add(rootBlockLocation, {x: -1, y: 0, z:1}),
            Vector3Utils.add(rootBlockLocation, {x: 0, y: 0, z:1}),
        ];

        if (this.AreAllLocationBlocksADarkOakLog(topLeftCornerCheck)){
            return topLeftCornerCheck
        }

        // top-right corner check
        // [x] = root block location
        // [?] = positions being checked for dark oak logs
        /**
         * [?][?]
         * [x][?]
         */
        let topRightCornerCheck: Vector3[] = [
            this.RootBlock.location,
            Vector3Utils.add(rootBlockLocation, {x: 1, y: 0, z:0}),
            Vector3Utils.add(rootBlockLocation, {x: 0, y: 0, z:1}),
            Vector3Utils.add(rootBlockLocation, {x: 1, y: 0, z:1}),
        ];

        if (this.AreAllLocationBlocksADarkOakLog(topRightCornerCheck)){
            return topRightCornerCheck
        }

        // bottom-right corner check
        // [x] = root block location
        // [?] = positions being checked for dark oak logs
        /**
         * [x][?]
         * [?][?]
         */
        let bottomRightCornerCheck: Vector3[] = [
            this.RootBlock.location,
            Vector3Utils.add(rootBlockLocation, {x: 1, y: 0, z:0}),
            Vector3Utils.add(rootBlockLocation, {x: 0, y: 0, z:-1}),
            Vector3Utils.add(rootBlockLocation, {x: 1, y: 0, z:-1}),
        ];

        if (this.AreAllLocationBlocksADarkOakLog(bottomRightCornerCheck)){
            return bottomRightCornerCheck
        }

        // bottom-left corner check
        // [x] = root block location
        // [?] = positions being checked for dark oak logs
        /**
         * [?][x]
         * [?][?]
         */
        let bottomLeftCornerCheck: Vector3[] = [
            this.RootBlock.location,
            Vector3Utils.add(rootBlockLocation, {x: -1, y: 0, z:0}),
            Vector3Utils.add(rootBlockLocation, {x: 0, y: 0, z:-1}),
            Vector3Utils.add(rootBlockLocation, {x: -1, y: 0, z:-1}),
        ];

        if (this.AreAllLocationBlocksADarkOakLog(bottomLeftCornerCheck)){
            return bottomLeftCornerCheck
        }

        throw "No dark oak logs in a 2x2 adjacent grid to the provided root block.";
    }

    /**
     * Checks if every Vector3 location provided is a dark oak logs
     */
    private AreAllLocationBlocksADarkOakLog(locations: Vector3[]): boolean{
        const dimension: Dimension = this.RootBlock.dimension;
        for (const location of locations){
            let blockAtLocation: Block | undefined;
            try{
                blockAtLocation = dimension.getBlock(location);
            }catch(e){
                // If there was an exception, return false - as this location can't be determined
                return false;
            }

            // Can't be determined if it's undefined as well
            if (blockAtLocation === undefined){
                return false;
            }

            // Check if it's a dark oak log
            if (blockAtLocation.typeId !== "minecraft:dark_oak_log"){
                // It's not. Return false
                return false;
            }
        }

        // If we got here - then no false returns happened. That means everything passed
        return true;
    }
}