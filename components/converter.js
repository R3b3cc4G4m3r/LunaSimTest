class Converter {
    constructor(name, hyperCanvas){
        this.name = name
        this.type = "converter"
        this.hyperCanvas = hyperCanvas
        this.state = {
            x : 0,
            y : 0,
            rx : 0,
            ry : 0,
            r : 10,
            prevInteraction : {
                x : 0,
                y : 0,
            },
            creation : true,
            created : false,
            selected : false,
            resize : false,
            move : false,
            metadata : {
                name : "",
                equation : ""
            },
            center : {
                x: null,
                y: null
            }
        }
    }

    validate(event, hitbox=false){
        var isValidated = false

        if (event.type == "KeyE"){
            if (this.state.selected == true){
                console.log(this.state.metadata)
                this.hyperCanvas.getMenuText(this)
            } 
        }
        if (event.type == "mousedown"){
            if (this.state.creation){
                isValidated = true
            }
            else if ((this.boundingBox(this.state.x+this.state.rx-10, this.state.y+this.state.ry-10, 20, 20, [event.x, event.y])) && 
                (this.state.selected)){
                
                if (!hitbox){
                    this.state.resize = true
                }
                isValidated = true
            }
            else if ((this.boundingBox(this.state.x-this.state.r, this.state.y-this.state.r, 2*this.state.r, 2*this.state.r, [event.x, event.y]))){
                if (!hitbox){
                    if (this.state.selected){
                        this.state.move = true
                        this.cache(event)
                        //console.log(this.state)
                    }
                    this.state.selected = true
                }
                isValidated = true
            }
            else {
                if (!hitbox){
                    this.state.selected = false
                }
            }
        }
        else if (event.type == "mousemove"){
            if (this.state.resize || this.state.move){
                isValidated = true
            }
        }
        else if (event.type == "click"){
            if (this.state.resize){
                this.state.resize = false
            }
            this.state.move = false
            isValidated = true
            if (this.state.created == true){
                this.state.created = false
                this.hyperCanvas.getMenuText(this)
            }
        }
        if (isValidated){
            return true
        }
    }

    input(event) {
        if (this.state.creation){
            this.state.x = event.x
            this.state.y = event.y
            this.state.center.x = this.state.x
            this.state.center.y = this.state.y
            this.state.creation = false
            this.state.resize = true
            this.state.created = true
        }
        else if (this.state.resize){
            this.state.rx = event.x - this.state.x
            this.state.ry = event.y - this.state.y
            this.state.r = Math.sqrt(Math.pow(this.state.rx, 2) + Math.pow(this.state.ry, 2))
        }
        else if (this.state.move){
            this.state.x += event.x - this.state.prevInteraction.x
            this.state.y += event.y - this.state.prevInteraction.y
            this.state.center.x = this.state.x
            this.state.center.y = this.state.y
        }

        this.cache(event)
    }

    cache(event) {
        this.state.prevInteraction.x = event.x
        this.state.prevInteraction.y = event.y
    }

    draw(context){
        if (this.state.creation == false){
            context.beginPath()
            context.strokeSt
            context.arc(this.state.x, this.state.y, this.state.r, 0, 2 * Math.PI, false)
            context.fillStyle = "white"
            context.fill()
            context.lineWidth = 5
            context.stroke()

            if (this.state.selected){
                context.beginPath()
                context.strokeStyle = "rgb(0, 0, 125)"
                context.fillStyle = "rgb(0, 0, 125)"
                context.fillRect(this.state.x+this.state.rx-10, this.state.y+this.state.ry-10, 20, 20)
                //context.fillRect(this.state.x-10, this.state.y-10, 20, 20)
                context.stroke()
            }

            context.font = '18px verdana';
            context.fillStyle = "rgb(0, 0, 125)"
            context.fillText(this.state.metadata.name, this.state.x - this.state.metadata.name.length*5, this.state.y+this.state.r+35)
            
        }
    }

    boundingBox(x, y, a, b, point){
        if (x + a < x){
            x = x + a
            a = Math.abs(a)
        }
        if (y + b < y){
            y = y + b
            b = Math.abs(b)
        }
        if ((x <= point[0] && point[0] <= x+a)&&
            (y <= point[1] && point[1] <= y+b)){
                return true
        }
    }
}

export { Converter };