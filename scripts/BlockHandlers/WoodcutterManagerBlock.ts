import { Block, Player, Vector3 } from "@minecraft/server";
import { EmptySpaceFinder } from "../Utilities/EmptySpaceFinder";
import { CuboidRegion } from "../PathfindingSuite/Region/CuboidRegion";
import { Woodcutter } from "../NPCs/Woodcutter";
import { TryGetBlock } from "../Utilities/TryGetBlock";
import { NPCHandler } from "../NPCHandler";
import { ModalFormData } from "@minecraft/server-ui";
import { Vector3Utils } from "@minecraft/math";

export class WoodcutterManagerBlock{

    public static BlockTypeId = "nox:woodcutter-manager";
    public static Cache: WoodcutterManagerBlock[] = [];

    /**
     * Gets the instance of WoodcutterManagerBlock from a Vector3 location, if one is there
     * @param location 
     */
    public static GetFromLocation(location: Vector3): WoodcutterManagerBlock | null{
        for (const managerBlock of WoodcutterManagerBlock.Cache){
            const block = managerBlock.GetBlock();
            if (block.isValid){
                if (Vector3Utils.equals(location, block.location)){
                    return managerBlock;
                }
            }
        }

        return null;
    }

    private Block: Block;
    private BlockLocationX: number;
    private BlockLocationY: number;
    private BlockLocationZ: number;
    private WoodcutterNPC: Woodcutter | null = null;

    public constructor(block: Block){
        this.Block = block;
        this.BlockLocationX = block.location.x;
        this.BlockLocationY = block.location.y;
        this.BlockLocationZ = block.location.z;
        WoodcutterManagerBlock.Cache.push(this);
    }

    /**
     * When the player interacts with this block
     * @param player 
     */
    public async OnPlayerInteract(player: Player): Promise<void>{
        if (this.WoodcutterNPC !== null){
            if (this.WoodcutterNPC.GetEntity() !== null){
                const entity = this.WoodcutterNPC.GetEntity()!;

                const currentIsEnabled = this.WoodcutterNPC.GetIsEnabled();
                const currentMaxSearchDistance = this.WoodcutterNPC.GetSearchDistance();
                const currentDoesStripLogs = this.WoodcutterNPC.GetDoesStripLogs();

                const modalForm = new ModalFormData();
                modalForm.title("Woodcutter Settings");
                modalForm.toggle("Is active", currentIsEnabled);
                modalForm.slider("Search distance", 5, 20, 1, currentMaxSearchDistance);
                modalForm.toggle("Strips logs", currentDoesStripLogs);
                const response = await modalForm.show(player);

                if (response.formValues !== undefined){
                    const newIsEnabled = Boolean(response.formValues[0]);
                    const newMaxSearchDistance = Number(response.formValues[1]);
                    const newDoesStripLogs = Boolean(response.formValues[2]);
                    this.WoodcutterNPC.SetIsEnabled(newIsEnabled);
                    this.WoodcutterNPC.SetSearchDistance(newMaxSearchDistance);
                    this.WoodcutterNPC.SetDoesStripLogs(newDoesStripLogs);
                }

            }else{
                player.sendMessage("No woodcutter associated with this block.");
            }
        }else{
            player.sendMessage("No woodcutter associated with this block.");
        }
    }

    /**
     * Returns the current minecraft Block
     * @returns
     */
    public GetBlock(): Block{
        return this.Block;
    }

    /**
     * Finds an empty space around the placed block and spawns a woodcutter at that empty space
     */
    public SpawnWoodcutter(npcHandler: NPCHandler): Woodcutter | null{
        const cuboidRegionAroundSpawn = CuboidRegion.FromCenterLocation(this.Block.location, 1, true);
        const emptySpaceFinder: EmptySpaceFinder = new EmptySpaceFinder(cuboidRegionAroundSpawn, this.Block.dimension);
        const emptyLocations: Vector3[] = emptySpaceFinder.GetAllEmptyLocations();
        if (emptyLocations.length > 0){
            const location: Vector3 = emptyLocations[Math.floor(Math.random() * (emptyLocations.length - 1))];
            this.WoodcutterNPC = new Woodcutter(this.Block.dimension, this, npcHandler);
            this.WoodcutterNPC.CreateEntity(location);
            return this.WoodcutterNPC;
        }else{
            // Error...
            console.warn("No empty space. Cannot spawn woodcutter.");
        }

        return null;
    }

    /**
     * Sets the woodcutter assigned to this block. Called from the Woodcutter.ts class itself
     * @param woodcutterNpc 
     */
    public SetWoodcutter(woodcutterNpc: Woodcutter): void{
        this.WoodcutterNPC = woodcutterNpc;
    }

    /**
     * Finds a chest that is adjacent to this manager block, if there is one
     */
    public GetAdjacentChest(): Block | null{

        // Block isn't loaded in
        if (!this.Block.isValid){
            return null;
        }

        // Vertically flat
        const cuboidRegionAroundSpawn: CuboidRegion = CuboidRegion.FromCenterLocation(this.Block.location, 1, true);
        const locations: Vector3[] = cuboidRegionAroundSpawn.GetAllLocationsInRegion();
        for (const location of locations){
            const block: Block | undefined = TryGetBlock(this.Block.dimension, location);
            if (block !== undefined){
                if (block.typeId === "minecraft:chest"){
                    return block;
                }
            }
        }

        return null;
    }
}