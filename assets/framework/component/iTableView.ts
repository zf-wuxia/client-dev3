import iViewCell from "./iViewCell";

const { ccclass, property, inspector, menu } = cc._decorator;

/** 滑动方向
 * @None 未定义
 * @Up 向上
 * @Down 向下
 * @Left 向左
 * @Right 向右
 */
enum ScrollDirection {
    None,
    Up,
    Down,
    Left,
    Right,
}

/** 滑动模式
 * @Horizontal 水平方向
 * @Vertical 垂直方向
 */
enum ScrollModel {
    Horizontal,
    Vertical,
}

/** 水平偏移方向
 * @Left 向左
 * @Right 向右
 * @Center 中间
 */
enum HorizontalOffsetDirection {
    Left,
    Right,
    Center,
}

/** 垂直偏移方向
 * @Top 向上
 * @Bottom 向下
 * @Center 中间
 */
enum VerticalOffsetDirection {
    Top,
    Bottom,
    Center,
}

const BRAKE: number = 0.5
const EPSILON: number = 1e-4
const MOVEMENT_FACTOR: number = 0.7
const OUT_OF_BOUNDARY_BREAKING_FACTOR: number = 0.05
const NUMBER_OF_GATHERED_TOUCHES_FOR_MOVE_SPEED: number = 5

export enum EventType {
    // 滚动视图滚动到顶部边界事件
    SCROLL_TO_TOP = "scroll-to-top",
    // 滚动视图滚动到底部边界事件
    SCROLL_TO_BOTTOM = "scroll-to-bottom",
    // 滚动视图滚动到左边界事件
    SCROLL_TO_LEFT = "scroll-to-left",
    // 滚动视图滚动到右边界事件
    SCROLL_TO_RIGHT = "scroll-to-right",
    // 滚动视图正在滚动时发出的事件
    SCROLLING = "scrolling",
    // 滚动视图滚动到顶部边界并且开始回弹时发出的事件
    BOUNCE_TOP = "bounce-top",
    // 滚动视图滚动到底部边界并且开始回弹时发出的事件
    BOUNCE_BOTTOM = "bounce-bottom",
    // 滚动视图滚动到左边界并且开始回弹时发出的事件
    BOUNCE_LEFT = "bounce-left",
    // 滚动视图滚动到右边界并且开始回弹时发出的事件
    BOUNCE_RIGHT = "bounce-right",
    // 滚动视图滚动结束的时候发出的事件
    SCROLL_ENDED = "scroll-ended",
    // 当用户松手的时候会发出一个事件
    TOUCH_UP = "touch-up",
    // 滚动视图自动滚动快要结束的时候发出的事件
    AUTOSCROLL_ENDED_WITH_THRESHOLD = "scroll-ended-with-threshold",
    // 滚动视图滚动开始时发出的事件
    SCROLL_BEGAN = "scroll-began",
    // ViewCell被点击的事件
    VIEWCELL_CHECKED = "viewcell-checked",
}

@ccclass
@menu("框架组件/iTableView")
@inspector("packages://tableview/inspector.js")
export default class iTableView extends cc.Component {
    @property({
        type: cc.Node,
        displayName: "容器节点"
    })
    content: cc.Node = null

    @property({
        type: cc.Prefab,
        displayName: "ViewCell预制",
    })
    cell: cc.Prefab = null

    @property({
        type: cc.Enum(ScrollModel),
        displayName: "滑动模式",
    })
    scrollModel: ScrollModel

    @property({
        displayName: "网格式渲染",
    })
    enableGrid: boolean = true

    @property({
        displayName: "边界回弹",
    })
    enableElastic: boolean = true

    @property({
        displayName: "触摸事件",
    })
    enableTouchEvent: boolean = true

    @property({
        range: [0, 10],
        displayName: "回弹耗时",
    })
    bounceDuration: number = 0.23

    @property({
        type: cc.Component.EventHandler,
        displayName: "事件回调",
    })
    scrollEvents: cc.Component.EventHandler[] = []

    @property({
        type: cc.Enum(HorizontalOffsetDirection),
        displayName: "水平偏移方向",
    })
    horizontalOffsetDirection: HorizontalOffsetDirection

    @property({
        type: cc.Enum(VerticalOffsetDirection),
        displayName: "垂直偏移方向",
    })
    verticalOffsetDirection: VerticalOffsetDirection

    private source: any[]

    private topBoundary: number = 0
    private bottomBoundary: number = 0
    private leftBoundary: number = 0
    private rightBoundary: number = 0

    private initializing: boolean = false
    private initialized: boolean = false

    private cellSize: cc.Size
    private cellCount: number
    private cellPool: cc.NodePool
    private lastOffset: cc.Vec2
    private minGroupIndex: number
    private maxGroupIndex: number
    private scrollDirection: ScrollDirection

    private touchMoveDisplacements: cc.Vec2[] = []
    private touchMoveTimeDeltas: number[] = []
    private touchMovePreviousTimestamp: number = 0
    private touchMoved: boolean = false

    private autoScrolling: boolean = false
    private autoScrollAttenuate: boolean = false
    private autoScrollStartPosition: cc.Vec2 = cc.v2()
    private autoScrollTargetDelta: cc.Vec2 = cc.v2()
    private autoScrollTotalTime: number = 0
    private autoScrollAccumulatedTime: number = 0
    private autoScrollCurrentlyOutOfBoundary: boolean = false
    private autoScrollBraking: boolean = false
    private autoScrollBrakingStartPosition: cc.Vec2 = cc.v2()

    private outOfBoundaryAmount: cc.Vec2 = cc.v2()
    private outOfBoundaryAmountDirty: boolean = true
    private stopMouseWheel: boolean = false
    private mouseWheelEventElapsedTime: number = 0.0
    private scrollEndedWithThresholdEventFired: boolean = false

