import { Dimension, Vector3 } from "@minecraft/server";

/**
 * Utility class with methods to test the environment at a location or entity
 */
export class EnvironmentHelper{
    /**
     * Tests if a location could be considered underground
     * @param location 
     * @param dimension 
     */
    public IsLocationUnderground(location: Vector3, dimension: Dimension): boolean{
        return false;
    }
}