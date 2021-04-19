import { Scene } from "../framework/core/Scene";
import { ideal } from "../framework/ideal";
import { ViewMenu } from "./config/namings/ViewMenu";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Test extends Scene {
    onShowMsg() {
        ideal.popup.show(ViewMenu.MSG_POPUP, {
            msg: '这是测试消息!'
        });
    }

    onShowConfirm() {
        ideal.popup.show(ViewMenu.CONFIRM_POPUP, {
            title: '提醒',
            content: '这是一个ConfirmPopup, 有独特的想法！',
        });
    }
}
