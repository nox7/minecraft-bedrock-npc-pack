import {
    world,
    system,
    Player,
    PlayerPlaceBlockAfterEvent,
    Block,
    Vector3,
    Entity,
    EntityLoadAfterEvent,
    EntityEquippableComponent,
    EquipmentSlot,
    EntityInventoryComponent,
    PlayerBreakBlockBeforeEvent,
    PlayerInteractWithBlockBeforeEvent,
    ContainerSlot,
    ItemStartUseOnAfterEvent,
} from "@minecraft/server";
import { WoodcutterManagerBlock } from "./BlockHandlers/WoodcutterManagerBlock.js";
import { Woodcutter } from "./NPCs/Woodcutter.js";
import { Debug } from "./Debug/Debug.js";
import { LogLevel } from "./Debug/LogLevel.js";
import { NPCHandler } from "./NPCHandler.js";
import { PlayerDebounceManager } from "./Utilities/PlayerDebounceManager.js";

Debug.LogLevel = LogLevel.None;

const npcHandler = new NPCHandler();
system.runInterval(() => {
    npcHandler.OnGameTick();
});

world.afterEvents.playerPlaceBlock.subscribe(async (playerPlaceBlockEvent: PlayerPlaceBlockAfterEvent) => {
    const block = playerPlaceBlockEvent.block;

    // Player placed a woodcutter-manager block
    if (block.permutation.matches("nox:woodcutter-manager")) {
        const woodcutterManagerBlock: WoodcutterManagerBlock = new WoodcutterManagerBlock(block);
        const woodcutterNpc: Woodcutter | null = woodcutterManagerBlock.SpawnWoodcutter(npcHandler);
        if (woodcutterNpc) {
            npcHandler.RegisterNPC(woodcutterNpc);
        }
    }
});

world.beforeEvents.playerBreakBlock.subscribe(async (event: PlayerBreakBlockBeforeEvent) => {
    const block: Block = event.block;
    if (block.typeId === "nox:woodcutter-manager") {
        const blockLocation: Vector3 = block.location;
        system.run(() => {
            Woodcutter.OnWoodcutterManagerBlockBroke(blockLocation);
        });
    }
});

world.beforeEvents.playerInteractWithBlock.subscribe((e: PlayerInteractWithBlockBeforeEvent) => {
    console.log("A");
    if (e.block.permutation.matches("nox:woodcutter-manager")) {
        const player: Player = e.player;
        if (player.isSneaking) {
            // Do nothing, let them act normally on this block
            // world.sendMessage("IS SNEAKING");
        } else {
            // Cancel whatever the player tried to do on this
            // world.sendMessage("Is woodcutter");
            e.cancel = true
        }
    }
});

world.beforeEvents.playerInteractWithBlock.subscribe((interactEvent: PlayerInteractWithBlockBeforeEvent) => {
    const player: Player = interactEvent.player;

    if (PlayerDebounceManager.IsDebounced(player, 350)) {
        return;
    }

    PlayerDebounceManager.Debounce(player);

    let equipmentComponent: EntityEquippableComponent | undefined;
    let inventoryComponent: EntityInventoryComponent | undefined;
    let slot: ContainerSlot | undefined;
    try {
        equipmentComponent = player.getComponent(EntityEquippableComponent.componentId);
        inventoryComponent = player.getComponent(EntityInventoryComponent.componentId);
        slot = equipmentComponent?.getEquipmentSlot(EquipmentSlot.Mainhand);
    } catch (e) {
        return;
    }

    const targetBlock = interactEvent.block;
    if (!targetBlock.isValid) {
        return;
    }

    if (targetBlock.typeId === "nox:woodcutter-manager") {
        interactEvent.cancel = true;
        system.run(() => {
            const woodcutterManagerBlock = WoodcutterManagerBlock.GetFromLocation(targetBlock.location);
            if (woodcutterManagerBlock !== null) {
                woodcutterManagerBlock.OnPlayerInteract(player);
            }
        });

        return;
    }
});

world.afterEvents.worldLoad.subscribe(() => {
    // Check if there is a world-scoped dynamic property for the Woodcutter NPC
    const nextNpcId = world.getDynamicProperty("nox:next_npc_id");
    const nextWoodCutterId = world.getDynamicProperty("nox:next_woodcutter_id");
    if (nextWoodCutterId === undefined) {
        // This property needs to be registered to this world
        world.setDynamicProperty("nox:next_woodcutter_id", 1);
    }

    if (nextNpcId === undefined) {
        world.setDynamicProperty("nox:next_npc_id", 1);
    }
});

world.afterEvents.entityLoad.subscribe((e: EntityLoadAfterEvent) => {
    const entity: Entity = e.entity;
    // Did we just load a Woodcutter?
    if (entity.typeId === "nox:woodcutter") {
        // If it is not already cached in memory, then this woodcutter needs to be registered on the server
        if (Woodcutter.GetFromCache(entity) === null) {
            Woodcutter.LoadFromExistingEntity(entity, npcHandler);
        }
    }
});