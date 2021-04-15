import { Scene } from "../../framework/core/Scene";
import { ideal } from "../../framework/ideal";
import { GameLayer } from "../../framework/support/enum/GameLayer";
import { ModuleName } from "../config/namings/ModuleName";
import { LoginModule } from "./module/LoginModule";
import { PlayerModule } from "./module/PlayerModule";
import { ReadyModule } from "./module/ReadyModule";
import { RegisterModule } from "./module/RegisterModule";
import { ServerModule } from "./module/ServerModule";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginScene extends Scene {
    ready() {
        this.addModule(ModuleName.LOGIN_MODULE, LoginModule);
        this.addModule(ModuleName.READY_MODULE, ReadyModule);
        this.addModule(ModuleName.PLAYER_MODULE, PlayerModule);
        this.addModule(ModuleName.REGISTER_MODULE, RegisterModule);
        this.addModule(ModuleName.SERVER_MODULE, ServerModule);
    }

    showView() {
        ideal.module.show(ModuleName.LOGIN_MODULE, GameLayer.UI);
    }
}
