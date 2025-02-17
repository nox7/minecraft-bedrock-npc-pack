export abstract class NPC{

    public abstract IsReadyForStateChange: boolean;

    public abstract OnGameTick(): Promise<void>;
}