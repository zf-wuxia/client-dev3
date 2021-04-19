import { PageInfo, PopupInfo } from "../../../framework/core/View";

export module ViewMenu {
    export const HOME_PAGE: PageInfo = { name: 'HomePage', url: 'Game/HomePage' };
    export const HERO_PAGE: PageInfo = { name: 'HeroPage', url: 'Game/HeroPage' };

    export const MSG_POPUP: PopupInfo = { name: 'MsgPopup', url: 'Common/MsgPopup', priority: 11, only: false, orderly: false };
    export const CONFIRM_POPUP: PopupInfo = { name: 'ConfirmPopup', url: 'Common/ConfirmPopup', priority: 10, only: true, orderly: false };
}
