//Create a Pixi Application
const WIDTH = 20
const COL = 20
const ROW = 30

let app = new PIXI.Application({width: WIDTH * 2 * COL, height: WIDTH * ROW, antialias: true});
app.renderer.backgroundColor = 0x061639
document.body.appendChild(app.view);

class Pentomino {
    constructor() {
        //randomly create a shape
        this.penta = []

        this.state_dict = {1: [[-2, 2], [-1, 1], [0, 0], [1, -1], [2, -2]], 2: [[2, -2], [1, -1], [0, 0], [-1, 1], [-2, 2]]}
        this.state_num = 2
        this.curr_state = 1
        let piece1 = new PIXI.Graphics()
        this.fillShape(piece1, 2 * WIDTH, 0)
        this.penta.push(piece1)

        let piece2 = new PIXI.Graphics()
        this.fillShape(piece2, 2 * WIDTH, WIDTH)
        this.penta.push(piece2)

        let piece3 = new PIXI.Graphics()
        this.fillShape(piece3, 2 * WIDTH, 2 * WIDTH)
        this.penta.push(piece3)

        let piece4 = new PIXI.Graphics()
        this.fillShape(piece4, 2 * WIDTH, 3 * WIDTH)
        this.penta.push(piece4)

        let piece5 = new PIXI.Graphics()
        this.fillShape(piece5, 2 * WIDTH, 4 * WIDTH)
        this.penta.push(piece5)

        this.bindListener = this.keyPress.bind(this);
        window.addEventListener('keydown', this.bindListener);

    }

    keyPress(e) {
        switch (e.key) {
            case "ArrowLeft":
                let outOfBound = false
                for (let i = 0; i < this.penta.length; i++) {
                    if (this.penta[i].x - WIDTH < 0) {
                        outOfBound = true
                        break;
                    }
                }
                if (!outOfBound) {
                    for (let i = 0; i < this.penta.length; i++) {
                        this.penta[i].x -= WIDTH
                    }
                }
                break;
            case "ArrowRight":
                for (let i = 0; i < this.penta.length; i++) {
                    if (this.penta[i].x + WIDTH > (COL - 1) * WIDTH) {
                        break;
                    }
                }
                for (let i = 0; i < this.penta.length; i++) {
                    this.penta[i].x += WIDTH
                }
                break;
            case "ArrowUp":

                for (let i = 0; i < this.penta.length; i++) {
                    this.penta[i].x += this.state_dict[this.curr_state][i][0] * WIDTH;
                    this.penta[i].y += this.state_dict[this.curr_state][i][1] * WIDTH;
                }

                this.curr_state = this.curr_state % this.state_num + 1
                break;
        }
    }


    removeListener() {
        window.removeEventListener('keydown', this.bindListener);
    }

    fillShape(shape, x, y) {
        shape.beginFill(0xffd900);
        shape.lineStyle(2, 0xFFFFFF, 1);
        shape.drawRect(0, 0, WIDTH, WIDTH);
        shape.endFill();
        shape.x = x;
        shape.y = y;
    }


    moveDown() {
        for (let i = 0; i < this.penta.length; i++) {
            this.penta[i].y += WIDTH
        }
    }


}


class Game {
    constructor() {
        this.position = []
        for (let i = 0; i < ROW; i++) {
            let temp = []
            for (let j = 0; j < COL; j++) {
                temp.push(0)
            }
            this.position.push(temp)
        }

        this.pentomino = new Pentomino();
        this.holder = new PIXI.Container();

        for (let i = 0; i < this.pentomino.penta.length; i++) {
            this.holder.addChild(this.pentomino.penta[i]);
        }

        app.stage.addChild(this.holder);

    }

    clearPositionMatrix() {
        for (let i = 0; i < ROW; i++) {
            for (let j = 0; j < COL; j++) {
                this.position[i][j] = 0
            }
        }
    }

    moveDown() {
        this.pentomino.moveDown();
    }