    private scrollEventEmitMask: number = 0
    private scrolling: boolean = false
    private bouncing: boolean = false
    private tempPoint: cc.Vec2 = cc.v2()
    private tempPrevPoint: cc.Vec2 = cc.v2()

    /** 工作节点总数(实际参与工作的节点数量) */
    private workNodeCount: number = 0
    /** 数据节点总数(原则上要显示的节点数量) */
    private dataNodeCount: number = 0

    get view() {
        if (this.content == null) {
            return null
        } else {
            return this.content.parent
        }
    }

    set dataSource(source: any[]) {
        if (source == null) {
            console.error("iTableView.dataSource 可以为空数组, 但不能为Null.")
            return
        }
        this.init(source)
    }

    get dataSource(): any[] {
        return this.source
    }

    constructor() {
        super();

        this.scrollModel = ScrollModel.Horizontal
        this.scrollDirection = ScrollDirection.None
        this.horizontalOffsetDirection = HorizontalOffsetDirection.Center
        this.verticalOffsetDirection = VerticalOffsetDirection.Center
    }

    public scrollToTop(timeInSecond: number = 0, attenuated: boolean = true) {
        this.scrollDirection = ScrollDirection.Down
        let moveDelta = this.calculateMovePercentDelta(cc.v2(0, 1), false, true)
        if (timeInSecond > 0) {
            this.startAutoScroll(moveDelta, timeInSecond, attenuated)
        } else {
            this.moveContent(moveDelta)
        }
    }

    public scrollToBottom(timeInSecond: number = 0, attenuated: boolean = true) {
        this.scrollDirection = ScrollDirection.Up
        let moveDelta = this.calculateMovePercentDelta(cc.v2(0, 0), false, true)
        if (timeInSecond > 0) {
            this.startAutoScroll(moveDelta, timeInSecond, attenuated)
        } else {
            this.moveContent(moveDelta)
        }
    }

    public scrollToLeft(timeInSecond: number = 0, attenuated: boolean = true) {
        this.scrollDirection = ScrollDirection.Right
        let moveDelta = this.calculateMovePercentDelta(cc.v2(0, 0), true, false)
        if (timeInSecond > 0) {
            this.startAutoScroll(moveDelta, timeInSecond, attenuated)
        } else {
            this.moveContent(moveDelta)
        }
    }

    public scrollToRight(timeInSecond: number = 0, attenuated: boolean = true) {
        this.scrollDirection = ScrollDirection.Left
        let moveDelta = this.calculateMovePercentDelta(cc.v2(1, 0), true, false)
        if (timeInSecond > 0) {
            this.startAutoScroll(moveDelta, timeInSecond, attenuated)
        } else {
            this.moveContent(moveDelta)
        }
    }

    public start() {
        this.calculateBoundary()
        if (this.content != null) {
            cc.director.once(cc.Director.EVENT_BEFORE_DRAW, this.adjustContentOutOfBoundary, this)
        }
        if (this.cell != null) {
            this.calculateCellSizeAndCount()
        }
    }

    public onEnable() {
        if (!CC_EDITOR) {
            this.registerEvent()
            if (this.content != null) {
                this.content.on(cc.Node.EventType.SIZE_CHANGED, this.calculateBoundary, this)
                this.content.on(cc.Node.EventType.SCALE_CHANGED, this.calculateBoundary, this)
                if (this.view) {
                    this.view.on(cc.Node.EventType.POSITION_CHANGED, this.calculateBoundary, this)
                    this.view.on(cc.Node.EventType.SCALE_CHANGED, this.calculateBoundary, this)
                    this.view.on(cc.Node.EventType.SIZE_CHANGED, this.calculateBoundary, this)
                }
            }
        }
    }

    public onDisable() {
        if (!CC_EDITOR) {
            this.unregisterEvent()
            if (this.content != null) {
                this.content.off(cc.Node.EventType.SIZE_CHANGED, this.calculateBoundary, this)
                this.content.off(cc.Node.EventType.SCALE_CHANGED, this.calculateBoundary, this)
                if (this.view) {
                    this.view.off(cc.Node.EventType.POSITION_CHANGED, this.calculateBoundary, this)
                    this.view.off(cc.Node.EventType.SCALE_CHANGED, this.calculateBoundary, this)
                    this.view.off(cc.Node.EventType.SIZE_CHANGED, this.calculateBoundary, this)
                }
            }
        }
        this.stopAutoScroll()
    }

    public update(dt: number) {
        if (CC_EDITOR) {
            return
        }

        if (this.autoScrolling) {
            this.processAutoScrolling(dt)
        }

        this.updateScrollDirection()
        this.updateViewCellRender()
    }

    private quintEaseOut(time: number): number {
        time -= 1
        return (time * time * time * time * time + 1)
    }

