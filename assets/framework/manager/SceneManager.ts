import { ideal } from "../ideal";
import { Scene } from "../core/Scene";
import { SceneEvent } from "../support/event/SceneEvent";

export class SceneManager {
    private _currentScene: Scene;

    get currentScene(): Scene { return this._currentScene; }
    set currentScene(scene: Scene) {
        this._currentScene = scene;
        let canvas = scene.node.getComponent(cc.Canvas);
        if (canvas != null) {
            canvas.fitWidth = true;
            if (scene.node.getComponent(cc.Mask) == null) {
                scene.node.addComponent(cc.Mask);
            }
        }
        ideal.event.emit(new SceneEvent(
            SceneEvent.SET_CURRENT_SCENE, scene.name
        ));
    }

    get currentCanvas(): cc.Canvas { return this._currentScene ? this._currentScene.node.getComponent(cc.Canvas) : null; }

    constructor() {
        ideal.event.on(SceneEvent.CHANGE_SCENE, this.onChangeScene, this);
    }

    changeScene(sceneName: string) {
        ideal.event.emit(new SceneEvent(
            SceneEvent.CHANGE_SCENE, sceneName
        ));
    }

    private onChangeScene(ev: SceneEvent) {
        cc.assetManager.main.loadScene(ev.sceneName, (err: Error, assets: cc.SceneAsset) => {
            cc.director.loadScene(ev.sceneName, () => {
                this._currentScene.onGetSceneData(ev.data);
            });
        });
    }
}
