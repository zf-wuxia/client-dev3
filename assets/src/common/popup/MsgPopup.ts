import { Popup } from "../../../framework/core/Popup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MsgPopup extends Popup {
    @property(cc.Node)
    wrap: cc.Node = null;

    @property(cc.Label)
    label: cc.Label = null;

    onShow() {
        let hideX = this.wrap.y + 120;

        cc.tween(this.wrap)
            .delay(3)
            .to(0.3, { y: hideX, opacity: 0 }, cc.easeIn(2))
            .call(() => this.hide())
            .start();
        this.label.string = this.data.msg;
    }
}
