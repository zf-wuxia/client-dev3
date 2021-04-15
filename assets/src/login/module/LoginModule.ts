import { Module } from "../../../framework/core/Module";
import { ideal } from "../../../framework/ideal";
import { GameLayer } from "../../../framework/support/enum/GameLayer";
import { NodeUtils } from "../../../framework/support/utils/NodeUtils";
import { ModuleName } from "../../config/namings/ModuleName";

export class LoginModule extends Module {
    private btnLogin: cc.Button;
    private btnRegister: cc.Button;
    private btnChangePassword: cc.Button;

    get assets(): any { return ['Login/LoginModule/LoginModule']; }

    ready() {
        this.btnLogin = NodeUtils.getNodeChildByName(this.node, 'Btn_Login', cc.Button);
        this.btnRegister = NodeUtils.getNodeChildByName(this.node, 'Btn_Register', cc.Button);
        this.btnChangePassword = NodeUtils.getNodeChildByName(this.node, 'Btn_ChangePassword', cc.Button);
    }

    bindEvents(): void {
        this.btnLogin.node.on(cc.Node.EventType.TOUCH_END, this.onLogin, this);
        this.btnRegister.node.on(cc.Node.EventType.TOUCH_END, this.onRegister, this);
        this.btnChangePassword.node.on(cc.Node.EventType.TOUCH_END, this.onChangePassword, this);
    }

    private onLogin(): void {
        console.log('点击了登录');
        ideal.module.show(ModuleName.PLAYER_MODULE, GameLayer.Popup);
        this.hide();
    }

    private onRegister(): void {
        console.log('点击了注册');
        ideal.module.show(ModuleName.REGISTER_MODULE, GameLayer.Popup);
    }

    private onChangePassword(): void {
        console.log('点击了忘记密码');
    }
}
