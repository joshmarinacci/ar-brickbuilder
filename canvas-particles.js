function pd(rad) {
    console.log("angle",rad/Math.PI*180)
}
const MODES = {
    MOVE:'MOVE',
    STAY:'STAY'
};
const PI = Math.PI;

function wrapPiRange(v) {
    if(v < -PI) return v + PI*2;
    if(v > PI) return v - PI*2;
    return v
}

class Particle {
    constructor() {
        this.v = 1;
        this.bearing = Math.random()*PI*2;
        this.angle = 0;
        this.x = 0;
        this.y = 0;
        this.tx = 100;
        this.ty = 0;
        this.mode = MODES.STAY;
    }
    update() {
        if(this.mode === MODES.MOVE) {
            this.angle = Math.atan2(this.y-this.ty, this.x-this.tx);
            this.bearing = wrapPiRange(this.bearing);
            this.angle = wrapPiRange(this.angle);
            let dir = 0;
            if(this.angle < this.bearing) {
                // console.log("go clockwise")
                dir = 1;
            } else {
                // console.log("go counter clockwise")
                dir = -1;
            }
            const d = this.bearing-this.angle;
            if(d > PI)  dir *= -1;
            if(d < -PI) dir *= -1;


            // console.log(`bearing ${this.bearing} angle ${this.angle} diff ${d} dir ${dir}`);
            this.bearing += dir * 0.02;
        }

        this.x += Math.cos(this.bearing)*this.v;
        this.y += Math.sin(this.bearing)*this.v;
    }
    draw(c) {
        c.fillStyle = 'yellow';
        c.save();
        c.translate(this.x,this.y)
        c.rotate(this.bearing);
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
        c.fillText(`dir ${pa(this.bearing)} ${pa(this.angle)}`,0,0)
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
        this.mode = MODES.MOVE
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
    parts.push(new Particle());
    parts.push(new Particle());
    parts.push(new Particle());
    function redraw() {
        requestAnimationFrame(redraw)
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
        // redraw()
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






angle b is the bearing
angle a is the angle from the current position to the target

a is in the range of -pi to pi
convert b to the range of -pi to pi

if(a < b) then turn clockwise (right)
if(a > b) then turn counter clockwise
d is the difference between b and a (b-a => d)

if d is more than pi (180) then flip the direction.









*/


