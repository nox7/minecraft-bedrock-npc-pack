import { Block, Entity, Vector3, system } from "@minecraft/server";
import { Vector3Builder, Vector3Utils } from "@minecraft/math";
import { AStar } from "../PathfindingSuite/Pathfinder/AStar";
import { AStarOptions } from "../PathfindingSuite/Pathfinder/AStarOptions";

/**
 * A walker class that will move an entity from one location to another.
 * 
 * Usage:
 * const walker = new EntityWalker(entity, AStarOptions);
 * await walker.MoveTo();
 */
export class EntityWalker{

    private Entity: Entity;
    private IsWalking: boolean = false;
    private PathfindingOptions: AStarOptions;
    private CurrentTargetBlock: Block | undefined;

    public constructor(entity: Entity, options: AStarOptions){
        this.Entity = entity;
        this.PathfindingOptions = options;
    }

    /**
     * Uses A* to find a path to the target location from the entity's current location at the time of calling MoveTo.
     * If there is no path to the target, then false is returned. Otherwise, this method will walk the entity and return true
     * after the entity reaches the location.
     * @returns
     * @throws 
     */
    public async MoveTo(
        speed: number = 1 / 8
        ): Promise<boolean>
    {

        if (this.IsWalking){
            throw "Entity is currently walking. You must stop the move before calling MoveTo again.";
        }

        this.IsWalking = true;

        let aStar: AStar;
        try{
            aStar = new AStar(this.PathfindingOptions);
        }catch(e){
            // Failed to construct - start/end blocks probably not loaded
            this.IsWalking = false;
            return false;
        }

        const blockPath: Block[] = await aStar.Pathfind();

        // Reverse the block path so the start is at the end 
        // The walker will pop the blocks off the end of the array and stop when there are no more
        blockPath.reverse();

        return new Promise<boolean>(async (resolve, reject) => {
            const runId: number = system.runInterval(async () => {

                if (blockPath.length === 0){
                    // Done
                    system.clearRun(runId);
                    return resolve(true);
                }

                if (this.CurrentTargetBlock === undefined){
                    this.CurrentTargetBlock = blockPath.pop();
                }

                // Cast it as not undefined
                const targetBlock: Block = <Block>this.CurrentTargetBlock;

                if (!targetBlock.isValid){
                    system.clearRun(runId);
                    return reject("One of the block in the path is no longer valid.");
                }

                if (!this.Entity.isValid){
                    system.clearRun(runId);
                    return reject("The entity this EntityWalker was constructed for is no longer valid.");
                }

                let entityLocation: Vector3;
                try{
                    entityLocation = this.Entity.location;
                }catch(e){
                    // Failed to get location. Probably dead or unloaded
                    system.clearRun(runId);
                    return reject("The entity's location for the EntityWalker was no obtainable. Most likely it has become invalid.");
                }

                // Move towards the current target block
                if (this.IsEntityAtCurrentTarget()){
                    // Set the current target as undefined, the next interval iteration will handle it
                    this.CurrentTargetBlock = undefined;
                }else{
                    // Move towards the target block

                    const targetBlockWalkToLocation: Vector3 = new Vector3Builder(targetBlock.center()).subtract({x: 0, y: 0.45, z:0});
                    const direction = new Vector3Builder(Vector3Utils.subtract(targetBlockWalkToLocation, this.Entity.location)).normalize();
                    const fractionalizedDirection = direction.scale(speed);
                    const teleportLocation = Vector3Utils.add(this.Entity.location, fractionalizedDirection);
                    this.Entity.teleport(teleportLocation, {
                        facingLocation: targetBlockWalkToLocation
                    });
                }
            });
        });
    }

    /**
     * Checks if the entity is at the current target by comparing if the distance between it and the target is within closeEnoughThreshold.
     */
    private IsEntityAtCurrentTarget(closeEnoughThreshold: number = 0.75): boolean{
        if (this.Entity.isValid){
            if (this.CurrentTargetBlock !== undefined && this.CurrentTargetBlock.isValid){
                const distanceToTargetBlock: number = Vector3Utils.distance(this.Entity.location, this.CurrentTargetBlock.center());
                return distanceToTargetBlock <= closeEnoughThreshold;
            }else{
                throw "Current target block is undefined or invalid.";
            }
        }else{
            throw "Current entity is invalid.";
        }
    }
}