import { Player } from "@minecraft/server";

export class PlayerDebounceManager{
    public static PlayerDebounceTimes: {[key: string]: number} = {};

    /**
     * Checks if the player is currently debounced from a recent action
     * @param player 
     * @param deltaTime In Ms
     * @returns 
     */
    public static IsDebounced(player: Player, deltaTime: number){
        const now = (new Date()).getTime();
        if (player.id in PlayerDebounceManager.PlayerDebounceTimes){
            if (now - PlayerDebounceManager.PlayerDebounceTimes[player.id] < deltaTime){
                return true;
            }
        }

        return false;
    }

    public static Debounce(player: Player){
        PlayerDebounceManager.PlayerDebounceTimes[player.id] = (new Date()).getTime();
    }
}