    private processAutoScrolling(dt: number) {
        let isAutoScrollBrake = this.isNecessaryAutoScrollBrake()
        let brakingFactor = isAutoScrollBrake ? OUT_OF_BOUNDARY_BREAKING_FACTOR : 1
        this.autoScrollAccumulatedTime += dt * (1 / brakingFactor)

        let percentage = Math.min(1, this.autoScrollAccumulatedTime / this.autoScrollTotalTime)
        if (this.autoScrollAttenuate) {
            percentage = this.quintEaseOut(percentage)
        }

        let newPosition = this.autoScrollStartPosition.add(this.autoScrollTargetDelta.mul(percentage))
        let reachedEnd = Math.abs(percentage - 1) <= EPSILON
        let fireEvent = Math.abs(percentage - 1) <= EPSILON

        if (fireEvent && !this.scrollEndedWithThresholdEventFired) {
            this.dispatchEvent(EventType.AUTOSCROLL_ENDED_WITH_THRESHOLD)
            this.scrollEndedWithThresholdEventFired = true
        }

        if (this.enableElastic) {
            let brakeOffsetPosition = newPosition.sub(this.autoScrollBrakingStartPosition)
            if (isAutoScrollBrake) {
                brakeOffsetPosition = brakeOffsetPosition.mul(brakingFactor)
            }
            newPosition = this.autoScrollBrakingStartPosition.add(brakeOffsetPosition)
        } else {
            let moveDelta = newPosition.sub(this.content.getPosition())
            let outOfBoundary = this.getHowMuchOutOfBoundary(moveDelta)
            if (!outOfBoundary.fuzzyEquals(cc.v2(0, 0), EPSILON)) {
                newPosition = newPosition.add(outOfBoundary)
                reachedEnd = true
            }
        }

        if (reachedEnd) {
            this.autoScrolling = false
        }

        let deltaMove = newPosition.sub(this.content.getPosition())
        this.moveContent(this.clampDelta(deltaMove), reachedEnd)
        this.dispatchEvent(EventType.SCROLLING)

        // scollTo API controll move
        if (!this.autoScrolling) {
            this.bouncing = false
            this.scrolling = false
            this.dispatchEvent(EventType.SCROLL_ENDED)
        }
    }

    private isOutOfBoundary(): boolean {
        let outOfBoundary = this.getHowMuchOutOfBoundary()
        return !outOfBoundary.fuzzyEquals(cc.v2(0, 0), EPSILON)
    }

    private isNecessaryAutoScrollBrake(): boolean {
        if (this.autoScrollBraking) {
            return true
        }

        if (this.isOutOfBoundary()) {
            if (!this.autoScrollCurrentlyOutOfBoundary) {
                this.autoScrollCurrentlyOutOfBoundary = true
                this.autoScrollBraking = true
                this.autoScrollBrakingStartPosition = this.content.getPosition()
                return true
            }
        } else {
            this.autoScrollCurrentlyOutOfBoundary = false
        }

        return false
    }

    private init(source: any[]) {
        this.source = source

        if (!this.initializing) {
            this.initializing = true;
            // 安置到下一帧初始化是为了避免以下问题
            // 1. cc.Widget修改容器大小导致计算错误
            // 2. ViewCell是在start之后计算的，如果在start之前赋予dataSource就会计算错误
            this.scheduleOnce(this.initView)
        }
        else if (this.initialized) {
            this.refreshView()
        }
    }

    private calculateCellAndRestore() {
        // 计算数据节点总数
        this.dataNodeCount = Math.ceil(this.source.length / this.cellCount)

        switch (this.scrollModel) {
            case ScrollModel.Horizontal:
                this.content.width = this.dataNodeCount * this.cellSize.width
                this.workNodeCount = Math.ceil(this.view.width / this.cellSize.width) + 1
                if (this.workNodeCount > this.dataNodeCount) {
                    this.workNodeCount = this.dataNodeCount
                }
                this.stopAutoScroll()
                this.scrollToLeft()
                break
            case ScrollModel.Vertical:
                this.content.height = this.dataNodeCount * this.cellSize.height
                this.workNodeCount = Math.ceil(this.view.height / this.cellSize.height) + 1
                if (this.workNodeCount > this.dataNodeCount) {
                    this.workNodeCount = this.dataNodeCount
                }
                this.stopAutoScroll()
                this.scrollToTop()
                break
        }

        this.lastOffset = this.getScrollOffset()
        this.minGroupIndex = 0
        this.maxGroupIndex = this.workNodeCount - 1
    }

    private initView() {
        this.calculateCellAndRestore()

        for (let i = 0; i <= this.maxGroupIndex; i++) {
            let groupCell = this.getGroupCell()
            this.setGroupCellAttr(groupCell, i)
            this.setGroupCellPosition(groupCell, i)
            this.content.addChild(groupCell)
            this.updateGroupCell(groupCell)
        }

        this.initialized = true
    }

    private refreshView() {
        this.calculateCellAndRestore()

        for (let i = this.content.childrenCount; i <= this.maxGroupIndex; i++) {
            let groupCell = this.getGroupCell()
            this.content.addChild(groupCell)
        }
        for (let i = 0; i < this.content.childrenCount; i++) {
            let groupCell = this.content.children[i]
            groupCell.setSiblingIndex(i)
            groupCell.name = String(i)
        }
        for (let i = 0; i < this.content.childrenCount; i++) {
            let groupCell = this.content.children[i]
            this.setGroupCellPosition(groupCell, i)
            this.updateGroupCell(groupCell)
        }
    }

    public refresh() {
        for (let i = 0; i < this.content.childrenCount; i++) {
            this.updateGroupCell(this.content.children[i])
        }
    }

    private getGroupCell(): cc.Node {
        if (this.cellPool == null) {
            this.cellPool = new cc.NodePool()
        }

        if (this.cellPool.size() == 0) {
            let capacity = 0
            let groupCell = new cc.Node("iGroupCell")

            switch (this.scrollModel) {
                case ScrollModel.Horizontal:
                    for (let i = 0; i < this.cellCount; i++) {
                        var node = cc.instantiate(this.cell)
                        node.x = (node.anchorX - 0.5) * node.width
                        node.y = (this.view.height / 2) - node.height * (1 - node.anchorY) - capacity

                        let viewCell = node.getComponent(iViewCell)
                        viewCell.parent = this

                        groupCell.addChild(node)
                        capacity += node.height
                    }
                    groupCell.width = this.cellSize.width
                    groupCell.height = capacity
                    break
                case ScrollModel.Vertical:
                    for (let i = 0; i < this.cellCount; i++) {
                        let node = cc.instantiate(this.cell)
                        node.x = -(this.view.width / 2 - node.width * node.anchorX) + capacity
                        node.y = (node.anchorY - 0.5) * node.height

                        let viewCell = node.getComponent(iViewCell)
                        viewCell.parent = this

                        groupCell.addChild(node)
                        capacity += node.width
                    }
                    groupCell.width = capacity
                    groupCell.height = this.cellSize.height
                    break
            }
            this.cellPool.put(groupCell)
        }
        return this.cellPool.get()
    }

