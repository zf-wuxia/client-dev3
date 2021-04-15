import { ideal } from "../../framework/ideal";
import { Scene } from "../../framework/core/Scene";
import { DefaultEnter } from "./scheme/DefaultEnter";
import { NativeEnter } from "./scheme/NativeEnter";

const { ccclass, property } = cc._decorator;

// 进度条总长度
export const PROGRESS_WIDTH = 504;

@ccclass
export default class LauncherScene extends Scene {
    @property(cc.Node)
    barProgress: cc.Node = null;

    @property(cc.Node)
    layProgress: cc.Node = null;

    @property(cc.Label)
    lblProgress: cc.Label = null;

    @property(cc.Label)
    lblMessage: cc.Label = null;

    onLoad() {
        super.onLoad();

        ideal.audio.musicVolume = 0.3;
        ideal.audio.effectVolume = 0.3;
        ideal.audio.playMusic('main_music');

        this.layProgress.active = false;
        
        CC_JSB ? this.node.addComponent(NativeEnter) : this.node.addComponent(DefaultEnter);
    }
}
