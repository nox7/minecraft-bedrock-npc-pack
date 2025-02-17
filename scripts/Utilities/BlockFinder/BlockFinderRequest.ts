import { Block } from "@minecraft/server";
import { FloodFillIterator } from "../../PathfindingSuite/Iterators/FloodFill/FloodFillIterator.js";
import { BlockFinderOptions } from "./BlockFinderOptions.js";

/**
 * Represents a current or queued request for block finding
 */
export class BlockFinderRequest{
    public PromiseResolveCallback: any;
    public PromiseRejectCallback: any;
    public BlockFinderOptions: BlockFinderOptions;
    public FloodFillIterator: FloodFillIterator;
    public BlocksFound: Block[] = [];

    public constructor(promiseResolve: any, promiseReject: any, finderOptions: BlockFinderOptions, floodFillIterator: FloodFillIterator){
        this.PromiseResolveCallback = promiseResolve;
        this.PromiseRejectCallback = promiseReject;
        this.BlockFinderOptions = finderOptions;
        this.FloodFillIterator = floodFillIterator;
    }
}