function pd(rad) {
    console.log("angle",rad/Math.PI*180)
}
const MODES = {
    MOVE:'MOVE',
    STAY:'STAY'
}
class Particle {
    constructor() {
        this.v = 1;
        this.a = Math.PI/2;//0;//Math.random()*Math.PI*2;
        this.ang = 0;
        this.x = 0;
        this.y = 0;
        this.tx = 100;
        this.ty = 0;
        this.mode = MODES.STAY;
    }
    update() {
        if(this.mode === MODES.MOVE) {
            if(this.a < -Math.PI) {
                this.a += Math.PI*2
            }
            if(this.a > Math.PI) {
                this.a -= Math.PI*2;
            }
            this.ang = Math.atan2(this.y-this.ty, this.x-this.tx);

            if(this.a > 0) {
                // const d1 = this.a-this.ang;
                // const d2 = this.ang - this.a;
            }
            // this.ang += Math.PI*2;
            if(this.a > this.ang) {
                this.a -= 0.02;
            } else {
                this.a += 0.02;
            }
        }

        this.x -= Math.cos(this.a)*this.v;
        this.y -= Math.sin(this.a)*this.v;
    }
    draw(c) {
        c.fillStyle = 'yellow';
        c.save();
        c.translate(this.x,this.y)
        c.rotate(this.a);
        c.fillRect(0,-2.5,20,5);
        c.restore();

        c.fillStyle = 'red';
        c.fillRect(this.tx-10,this.ty-10,20,20);

        c.save();
        c.translate(40,0)
        c.fillStyle = 'white';
        c.font = '16px serif';
        function pa(ang) {
            return Math.floor(ang/Math.PI*180);
        }
        c.fillText(`dir ${pa(this.a)} ${pa(this.ang)}`,0,0)
        c.fillText(`xy ${Math.floor(this.x)},${Math.floor(this.y)}`, 0, 20)
        c.fillText(`txy ${Math.floor(this.tx)},${Math.floor(this.ty)}`, 0, 40)
        c.fillText(`mode = ${this.mode}`, 0, 60);
        c.restore()
    }
    moveTo(x,y) {
        this.tx = x;
        this.ty = y;
        this.mode = MODES.MOVE
    }
    pointTo(x,y) {
        this.tx = x;
        this.ty = y;

        const a1 = this.a;
        const a2 = Math.atan2(this.y-this.ty, this.x-this.tx);
        console.log("a1 = ", a1);
        console.log('a2 = ', a2);
        if(a1 < a2) {
            // console.log("clockwise")
        } else {
            // console.log("countercw")
        }
        const PI2 = Math.PI*2;
        const c1 = Math.abs(a1-a2);
        const c2 = Math.abs(a1+PI2-a2);
        console.log(c1.toFixed(2),c2.toFixed(2));
        if(c1<c2) {
            console.log("cw")
        } else {
            console.log("ccw")
        }

    }
}

function setup() {
    console.log('setting it up');

    const can = document.querySelector('#canvas')
    const ctx = can.getContext('2d')
    ctx.fillStyle = 'red';
    ctx.fillRect(0,0,200,200)

    const w = 800;
    const h = 400;
    const parts = [];
    parts.push(new Particle());
    // parts.push(new Particle());
    // parts.push(new Particle());
    // parts.push(new Particle());
    function redraw() {
        // requestAnimationFrame(redraw)
        // setTimeout(redraw,100)
        ctx.fillStyle = 'green';
        ctx.fillRect(0,0,w,h);
        ctx.save();
        ctx.translate(w/2,h/2)
        parts.forEach((part) => {
            part.update();
        })
        parts.forEach((part) => {
            part.draw(ctx);
        })
        ctx.restore();
    }
    redraw()


    document.querySelector('#center').addEventListener('click',()=>{
        parts.forEach((part)=>{
            part.moveTo(0,0);
        })
    })
    document.querySelector('#bottom-right').addEventListener('click',()=>{
        parts.forEach((part)=>{
            part.moveTo(w/2,h/2);
        })
    })
    document.querySelector('#top-right').addEventListener('click',()=>{
        parts.forEach((part)=>{
            part.moveTo(w/2,-h/2);
        })
    })
    can.addEventListener('mousedown',(e)=>{
        parts.forEach((part)=>{
            part.pointTo(e.clientX-w/2,e.clientY-h/2);
        })
        redraw()
    })
}

window.addEventListener('load',setup);

/*

create particle object
    position
    direction angle
    velocity
    update
        p.x += Math.sin(angle) * velocity
        p.x += Math.cos(angle) * velocity


can never change velocity or angle by a certain amount per step, thus making it more natural

state machine:
    spin mode: go in a circle around the target xy w/ a radius, set on creation.
    hover mode: hover in place in small circles
    move mode: all zoom to a particular spot, can overshoot and circle back

create 10 particles
update on every frame
add buttons to set the mode of all particles and see them move

raf to animate



*/


