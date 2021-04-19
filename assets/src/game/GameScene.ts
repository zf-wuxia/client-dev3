import { Scene } from "../../framework/core/Scene";
import { ideal } from "../../framework/ideal";
import { ViewMenu } from "../config/namings/ViewMenu";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameScene extends Scene {
    onLoad() {
        super.onLoad();

        ideal.page.show(ViewMenu.HOME_PAGE, {
            type: 'default'
        });
    }
}
