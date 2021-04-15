import { Module } from "../../../framework/core/Module";
import { NodeUtils } from "../../../framework/support/utils/NodeUtils";

export class RegisterModule extends Module {
    get assets(): any {
        return ['Login/RegisterModule/RegisterModule'];
    }

    private btnClose: cc.Button;
    private btnRegister: cc.Button;
    private txtAccount: cc.EditBox;
    private txtPassword: cc.EditBox;
    private txtPassword2: cc.EditBox;

    ready() {
        this.btnRegister = NodeUtils.getNodeChildByName(this.node, 'Wrap/Btn_Register', cc.Button);
        this.btnClose = NodeUtils.getNodeChildByName(this.node, 'Wrap/Btn_Close', cc.Button);
        this.txtAccount = NodeUtils.getNodeChildByName(this.node, 'Wrap/Account/EditBox', cc.EditBox);
        this.txtPassword = NodeUtils.getNodeChildByName(this.node, 'Wrap/Password/EditBox', cc.EditBox);
        this.txtPassword2 = NodeUtils.getNodeChildByName(this.node, 'Wrap/Password2/EditBox', cc.EditBox);
    }

    showView() {
        super.showView();

        this.txtAccount.string = '';
        this.txtPassword.string = '';
        this.txtPassword2.string = '';
    }

    bindEvents() {
        this.btnClose.node.on(cc.Node.EventType.TOUCH_END, this.onClose, this);
        this.btnRegister.node.on(cc.Node.EventType.TOUCH_END, this.onRegister, this);
    }

    private onRegister() {
        console.log('点击了注册');

        console.log(`账号: ${this.txtAccount.string}`);
        console.log(`密码: ${this.txtPassword.string}`);

        this.hide();
    }

    private onClose() {
        this.hide();
    }
}