    finalAdjustAndCreate() {
        for (let j = 0; j < this.pentomino.penta.length; j++) {
            let x = this.pentomino.penta[j].x
            let y = this.pentomino.penta[j].y

            this.position[y / WIDTH][x / WIDTH] = 1
        }

        //clear lines
        this.clearLine();

        this.pentomino.removeListener();
        this.pentomino = new Pentomino();
        for (let i = 0; i < this.pentomino.penta.length; i++) {
            this.holder.addChild(this.pentomino.penta[i]);
        }
    }


    clearLine() {

        for (let i = ROW - 1; i >= 0; i--) {
            let ones = 0
            for (let j = 0; j < COL; j++) {
                if (this.position[i][j] === 1) {
                    ones += 1
                }
            }

            if (ones === COL) {
                // clear i row and move down everything above row i
                this.clearPositionMatrix();
                for (let j = 0; j < this.holder.children.length; j++) {
                    if (this.holder.children[j].y === WIDTH * i) {
                        this.holder.removeChild(this.holder.children[j])
                        j -= 1
                    } else {
                        if (this.holder.children[j].y < WIDTH * i) {
                            this.holder.children[j].y += WIDTH
                        }
                        this.position[this.holder.children[j].y / WIDTH][this.holder.children[j].x / WIDTH] = 1
                    }
                }
                i += 1
            }

        }
        // console.log(this.position)
    }

    collide() {
        for (let i = 0; i < this.pentomino.penta.length; i++) {
            let x = this.pentomino.penta[i].x
            let y = this.pentomino.penta[i].y
            if (this.pentomino.penta[i].y === WIDTH * (ROW - 1) || this.position[(y / WIDTH) + 1][x / WIDTH] === 1) {
                return true
            }

        }
    }


}


let state, AIButton, playButton;
let timer = new Date().getTime();
let delay = 100;
let game;


setup();

function setup() {
    //draw the grid
    let borders = new PIXI.Container();
    app.stage.addChild(borders);
    for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
            let rect = new PIXI.Graphics();
            rect.lineStyle(1, 0xFFFFFF, 1);
            rect.beginFill(0x061639);
            rect.drawRect(0, 0, WIDTH, WIDTH);
            rect.endFill();
            rect.x = j * WIDTH;
            rect.y = i * WIDTH;
            borders.addChild(rect);
        }
    }

    state = play;

    AIButton = new PIXI.Graphics();
    app.stage.addChild(AIButton);
    AIButton.beginFill(0xFFFFFF);
    AIButton.drawRect(0, 0, 2 * WIDTH, WIDTH);
    AIButton.endFill();
    AIButton.x = (COL + 2) * WIDTH
    AIButton.y = 2 * WIDTH;
    AIButton.interactive = true;
    AIButton.on('click', () => {
        state = AIPlay;
    });

    playButton = new PIXI.Graphics();
    app.stage.addChild(playButton);
    playButton.beginFill(0xFFFFFF);
    playButton.drawRect(0, 0, 2 * WIDTH, WIDTH);
    playButton.endFill();
    playButton.x = (COL + 2) * WIDTH
    playButton.y = 4 * WIDTH;
    playButton.interactive = true;
    playButton.on('click', () => {
        state = play;
    });


    game = new Game();
    //start the game loop
    app.ticker.add(delta => gameLoop(delta));

}


function gameLoop(delta) {
    //update the current game state
    state(delta);
}

function play(delta) {
    //All the game logic goes here
    if (new Date().getTime() - timer > delay) {
        timer = new Date().getTime();
        game.moveDown();
        if (game.collide()) {
            state = finalAdjust
        }
    }

}

function AIPlay(delta) {

}

function finalAdjust(delta) {
    if (new Date().getTime() - timer > delay * 3) {
        timer = new Date().getTime();
        if (game.collide()) {
            game.finalAdjustAndCreate();
            state = play;
        } else {
            state = play;
        }
    }
}


function end() {
    //All the code that should run at the end of the game
}




