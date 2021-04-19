import { Page } from "../../../framework/core/Page";
import { ideal } from "../../../framework/ideal";
import { MenuType } from "../../config/namings/MenuType";
import { ViewMenu } from "../../config/namings/ViewMenu";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomePage extends Page {
    onLoad() {

    }

    onMenu(ev: cc.Event.EventTouch) {
        let target: cc.Node = ev.target;
        switch (target.name) {
            case MenuType.MENU_ACTIVITY:
                this.menuActivity();
                break;
            case MenuType.MENU_BAG:
                this.menuBag();
                break;
            case MenuType.MENU_BATTLE:
                this.menuBattle();
                break;
            case MenuType.MENU_CLUB:
                this.menuClub();
                break;
            case MenuType.MENU_DONGFU:
                this.menuDongfu();
                break;
            case MenuType.MENU_EXCHANGE:
                this.menuExchange();
                break;
            case MenuType.MENU_FATE:
                this.menuFate();
                break;
            case MenuType.MENU_FRIEND:
                this.menuFriend();
                break;
            case MenuType.MENU_HERO:
                this.menuHero();
                break;
            case MenuType.MENU_MANUAL:
                this.menuManual();
                break;
            case MenuType.MENU_MORE:
                this.menuMore();
                break;
            case MenuType.MENU_MSG:
                this.menuMsg();
                break;
            case MenuType.MENU_PVP:
                this.menuPvp();
                break;
            case MenuType.MENU_REWARD:
                this.menuReward();
                break;
            case MenuType.MENU_SIGN:
                this.menuSign();
                break;
            case MenuType.MENU_SUMMON:
                this.menuSummon();
                break;
            case MenuType.MENU_TASK:
                this.menuTask();
                break;
            case MenuType.MENU_TRADER:
                this.menuTrader();
                break;
        }
    }

    private menuActivity() {
        cc.log('menuActivity');
    }

    private menuBag() {
        cc.log('menuBag');
    }

    private menuBattle() {
        cc.log('menuBattle');

        ideal.popup.show(ViewMenu.MSG_POPUP);
    }

    private menuClub() {
        cc.log('menuClub');
    }

    private menuDongfu() {
        cc.log('menuDongfu');
    }

    private menuExchange() {
        cc.log('menuExchange');
    }

    private menuFate() {
        cc.log('menuFate');
    }

    private menuFriend() {
        cc.log('menuFriend');
    }

    private menuHero() {
        cc.log('menuHero');
    }

    private menuManual() {
        cc.log('menuManual');
    }

    private menuMore() {
        cc.log('menuMore');
    }

    private menuMsg() {
        cc.log('menuMsg');
    }

    private menuPvp() {
        cc.log('menuPvp');
    }

    private menuReward() {
        cc.log('menuReward');
    }

    private menuSign() {
        cc.log('menuSign');
    }

    private menuSummon() {
        cc.log('menuSummon');
    }

    private menuTask() {
        cc.log('menuTask');
    }

    private menuTrader() {
        cc.log('menuTrader');
    }
}