    private updateGroupCell(groupCell: cc.Node) {
        let count = groupCell.childrenCount
        let tag = Number(groupCell.name) * count

        for (let i = 0; i < count; i++) {
            let index = tag + i
            let node = groupCell.children[i]

            if (index >= this.source.length) {
                node.active = false
            } else {
                node.active = true

                let viewCell = node.getComponent(iViewCell)
                if (viewCell != null) {
                    viewCell.data = this.source[index]
                    viewCell.updateView(index)
                }
            }
        }
    }

    private setGroupCellAttr(groupCell: cc.Node, index: number) {
        if (index >= Number(groupCell.name)) {
            groupCell.setSiblingIndex(this.dataNodeCount)
        } else {
            groupCell.setSiblingIndex(0)
        }
        groupCell.name = String(index)
    }

    private setGroupCellPosition(groupCell: cc.Node, index: number) {
        switch (this.scrollModel) {
            case ScrollModel.Horizontal:
                if (index == 0) {
                    groupCell.x = -this.content.width * this.content.anchorX + groupCell.width * groupCell.anchorX
                } else {
                    groupCell.x = this.content.getChildByName(String(index - 1)).x + groupCell.width
                }
                groupCell.y = (groupCell.anchorY - this.content.anchorY) * groupCell.height

                // 设置偏移方向
                let offset = this.enableGrid ? this.view.height - groupCell.height : this.view.height % groupCell.height
                switch (this.verticalOffsetDirection) {
                    case VerticalOffsetDirection.Top:
                        groupCell.y += 0
                        break
                    case VerticalOffsetDirection.Bottom:
                        groupCell.y += -offset
                        break
                    case VerticalOffsetDirection.Center:
                        groupCell.y += -offset / 2
                        break
                }
                break
            case ScrollModel.Vertical:
                if (index == 0) {
                    groupCell.y = this.content.height * (1 - this.content.anchorY) - groupCell.height * (1 - groupCell.anchorY)
                } else {
                    groupCell.y = this.content.getChildByName(String(index - 1)).y - groupCell.height
                }
                groupCell.x = (groupCell.anchorX - this.content.anchorX) * groupCell.width

                // 设置偏移方向
                switch (this.horizontalOffsetDirection) {
                    case HorizontalOffsetDirection.Left:
                        groupCell.x += 0
                        break
                    case HorizontalOffsetDirection.Right:
                        groupCell.x += this.view.width - groupCell.width
                        break
                    case HorizontalOffsetDirection.Center:
                        let offset = (this.view.width % groupCell.width) / 2
                        if (!this.enableGrid) {
                            offset += (Math.floor(this.view.width / groupCell.width) - 1) * groupCell.width / 2
                        }
                        groupCell.x += offset
                        break
                }
                break
        }
    }

    private startAutoScroll(deltaMove: cc.Vec2, timeInSecond: number, attenuated: boolean) {
        let adjustedDeltaMove = this.flattenVectorByDirection(deltaMove)

        this.autoScrolling = true
        this.autoScrollTargetDelta = adjustedDeltaMove
        this.autoScrollAttenuate = attenuated
        this.autoScrollStartPosition = this.content.getPosition()
        this.autoScrollTotalTime = timeInSecond
        this.autoScrollAccumulatedTime = 0
        this.autoScrollBraking = false
        this.autoScrollBrakingStartPosition = cc.v2(0, 0)

        let currentOutOfBoundary = this.getHowMuchOutOfBoundary()
        if (!currentOutOfBoundary.fuzzyEquals(cc.v2(0, 0), EPSILON)) {
            this.autoScrollCurrentlyOutOfBoundary = true
        }
    }

    private stopAutoScroll() {
        this.scrollDirection = ScrollDirection.None;
        this.autoScrolling = false
        this.autoScrollAccumulatedTime = this.autoScrollTotalTime
    }

    private flattenVectorByDirection(vector: cc.Vec2): cc.Vec2 {
        switch (this.scrollModel) {
            case ScrollModel.Horizontal:
                vector.y = 0
                break
            case ScrollModel.Vertical:
                vector.x = 0
                break
        }
        return vector
    }

    private moveContent(deltaMove: cc.Vec2, canStartBounceBack: boolean = false) {
        let adjustedDeltaMove = this.flattenVectorByDirection(deltaMove)
        let newPosition = this.content.getPosition().add(adjustedDeltaMove)

        if (!newPosition.fuzzyEquals(this.content.getPosition(), EPSILON)) {
            this.content.setPosition(newPosition)
            this.outOfBoundaryAmountDirty = true
        }

        if (this.enableElastic && canStartBounceBack) {
            this.startBounceBackIfNeeded()
        }
    }

    private calculateMovePercentDelta(anchor: cc.Vec2, applyToHorizontal: boolean, applyToVertical: boolean): cc.Vec2 {
        this.calculateBoundary()

        let bottomDelta = -(this.getContentBottomBoundary() - this.bottomBoundary)
        let leftDelta = -(this.getContentLeftBoundary() - this.leftBoundary)
        let moveDelta = cc.v2(0, 0)

        anchor = anchor.clampf(cc.v2(0, 0), cc.v2(1, 1))

        if (applyToHorizontal) {
            moveDelta.x = leftDelta - (this.content.width - this.view.width) * anchor.x
        }

        if (applyToVertical) {
            moveDelta.y = bottomDelta - (this.content.height - this.view.height) * anchor.y
        }
        return moveDelta
    }

