import { ideal } from "../ideal";

const { ccclass, property, menu, inspector } = cc._decorator;

enum EffectType {
    None = 0,
    Normal = 1,
    Crisp = 2,
}

@ccclass
@menu("框架组件/ClickAudio")
export default class ClickAudio extends cc.Component {
    @property({
        type: cc.Enum(EffectType),
    })
    effectType: EffectType = EffectType.None;

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onAudioEffect, this);
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onAudioEffect, this);
    }

    onAudioEffect() {
        switch (this.effectType) {
            case EffectType.Normal:
                ideal.audio.playEffect("click");
            case EffectType.Crisp:
                ideal.audio.playEffect("crisp");
                break;
        }
    }
}
