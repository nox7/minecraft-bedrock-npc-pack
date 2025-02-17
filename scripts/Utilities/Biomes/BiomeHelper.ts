import { Vector3Utils } from "@minecraft/math";
import { BiomeType, BiomeTypes, Dimension, Vector3, system } from "@minecraft/server";

/**
 * Utility class to help with finding specific biomes at a provided location using GetBiomeOfLocation.
 * 
 * Usage:
 * const helper = new BiomeHelper();
 * const closestBiome = await helper.GetBiomeOfLocation(location, dimension);
 */
export class BiomeHelper{
    private IsRunning: boolean = false;
    /**
     * Biomes found during the last QueryBiomesAroundLocationGenerator job. Keys are biome type Ids.
     */
    private BiomesFoundDuringGeneration: {[key: string]: Vector3} = {};
    private PromiseCallback: (() => void) | undefined;

    /**
     * Returns if there is currently an active query. Two queries cannot be run on the same instance concurrently.
     * @returns 
     */
    public IsQuerying(): boolean{
        return this.IsRunning;
    }

    /**
     * Determines what biome a given location is in. Asynchronous become it starts a system.runJob() and awaits that job's completion. Cannot be called
     * 
     * @param location 
     * @param dimension 
     * @returns 
     */
    public async GetBiomeOfLocation(location: Vector3, dimension: Dimension): Promise<BiomeType | undefined>{
        if (this.IsRunning){
            throw "BiomeHelper instance cannot run concurrent queries. Create a new BiomeHelper or await the currently running search..";
        }

        const jobPromise = new Promise<void>(resolve => {
            this.PromiseCallback = resolve;
        });
        this.IsRunning = true;
        system.runJob(this.QueryBiomesAroundLocationGenerator(location, dimension));
        await jobPromise;

        // Clear out the currently-running properties so another run could be done.
        this.IsRunning = false;
        this.PromiseCallback = undefined;

        if (Object.keys(this.BiomesFoundDuringGeneration).length > 0){
            let shortestDistance: number | undefined;
            let closestBiome: string| undefined;
            for (const biomeTypeId in this.BiomesFoundDuringGeneration){
                if (shortestDistance === undefined){
                    shortestDistance = Vector3Utils.distance(location, this.BiomesFoundDuringGeneration[biomeTypeId]);
                    closestBiome = biomeTypeId;
                }else{
                    const biomeDistance = Vector3Utils.distance(location, this.BiomesFoundDuringGeneration[biomeTypeId]);
                    if (biomeDistance < shortestDistance){
                        shortestDistance = biomeDistance;
                        closestBiome = biomeTypeId;
                    }
                }
            }

            return BiomeTypes.get(closestBiome!);
        }else{
            return undefined;
        }
    }

    /**
     * Generator function meant to be passed to system.runJob() to query all biomes for a given location and find
     * any around that location within 64 block volume.
     * @param location 
     * @param dimension 
     */
    private *QueryBiomesAroundLocationGenerator(location: Vector3, dimension: Dimension){
        const allBiomes = BiomeTypes.getAll();

        for (const biomeType of allBiomes){
            try{
                const searchResultLocation: Vector3 | undefined = dimension.findClosestBiome(
                    location,
                    biomeType,
                    {
                        boundingSize: {x: 64, y: 64, z: 64}
                    }
                );

                if (searchResultLocation !== undefined){
                    this.BiomesFoundDuringGeneration[biomeType.id] = searchResultLocation;
                }
            }catch(e){
                // console.warn("Biome search error: " + String(e));
            }

            yield;
        }

        if (this.PromiseCallback !== undefined){
            this.PromiseCallback();
        }
    }
}