    private getHowMuchOutOfBoundary(addition: cc.Vec2 = cc.v2(0, 0)) {
        if (addition.fuzzyEquals(cc.v2(0, 0), EPSILON) && !this.outOfBoundaryAmountDirty) {
            return this.outOfBoundaryAmount
        }

        let outOfBoundaryAmount = cc.v2(0, 0)
        if (this.getContentLeftBoundary() + addition.x > this.leftBoundary) {
            outOfBoundaryAmount.x = this.leftBoundary - (this.getContentLeftBoundary() + addition.x)
        }
        else if (this.getContentRightBoundary() + addition.x < this.rightBoundary) {
            outOfBoundaryAmount.x = this.rightBoundary - (this.getContentRightBoundary() + addition.x)
        }

        if (this.getContentTopBoundary() + addition.y < this.topBoundary) {
            outOfBoundaryAmount.y = this.topBoundary - (this.getContentTopBoundary() + addition.y)
        }
        else if (this.getContentBottomBoundary() + addition.y > this.bottomBoundary) {
            outOfBoundaryAmount.y = this.bottomBoundary - (this.getContentBottomBoundary() + addition.y)
        }

        if (addition.fuzzyEquals(cc.v2(0, 0), EPSILON)) {
            this.outOfBoundaryAmount = outOfBoundaryAmount
            this.outOfBoundaryAmountDirty = false
        }

        return this.clampDelta(outOfBoundaryAmount)
    }

    private clampDelta(delta: cc.Vec2): cc.Vec2 {
        if (this.content.width < this.view.width) {
            delta.x = 0
        }
        if (this.content.height < this.view.height) {
            delta.y = 0
        }
        return delta
    }

    public dispatchEvent(ev: string, params: any = null) {
        cc.Component.EventHandler.emitEvents(this.scrollEvents, this, ev, params)
        this.node.emit(ev, this, params)
    }

    private updateScrollDirection() {
        if (!this.initialized) {
            return
        }

        let lastOffset = this.lastOffset
        let currOffset = this.getScrollOffset()

        this.lastOffset = currOffset
        currOffset = currOffset.sub(lastOffset)
        this.scrollDirection = ScrollDirection.None

        switch (this.scrollModel) {
            case ScrollModel.Horizontal:
                if (currOffset.x > 0) {
                    this.scrollDirection = ScrollDirection.Right
                }
                if (currOffset.x < 0) {
                    this.scrollDirection = ScrollDirection.Left
                }
                break
            case ScrollModel.Vertical:
                if (currOffset.y < 0) {
                    this.scrollDirection = ScrollDirection.Down
                }
                if (currOffset.y > 0) {
                    this.scrollDirection = ScrollDirection.Up
                }
                break
        }
    }

    private updateViewCellRender() {
        if (!this.initialized) {
            return
        }

        switch (this.scrollDirection) {
            case ScrollDirection.Up:
                if (this.maxGroupIndex < this.dataNodeCount - 1) {
                    let viewBox = this.getBoundingBoxToWorld(this.view)
                    do {
                        let node = this.content.getChildByName(String(this.minGroupIndex))
                        let nodeBox = this.getBoundingBoxToWorld(node)
                        if (nodeBox.yMin >= viewBox.yMax) {
                            node.y = this.content.getChildByName(String(this.maxGroupIndex)).y - node.height
                            this.minGroupIndex++
                            this.maxGroupIndex++
                            this.setGroupCellAttr(node, this.maxGroupIndex)
                            this.updateGroupCell(node)
                        } else {
                            break
                        }
                    } while (this.maxGroupIndex !== this.dataNodeCount - 1)
                }
                break
            case ScrollDirection.Down:
                if (this.minGroupIndex > 0) {
                    let viewBox = this.getBoundingBoxToWorld(this.view)
                    do {
                        let node = this.content.getChildByName(String(this.maxGroupIndex))
                        let nodeBox = this.getBoundingBoxToWorld(node)
                        if (nodeBox.yMax <= viewBox.yMin) {
                            node.y = this.content.getChildByName(String(this.minGroupIndex)).y + node.height
                            this.minGroupIndex--
                            this.maxGroupIndex--
                            this.setGroupCellAttr(node, this.minGroupIndex)
                            this.updateGroupCell(node)
                        } else {
                            break
                        }
                    } while (this.minGroupIndex !== 0)
                }
                break
            case ScrollDirection.Left:
                if (this.maxGroupIndex < this.dataNodeCount - 1) {
                    let viewBox = this.getBoundingBoxToWorld(this.view)
                    do {
                        let node = this.content.getChildByName(String(this.minGroupIndex))
                        let nodeBox = this.getBoundingBoxToWorld(node)
                        if (nodeBox.xMax <= viewBox.xMin) {
                            node.x = this.content.getChildByName(String(this.maxGroupIndex)).x + node.width
                            this.minGroupIndex++
                            this.maxGroupIndex++
                            this.setGroupCellAttr(node, this.maxGroupIndex)
                            this.updateGroupCell(node)
                        } else {
                            break
                        }
                    } while (this.maxGroupIndex !== this.dataNodeCount - 1)
                }
                break
            case ScrollDirection.Right:
                if (this.minGroupIndex > 0) {
                    let viewBox = this.getBoundingBoxToWorld(this.view)
                    do {
                        let node = this.content.getChildByName(String(this.maxGroupIndex))
                        let nodeBox = this.getBoundingBoxToWorld(node)
                        if (nodeBox.xMin >= viewBox.xMax) {
                            node.x = this.content.getChildByName(String(this.minGroupIndex)).x - node.width
                            this.minGroupIndex--
                            this.maxGroupIndex--
                            this.setGroupCellAttr(node, this.minGroupIndex)
                            this.updateGroupCell(node)
                        } else {
                            break
                        }
                    } while (this.minGroupIndex !== 0)
                }
                break
        }
    }

