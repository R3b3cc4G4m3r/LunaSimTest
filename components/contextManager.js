export class ContextManager {
    constructor(context){
        this.context = context
        this.strokeStyle = ""
        this.fillStyle = ""
        this.font = ""
        this.lineWidth = 0
        this.xOffset = 0
        this.yOffset = 0
    }

    set strokeStyle(style) {
        this.context.strokeStyle = style
        this._strokeStyle = style
    }

    set fillStyle(style) {
        this.context.fillStyle = style
        this._fillStyle = style
    }

    set lineWidth(width) {
        this.context.lineWidth = width
        this._lineWidth = width
    }

    beginPath(){
        this.context.beginPath()
    }

    roundRect(x, y, a, b, r){
        this.context.roundRect(x+this.xOffset, y+this.yOffset, a, b, r)
    }

    fill() {
        this.context.fill()
    }

    stroke() {
        this.context.stroke()
    }

    set font(settings) {
        this.context.font = settings
        this._font = settings
    }

    fillText(t, x, y) {
        this.context.fillText(t, x + this.xOffset, y + this.yOffset)
    }

    moveTo(x, y){
        this.context.moveTo(x+this.xOffset, y+this.yOffset)
    }

    lineTo(x, y){
        this.context.lineTo(x+this.xOffset, y+this.yOffset)
    }

    arc(x, y, r, start, end, isCC){
        this.context.arc(x+this.xOffset, y+this.yOffset, r, start, end, isCC)
    }

}