export enum GameLayer {
    /** 背景层 **/
    Background = 0,
    /** 内容的显示层 **/
    Content = 1,
    /** UI显示层 **/
    UI = 2,
    /** 所有的弹出层的遮罩层 **/
    PopupMask = 3,
    /** 弹出层 **/
    Popup = 4,
    /** 所有的窗口层的遮罩层 **/
    WindowMask = 5,
    /** 窗口层 **/
    Window = 6
}

export const GameLayerNames: string[] = [
    "Background", "Content", "UI", "PopupMask", "Popup", "WindowMask", "Window"
]
