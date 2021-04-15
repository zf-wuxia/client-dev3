import { FRAME_VERSION } from "./config/Version";
import { AudioManager } from "./manager/AudioManager";
import { CacheManager } from "./manager/CacheManager";
import { EventManager } from "./manager/EventManager";
import { ModuleManager } from "./manager/ModuleManager";
import { PageManager } from "./manager/PageManager";
import { PoolManager } from "./manager/PoolManager";
import { PopupManager } from "./manager/PopupManager";
import { SceneManager } from "./manager/SceneManager";

export namespace ideal {
    export const event: EventManager = new EventManager();
    export const pool: PoolManager = new PoolManager();
    export const audio: AudioManager = new AudioManager();
    export const page: PageManager = new PageManager();
    export const popup: PopupManager = new PopupManager();
    export const scene: SceneManager = new SceneManager();
    export const module: ModuleManager = new ModuleManager();
    export const cache: CacheManager = new CacheManager();
}

export namespace ideal {
    export const version: string = FRAME_VERSION;
}


CC_DEV && (window['ideal'] = ideal);