    private getBoundingBoxToWorld(node: cc.Node): cc.Rect {
        let pos = node.convertToWorldSpaceAR(cc.v2(
            -node.getAnchorPoint().x * node.width,
            -node.getAnchorPoint().y * node.height
        ))
        return cc.rect(pos.x, pos.y, node.width, node.height)
    }

    private calculateBoundary() {
        if (this.content == null) {
            return
        }

        let viewSize = this.view.getContentSize()

        let anchorX = viewSize.width * this.view.anchorX
        let anchorY = viewSize.height * this.view.anchorY

        this.leftBoundary = -anchorX
        this.bottomBoundary = -anchorY
        this.rightBoundary = this.leftBoundary + viewSize.width
        this.topBoundary = this.bottomBoundary + viewSize.height

        this.moveContentToTopLeft(viewSize)
    }

    private getScrollOffset(): cc.Vec2 {
        let topDelta = this.getContentTopBoundary() - this.topBoundary
        let leftDelta = this.getContentLeftBoundary() - this.leftBoundary
        return cc.v2(leftDelta, topDelta)
    }

    private getContentLeftBoundary(): number {
        let contentPos = this.content.getPosition()
        return contentPos.x - this.content.getAnchorPoint().x * this.content.getContentSize().width
    }

    private getContentRightBoundary(): number {
        let contentSize = this.content.getContentSize()
        return this.getContentLeftBoundary() + contentSize.width
    }

    private getContentTopBoundary(): number {
        let contentSize = this.content.getContentSize()
        return this.getContentBottomBoundary() + contentSize.height
    }

    private getContentBottomBoundary(): number {
        let contentPos = this.content.getPosition()
        return contentPos.y - this.content.getAnchorPoint().y * this.content.getContentSize().height
    }

