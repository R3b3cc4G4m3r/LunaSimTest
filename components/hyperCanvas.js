import { Component } from "./component.js"
import { ContextManager } from "./contextManager.js"
import { Background } from "./background.js"

class HyperCanvas {
    constructor(canvas, frameRate) {
        this.canvas = canvas;
        this.context = new ContextManager(canvas.getContext('2d'));
        this.periodicTasks = {};
        this.features = {};
        this.globalTick = 0;
        this.pageOffsetY = 55; // adds offset to canvas to account for header
        this.frameRate = frameRate
        this.menu = {}
        this.menuUsage = 0
        this.state = {
            env_name: "untitled",
            dt: "0.1",
            end_time: "10",
            integration_method: "euler",
            start_time: "0"
        }
        this.background = new Background(Date.now(), this)
        this.latest = {}
    }

    // TODO: Get data from a page manager
    getData() {
        this.data = {
            stocks: {},
            converters: {},
            integration_method: this.state.integration_method,
            dt: this.state.dt,
            end_time: this.state.end_time,
            env_name: this.state.env_name,
            start_time: this.state.start_time,
            names: Component.name,
            state: {
                stock: [],
                flow: [],
                converter: [],
                connector: []
            }
        }

        for (const feature of Object.keys(this.features)){
            if (this.features[feature].feature.type == "stock" && !this.features[feature].feature.state.deleted){
                var stockData = {
                    name: this.features[feature].feature.state.metadata.name,
                    equation: this.features[feature].feature.state.metadata.equation,
                    inflows: {},
                    outflows: {},
                    isNN: this.features[feature].feature.state.metadata.stockType,
                    values: []
                }

                try {
                    var addingEq = ""
                    if (this.getFeature(this.features[feature].feature.state.flows.left).state.metadata.flowType){
                        addingEq = "#"
                    }
                    stockData.inflows[this.getFeature(this.features[feature].feature.state.flows.left).state.metadata.name] = {
                        name: this.getFeature(this.features[feature].feature.state.flows.left).state.metadata.name,
                        values: [],
                        equation: addingEq + this.getFeature(this.features[feature].feature.state.flows.left).state.metadata.equation
                    }
                        
                } catch (e) {}

                try {
                    var addingEq = ""
                    if (this.getFeature(this.features[feature].feature.state.flows.right).state.metadata.flowType){
                        addingEq = "#"
                    }

                    stockData.outflows[this.getFeature(this.features[feature].feature.state.flows.right).state.metadata.name] = {
                        name: this.getFeature(this.features[feature].feature.state.flows.right).state.metadata.name,
                        values: [],
                        equation: addingEq + this.getFeature(this.features[feature].feature.state.flows.right).state.metadata.equation
                    }
                } catch (e) {}
                
                this.data.stocks[this.features[feature].feature.state.metadata.name] = stockData

                this.data.state.stock.push(this.features[feature].feature.state)
            }
            else if (this.features[feature].feature.type == "converter"){
                this.data.converters[this.features[feature].feature.state.metadata.name] = {
                    name: this.features[feature].feature.state.metadata.name,
                    values: [],
                    equation: this.features[feature].feature.state.metadata.equation
                }
                this.data.state.converter.push(this.features[feature].feature.state)
            }
            else {
                if (!this.features[feature].feature.state.deleted){
                    this.data.state[this.features[feature].feature.type].push(this.features[feature].feature.state)
                }
            }
        }

        return this.data
    }

    get size() {
        return [this.canvas.width, this.canvas.height];
    }

    set size(sizing) {
        this.canvas.width = sizing[0]
        this.canvas.height = sizing[1]
    }

    // get every widget reference and return it to the calling function
    getType(type){
        var metadata = {}
        var features = Object.keys(this.features);
        for (const feature of features){
            if (this.features[feature].feature.type == type && this.features[feature].feature.state.deleted == false){
                metadata[feature] = this.features[feature]
            }
        }
        return(metadata)
    }

