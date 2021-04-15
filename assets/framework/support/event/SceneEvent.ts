import { Event } from "./Event";

export class SceneEvent extends Event {
    static CHANGE_SCENE: string = 'onChangeScene';
    static SET_CURRENT_SCENE: string = 'onSetCurrentScene';
    static DESTROY_CURRENT_SCENE: string = 'onDestroyCurrentScene';

    private _sceneName: string;
    get sceneName(): string {
        return this._sceneName;
    }

    constructor(type: string, sceneName: string, data?: object) {
        super(type, data);
        this._sceneName = sceneName;
    }
}
