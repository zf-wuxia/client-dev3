import { ViewInfo } from "../../../framework/core/View";

export module View {
    export const HOME_PAGE: ViewInfo = { name: 'HomePage', url: 'Game/Home/HomePage' };
    export const HERO_PAGE: ViewInfo = { name: 'HeroPage', url: 'Game/Home/HeroPage' };

    export const MSG_POPUP: ViewInfo = { name: 'MsgPopup', url: 'Common/MsgPopup', priority: 11 };
    export const CONFIRM_POPUP: ViewInfo = { name: 'ConfirmPopup', url: 'Common/ConfirmPopup', priority: 10 };
}
