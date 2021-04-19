import { PopupAnimType } from "../config/Enum";
import { ideal } from "../ideal";
import { View } from "./View";

const { ccclass, property } = cc._decorator;

@ccclass
export class Popup extends View {
    @property(cc.Boolean)
    enableBlockInput: boolean = true;

    @property({ type: cc.Enum(PopupAnimType) })
    animType: PopupAnimType = PopupAnimType.NONE;

    show(parent: cc.Node, data?: object) {
        super.show(parent, data);
        this.onShow();
    }

    hide() {
        ideal.popup.__hide(this.node);
    }

    onLoad() {
        if (this.enableBlockInput) {
            this.node.addComponent(cc.BlockInputEvents);
        }
    }

    onShow() {
        // TODO ...
    }

    onEnable() {
        super.onEnable();

        switch (this.animType) {
            case PopupAnimType.SCALE:
                cc.tween(this.node)
                    .set({ scale: 0 })
                    .to(0.2, { scale: 1 }, cc.easeBackInOut())
                    .call(() => this.onShow).start();
                break;
            case PopupAnimType.FADE:
                cc.tween(this.node)
                    .set({ opacity: 0 })
                    .to(0.2, { opacity: 255 }, cc.easeQuinticActionOut())
                    .call(() => this.onShow).start();
                break;
            default:
                this.onShow();
                break;
        }
    }
}
