import { NPC } from "./NPCs/NPC";

export class NPCHandler{
    private NPCs: NPC[] = [];

    public constructor(){

    }

    /**
     * Registers an NPC into the handler
     * @param npc 
     */
    public RegisterNPC(npc: NPC){
        this.NPCs.push(npc);
    }

    /**
     * Runs every game tick
     */
    public async OnGameTick(): Promise<void>{
        for (const npc of this.NPCs){
            npc.OnGameTick();
        }
    }

    /**
     * Removes the NPC from the registered NPCs
     */
    public UnregisterNPC(npc: NPC): void{
        for (const index in this.NPCs){
            if (this.NPCs[index] === npc){
                this.NPCs.splice(parseInt(index), 1);
                break;
            }
        }
    }
}