import { Popup } from "../../../framework/core/Popup";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ConfirmPopup extends Popup {
    @property(cc.Label)
    lblTitle: cc.Label = null;

    @property(cc.Label)
    lblContent: cc.Label = null;

    @property(cc.Button)
    btnOk: cc.Button = null;

    @property(cc.Button)
    btnCancel: cc.Button = null;

    data: {
        type: number,
        title: string,
        content: string,
    };

    onShow() {
        this.lblTitle.string = this.data.title;
        this.lblContent.string = this.data.content;

        this.
    }
}