    private registerEvent() {
        if (this.enableTouchEvent) {
            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this, true)
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this, true)
            this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this, true)
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancelled, this, true)
            this.node.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this, true)
        }
    }

    private unregisterEvent() {
        if (this.enableTouchEvent) {
            this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this, true)
            this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this, true)
            this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this, true)
            this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancelled, this, true)
            this.node.off(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this, true)
        }
    }

    private onTouchBegan(ev: cc.Event.EventTouch, captureListeners: cc.Node[]) {
        if (!this.enabledInHierarchy) {
            return
        }
        if (this.hasNestedViewGroup(ev, captureListeners)) {
            return
        }

        if (this.content != null) {
            this.handlePressLogic()
        }

        this.touchMoved = false
        this.stopPropagationIfTargetIsMe(ev)
    }

    private onTouchMoved(ev: cc.Event.EventTouch, captureListeners: cc.Node[]) {
        if (!this.enabledInHierarchy) {
            return
        }
        if (this.hasNestedViewGroup(ev, captureListeners)) {
            return
        }

        let touch = ev.touch
        if (this.content != null) {
            this.handleMoveLogic(touch)
        }

        // let deltaMove = touch.getLocation().sub(touch.getStartLocation())
        // // FIXME: touch move delta should be calculated by DPI.
        // if (deltaMove.mag() > 7) {
        //     if (!this.touchMoved && ev.target !== this.node) {
        //         // Simulate touch cancel for target node
        //         let cancelEvent = new cc.Event.EventTouch(ev.getTouches(), ev.bubbles)
        //         cancelEvent.type = cc.Node.EventType.TOUCH_CANCEL
        //         cancelEvent.touch = touch
        //         ev.target.dispatchEvent(cancelEvent)
        //         this.touchMoved = true
        //     }
        // }
        this.stopPropagationIfTargetIsMe(ev)
    }

    private onTouchEnded(ev: cc.Event.EventTouch, captureListeners: cc.Node[]) {
        if (!this.enabledInHierarchy) {
            return
        }
        if (this.hasNestedViewGroup(ev, captureListeners)) {
            return
        }

        this.dispatchEvent(EventType.TOUCH_UP)

        let touch = ev.touch
        if (this.content != null) {
            this.handleReleaseLogic(touch)
        }

        if (this.touchMoved) {
            ev.stopPropagation()
        } else {
            this.stopPropagationIfTargetIsMe(ev)
        }
    }

    private onTouchCancelled(ev: cc.Event.EventTouch, captureListeners: cc.Node[]) {
        if (!this.enabledInHierarchy) {
            return
        }
        if (this.hasNestedViewGroup(ev, captureListeners)) {
            return
        }

        let touch = ev.touch
        if (this.content != null) {
            this.handleReleaseLogic(touch)
        }
        this.stopPropagationIfTargetIsMe(ev)
    }

    private onMouseWheel(ev: cc.Event.EventMouse, captureListeners: cc.Node[]) {
        if (!this.enabledInHierarchy) {
            return
        }
        if (this.hasNestedViewGroup(ev, captureListeners)) {
            return
        }

        let deltaMove = cc.v2(0, 0)
        let wheelPrecision = -0.1
        if (CC_JSB || CC_RUNTIME) {
            wheelPrecision = -7
        }

        switch (this.scrollModel) {
            case ScrollModel.Horizontal:
                deltaMove = cc.v2(ev.getScrollY() * wheelPrecision, 0)
                break
            case ScrollModel.Vertical:
                deltaMove = cc.v2(0, ev.getScrollY() * wheelPrecision)
                break
        }

        this.mouseWheelEventElapsedTime = 0
        this.processDeltaMove(deltaMove)

        if (!this.stopMouseWheel) {
            this.handlePressLogic()
            this.schedule(this.checkMouseWheel, 1.0 / 60)
            this.stopMouseWheel = true
        }

        this.stopPropagationIfTargetIsMe(ev)
    }

    private hasNestedViewGroup(ev: cc.Event, captureListeners: cc.Node[]): boolean {
        if (ev.eventPhase != cc.Event.CAPTURING_PHASE) {
            return false
        }

        if (captureListeners != null) {
            for (let i = 0; i < captureListeners.length; i++) {
                let item = captureListeners[i]

                if (this.node == item) {
                    let tableView = ev.target.getComponent(iTableView)
                    if (tableView != null && tableView.enableTouchEvent) {
                        return true
                    }
                    return false
                }

                let tableView = item.getComponent(iTableView)
                if (tableView != null && tableView.enableTouchEvent) {
                    return true
                }
            }
        }
        return false
    }

    private checkMouseWheel(dt: number) {
        let currentOutOfBoundary = this.getHowMuchOutOfBoundary()
        let maxElapsedTime = 0.1

        if (!currentOutOfBoundary.fuzzyEquals(cc.v2(0, 0), EPSILON)) {
            this.processInertiaScroll()
            this.unschedule(this.checkMouseWheel)
            this.dispatchEvent(EventType.SCROLL_ENDED)
            this.stopMouseWheel = false
            return
        }

        this.mouseWheelEventElapsedTime += dt

        // mouse wheel event is ended
        if (this.mouseWheelEventElapsedTime > maxElapsedTime) {
            this.unschedule(this.checkMouseWheel)
            this.dispatchEvent(EventType.SCROLL_ENDED)
            this.stopMouseWheel = false
        }
    }

    private handlePressLogic() {
        if (this.autoScrolling) {
            this.dispatchEvent(EventType.SCROLL_ENDED)
        }
        this.autoScrolling = false
        this.bouncing = false

        this.touchMovePreviousTimestamp = new Date().getMilliseconds()
        this.touchMoveDisplacements.length = 0
        this.touchMoveTimeDeltas.length = 0
    }

    private handleMoveLogic(touch: cc.Touch) {
        let deltaMove = this.getLocalAxisAlignDelta(touch)
        this.processDeltaMove(deltaMove)
    }

    private handleReleaseLogic(touch: cc.Touch) {
        let delta = this.getLocalAxisAlignDelta(touch)
        this.gatherTouchMove(delta)
        this.processInertiaScroll()
        if (this.scrolling) {
            this.scrolling = false
            if (!this.autoScrolling) {
                this.dispatchEvent(EventType.SCROLL_ENDED)
            }
        }
    }

    private processDeltaMove(deltaMove: cc.Vec2) {
        this.scrollChildren(deltaMove)
        this.gatherTouchMove(deltaMove)
    }

    private processInertiaScroll() {
        let bounceBackStarted = this.startBounceBackIfNeeded()
        if (!bounceBackStarted) {
            let touchMoveVelocity = this.calculateTouchMoveVelocity()
            if (!touchMoveVelocity.fuzzyEquals(cc.v2(0, 0), EPSILON)) {
                this.startInertiaScroll(touchMoveVelocity)
            }
        }
    }

    private scrollChildren(deltaMove: cc.Vec2) {
        let realMove = this.clampDelta(deltaMove)
        if (this.enableElastic) {
            let outOfBoundary = this.getHowMuchOutOfBoundary()
            realMove.x *= outOfBoundary.x === 0 ? 1 : 0.5
            realMove.y *= outOfBoundary.y === 0 ? 1 : 0.5
        } else {
            let outOfBoundary = this.getHowMuchOutOfBoundary(realMove)
            realMove = realMove.add(outOfBoundary)
        }

        let scrollEventType = ""
        // up
        if (realMove.y > 0) {
            let icBottomPos = this.content.y - this.content.anchorY * this.content.height
            if (icBottomPos + realMove.y >= this.bottomBoundary) {
                scrollEventType = EventType.SCROLL_TO_BOTTOM
            }
        }
        // down
        else if (realMove.y < 0) {
            let icTopPos = this.content.y - this.content.anchorY * this.content.height + this.content.height
            if (icTopPos + realMove.y <= this.topBoundary) {
                scrollEventType = EventType.SCROLL_TO_TOP
            }
        }
        // left
        if (realMove.x < 0) {
            let icRightPos = this.content.x - this.content.anchorX * this.content.width + this.content.width
            if (icRightPos + realMove.x <= this.rightBoundary) {
                scrollEventType = EventType.SCROLL_TO_RIGHT
            }
        }
        // right
        else if (realMove.x > 0) {
            let icLeftPos = this.content.x - this.content.anchorX * this.content.width
            if (icLeftPos + realMove.x >= this.leftBoundary) {
                scrollEventType = EventType.SCROLL_TO_LEFT
            }
        }

        this.moveContent(realMove, false)

        if (realMove.x !== 0 || realMove.y !== 0) {
            if (!this.scrolling) {
                this.scrolling = true
                this.dispatchEvent(EventType.SCROLL_BEGAN)
            }
            this.dispatchEvent(EventType.SCROLLING)
        }

        if (scrollEventType !== "") {
            this.dispatchEvent(scrollEventType)
        }
    }

    private gatherTouchMove(deltaMove: cc.Vec2) {
        deltaMove = this.clampDelta(deltaMove)

        while (this.touchMoveDisplacements.length >= NUMBER_OF_GATHERED_TOUCHES_FOR_MOVE_SPEED) {
            this.touchMoveDisplacements.shift()
            this.touchMoveTimeDeltas.shift()
        }

        this.touchMoveDisplacements.push(deltaMove)

        let timeStamp = new Date().getMilliseconds()
        this.touchMoveTimeDeltas.push((timeStamp - this.touchMovePreviousTimestamp) / 1000)
        this.touchMovePreviousTimestamp = timeStamp
    }

    private getLocalAxisAlignDelta(touch: cc.Touch): cc.Vec2 {
        this.node.convertToNodeSpaceAR(touch.getLocation(), this.tempPoint)
        this.node.convertToNodeSpaceAR(touch.getPreviousLocation(), this.tempPrevPoint)
        return this.tempPoint.sub(this.tempPrevPoint)
    }

    private startBounceBackIfNeeded(): boolean {
        if (!this.enableElastic) {
            return false
        }

        let bounceBackAmount = this.getHowMuchOutOfBoundary()
        bounceBackAmount = this.clampDelta(bounceBackAmount)

        if (bounceBackAmount.fuzzyEquals(cc.v2(0, 0), EPSILON)) {
            return false
        }

        let bounceBackTime = Math.max(this.bounceDuration, 0)
        this.startAutoScroll(bounceBackAmount, bounceBackTime, true)

        if (!this.bouncing) {
            if (bounceBackAmount.y > 0) this.dispatchEvent(EventType.BOUNCE_TOP)
            if (bounceBackAmount.y < 0) this.dispatchEvent(EventType.BOUNCE_BOTTOM)
            if (bounceBackAmount.x > 0) this.dispatchEvent(EventType.BOUNCE_RIGHT)
            if (bounceBackAmount.x < 0) this.dispatchEvent(EventType.BOUNCE_LEFT)
            this.bouncing = true
        }
        return true
    }

    private stopPropagationIfTargetIsMe(ev: cc.Event) {
        if (ev.eventPhase === cc.Event.AT_TARGET && ev.target === this.node) {
            ev.stopPropagation()
        }
    }

    private startInertiaScroll(touchMoveVelocity: cc.Vec2) {
        let inertiaTotalMovement = touchMoveVelocity.mul(MOVEMENT_FACTOR)
        this.startAttenuatingAutoScroll(inertiaTotalMovement, touchMoveVelocity)
    }

    private calculateTouchMoveVelocity(): cc.Vec2 {
        let totalTime = this.touchMoveTimeDeltas.reduce(function (a, b) {
            return a + b;
        }, 0)

        if (totalTime <= 0 || totalTime >= 0.5) {
            return cc.v2(0, 0)
        }

        let totalMovement = this.touchMoveDisplacements.reduce(function (a, b) {
            return a.add(b)
        }, cc.v2(0, 0))

        return cc.v2(totalMovement.x * (1 - BRAKE) / totalTime, totalMovement.y * (1 - BRAKE) / totalTime)
    }

    private calculateAttenuatedFactor(distance: number): number {
        if (BRAKE <= 0) {
            return (1 - BRAKE)
        }

        return (1 - BRAKE) * (1 / (1 + distance * 0.000014 + distance * distance * 0.000000008))
    }

    private startAttenuatingAutoScroll(deltaMove, initialVelocity) {
        let time = this.calculateAutoScrollTimeByInitalSpeed(initialVelocity.mag())

        let targetDelta = deltaMove.normalize()
        let contentSize = this.content.getContentSize()
        let scrollviewSize = this.view.getContentSize()

        let totalMoveWidth = (contentSize.width - scrollviewSize.width)
        let totalMoveHeight = (contentSize.height - scrollviewSize.height)

        let attenuatedFactorX = this.calculateAttenuatedFactor(totalMoveWidth)
        let attenuatedFactorY = this.calculateAttenuatedFactor(totalMoveHeight)

        targetDelta = cc.v2(targetDelta.x * totalMoveWidth * (1 - BRAKE) * attenuatedFactorX, targetDelta.y * totalMoveHeight * attenuatedFactorY * (1 - BRAKE))

        let originalMoveLength = deltaMove.mag()
        let factor = targetDelta.mag() / originalMoveLength
        targetDelta = targetDelta.add(deltaMove)

        if (BRAKE > 0 && factor > 7) {
            factor = Math.sqrt(factor)
            targetDelta = deltaMove.mul(factor).add(deltaMove)
        }

        if (BRAKE > 0 && factor > 3) {
            factor = 3;
            time = time * factor
        }

        if (BRAKE === 0 && factor > 1) {
            time = time * factor
        }

        this.startAutoScroll(targetDelta, time, true)
    }

    private calculateAutoScrollTimeByInitalSpeed(initalSpeed: number): number {
        return Math.sqrt(Math.sqrt(initalSpeed / 5))
    }

    private adjustContentOutOfBoundary() {
        this.outOfBoundaryAmountDirty = true
        if (this.isOutOfBoundary()) {
            let outOfBoundary = this.getHowMuchOutOfBoundary(cc.v2(0, 0))
            let newPosition = this.content.getPosition().add(outOfBoundary)
            if (this.content != null) {
                this.content.setPosition(newPosition)
            }
        }
    }

    private moveContentToTopLeft(viewSize: cc.Size) {
        let contentSize = this.content.getContentSize()

        let bottomDeta = this.getContentBottomBoundary() - this.bottomBoundary
        bottomDeta = -bottomDeta
        let moveDelta = cc.v2(0, 0)
        let leftDelta = -(this.getContentLeftBoundary() - this.leftBoundary)

        if (contentSize.height < viewSize.height) {
            moveDelta.y = bottomDeta - contentSize.height - viewSize.height
        }

        if (contentSize.width < viewSize.width) {
            moveDelta.x = leftDelta
        }

        this.moveContent(moveDelta)
        this.adjustContentOutOfBoundary()
    }

    private calculateCellSizeAndCount() {
        if (this.cell == null) {
            return
        }

        let viewCell = cc.instantiate(this.cell)
        let count = 1

        if (this.enableGrid) {
            switch (this.scrollModel) {
                case ScrollModel.Horizontal:
                    count = Math.floor(this.view.height / viewCell.height)
                    break
                case ScrollModel.Vertical:
                    count = Math.floor(this.view.width / viewCell.width)
                    break
            }
        }

        this.cellSize = cc.size(viewCell.width, viewCell.height)
        this.cellCount = count
    }
}
