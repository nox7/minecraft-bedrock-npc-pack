import { LogLevel } from "./LogLevel.js";

export class Debug{

    public static LogLevel: LogLevel = LogLevel.Info;

    public static Info(message: string){
        if (Debug.LogLevel >= LogLevel.Info){
            Debug.Output(message);
        }
    }

    public static Warn(message: string){
        if (Debug.LogLevel >= LogLevel.Warn){
            Debug.Output(message);
        }
    }

    public static Critical(message: string){
        if (Debug.LogLevel >= LogLevel.Critical){
            Debug.Output(message);
        }
    }

    public static Error(message: string){
        if (Debug.LogLevel >= LogLevel.Error){
            Debug.Output(message);
        }
    }

    private static Output(message: string){
        console.warn(`[Nox Debug]: ${message}`);
    }
}