    getFeature(name){
        var features = Object.keys(this.features);
        for (const feature of features){
            try {
                if (this.features[feature].feature.state.metadata.name == name){
                    return this.features[feature].feature
                }
            } catch (e) {console.log(e)}
        }
    }

    // periodic functions for the calling of added functions to periodic runner
    runPeriodic() {
        this.globalTick++;
        var keys = Object.keys(this.periodicTasks);

        for (const priority of [1, 2, 3, 4, 5]){
            for (const key of keys){
                if (this.globalTick % this.periodicTasks[key].tick == 0 && this.periodicTasks[key].priority == priority) {
                    this.periodicTasks[key].callback.apply(null, this.periodicTasks[key].args)
                }
            }
        }
    }

    setPeriodic(name, callback, tick, priority, ...args) {
        this.periodicTasks[name] = {
            callback : callback,
            tick : tick,
            priority: priority,
            args : [].slice.call(arguments, 3) // removes the first three arguments of setPeriodic function
        };
    }

    // calling all validation functions to see if input if for feature
    detectedInput(event, listener) {

        if (Object.values(this.latest).length > 0 && event.type == "mousedown"){
            this.addFeature(this.latest.feature, this.latest.drawable, this.latest.priority, true)
            this.latest = {}
        }

        var eventInfo = {
            x : event.pageX - this.context.xOffset,
            y : event.pageY - this.pageOffsetY - this.context.yOffset,
            rawX: event.pageX,
            rawY: event.pageY,
            type : listener
        }

        var creation = false

        
        for (const key of Object.keys(this.features)){
            if (this.features[key].feature.state.creation  && this.features[key].feature.validate(eventInfo)){
                this.features[key].feature.input(eventInfo)
                creation = true
            }
        }
        if (!creation){
            for (const key of Object.keys(this.features)){
                if (this.features[key].feature.validate(eventInfo)){
                    this.features[key].feature.input(eventInfo)
                    creation = true
                } 
            }
        }

        if (!creation) {
            if (this.background.validate(eventInfo)){
                this.background.input(eventInfo)
            }
        }

    }

    //add feature to setPeriodic and detectedInput loop
    addFeature(feature, drawable = true, priority = 3, internal = false) {
        //todo: determine if redundant keys are useful here (Callback functions, Ans: maybe if method name changes in 2.x)
        //todo: setup id/name system

        if (internal) {
            this.features[feature.name] = {
                feature : feature,
                verifyCallback : feature.validate,
                inputCallback : feature.input,
                drawCallback : feature.draw,
                createdSignal : feature.created
            }
            
            if (drawable){
                var self = this
                this.setPeriodic(feature.name + ".draw", function () { self.features[feature.name].feature.draw(self.context)}, 1, priority)
            }
        }
        else {
            console.log("test")
            this.latest = {
                feature : feature,
                drawable: drawable,
                priority: priority
            }
        }

        console.log(this.features)
    }

    // start periodic and add interval tasks
    initialize() {
        var self = this;
        setInterval(function () { self.runPeriodic() }, 1000/this.frameRate)
        this.setPeriodic("canvas.clear", function () {
            self.canvas.width += 0
            self.background.draw(self.context)
        }, 1, 1)

        this.size = [
            window.innerWidth,
            window.innerHeight-this.pageOffsetY
        ]

        this.canvas.addEventListener("mousedown", function (event) {self.detectedInput(event, "mousedown")})
        this.canvas.addEventListener("mousemove", function (event) {self.detectedInput(event, "mousemove")})
        this.canvas.addEventListener("click", function (event) {self.detectedInput(event, "click")})
        this.canvas.addEventListener("keydown", function (event) {
            if (["KeyE", "Backspace"].includes(event.code) && self.menuUsage == 0){
                self.detectedInput(event, event.code)

            }
        })

        this.setPeriodic("menu.used", function () {
            self.menuUsage = 0
            for (const value of Object.values(self.menu)){
                self.menuUsage += value.state.using
            }
        }, 1)

    }

    getMenuText(feature){
        this.menu[feature.type].getInfo(feature)
    }

    save() {

    }

}

export { HyperCanvas };