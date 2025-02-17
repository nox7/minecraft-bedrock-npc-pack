import { Dimension, Vector3 } from "@minecraft/server";

export interface BlockFinderOptions{
    StartLocation: Vector3,
    Dimension: Dimension,
    TypeIdsToFind: string[],
    TagsToFind: string[],
    MaxDistance: number,
    MaxBlocksToFind: number,
    LocationsToIgnore: Vector3[],
    TypeIdsToIgnore: string[],
    TagsToIgnore: string[],
    TypeIdsToConsiderPassable: string[],
    TagsToConsiderPassable: string[],
    AllowYAxisFlood: boolean
}