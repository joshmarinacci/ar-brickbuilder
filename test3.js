//make a renderer and add to page
let __NEXT_ID = 0;

function nextID() {
    __NEXT_ID += 1;
    return __NEXT_ID;
}

const WHITE = 0xffffff;
const YELLOW = 0xffff00;
const GREEN = 0x00ff00;

function rand(min, max) {
    return Math.random() * (max - min) + min;
}


class App {
    init() {
        const container = document.getElementById("container");
        let cw = container.clientWidth;
        let ch = container.clientHeight;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(cw, ch);
        container.appendChild(this.renderer.domElement);
        //make a standard scene and camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, cw / ch, 0.1, 10000);
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        const light1 = new THREE.DirectionalLight();
        light1.position.set(0, 5, 10);
        this.scene.add(light1);
        this.scene.add(new THREE.AmbientLight(WHITE, 0.5))

        // this.cube_geom = new THREE.CubeGeometry(1, 1, 1);
        this.cube_geom = this.makeCubeGeometry();


        this.cubes = new THREE.Object3D();
        this.scene.add(this.cubes);
        this.scene.add(this.camera);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.prev_intersections = [];

        window.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        window.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        window.addEventListener('resize', (e) => this.onWindowResize(e), false);

        this.makeRegularCube(new THREE.Vector3(0, 0, 0));
        this.hovered = null;
    }


    onMouseMove(e) {
        this.mouse.x = (e.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
        this.mouse.y = -(e.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const new_intersections = this.raycaster.intersectObjects(this.cubes.children);
        //if the first object isn't currently the selection, then remove current selection and add the new one
        if(new_intersections.length ===0) {
            if(this.hovered) {
                this.hovered.onMouseExit();
                this.hovered = false;
            }
            return;
        }
        const first = new_intersections[0].object;
        if(!this.hovered) {
            this.hovered = first;
            this.hovered.onMouseEnter();
            return;
        }
        if(this.hovered && first.uuid !== this.hovered.uuid) {
            console.log("different");
            this.hovered.onMouseExit();
            this.hovered = first;
            this.hovered.onMouseEnter();
            return;
        }
    }

    onMouseDown(e) {
        this.mouse.x = (e.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
        this.mouse.y = -(e.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cubes.children);
        //only click on the thing closest to the viewer
        if (intersects.length > 0) {
            const intersection = intersects[0];
            const obj = intersection.object;
            if (obj.onClick) obj.onClick();
        }
    }

    onWindowResize(e) {
        let containerWidth = container.clientWidth;
        let containerHeight = container.clientHeight;
        this.renderer.setSize(containerWidth, containerHeight);
        this.camera.aspect = containerWidth / containerHeight;
        this.camera.updateProjectionMatrix();
    }

    tick() {
        // cubes.rotation.y += 0.001;
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    start() {
        var self = this;

        function animate() {
            requestAnimationFrame(animate);
            self.tick();
        }

        animate();
    }

    makeCube(pos) {
        let mat = new THREE.MeshLambertMaterial();
        // let mat = new THREE.MeshPhongMaterial();
        let cube = new THREE.Mesh(this.cube_geom, mat);
        mat.color.set(YELLOW);
        cube.position.copy(pos);
        cube.phantom = false;
        cube.joshid = nextID();
        cube.adj = {};
        return cube;
    }

    //make the central cube
    makeRegularCube(pos) {
        let cube = this.makeCube(pos);
        this.cubes.add(cube);
        this.makePhantoms(cube);
        return cube;
    }

    //make a phantom cube
    makePhantomCube(pos) {
        let cube = this.makeCube(pos);
        cube.material.transparent = true;
        cube.material.opacity = 0.0;
        cube.material.color.set(GREEN);
        cube.phantom = true;
        cube.onMouseEnter = () => {
            cube.material.opacity = 0.5;
        };
        cube.onMouseExit = () => {
            cube.material.opacity = 0.0;
        };
        cube.onClick = () => {
            cube.phantom = false;
            cube.material.color.set(YELLOW);
            cube.material.transparent = false;
            this.makePhantoms(cube);
        };
        this.cubes.add(cube);
        return cube;
    }

    makePhantoms(cube) {
        if (!cube.adj.left) {
            let pos2 = cube.position.clone().add(new THREE.Vector3(-1, 0, 0));
            cube.adj.left = this.makePhantomCube(pos2);
            cube.adj.left.adj.right = cube;
        }
        if (!cube.adj.right) {
            let pos2 = cube.position.clone().add(new THREE.Vector3(+1, 0, 0));
            cube.adj.right = this.makePhantomCube(pos2);
            cube.adj.right.adj.left = cube;
        }
        if (!cube.adj.top) {
            let pos2 = cube.position.clone().add(new THREE.Vector3(0, +1, 0));
            cube.adj.top = this.makePhantomCube(pos2);
            cube.adj.top.adj.bottom = cube;
        }
        if (!cube.adj.bottom) {
            let pos2 = cube.position.clone().add(new THREE.Vector3(0, -1, 0));
            cube.adj.bottom = this.makePhantomCube(pos2);
            cube.adj.bottom.adj.top = cube;
        }
        if (!cube.adj.front) {
            let pos2 = cube.position.clone().add(new THREE.Vector3(0, 0, +1));
            cube.adj.front = this.makePhantomCube(pos2);
            cube.adj.front.adj.back = cube;
        }
        if (!cube.adj.back) {
            let pos2 = cube.position.clone().add(new THREE.Vector3(0, 0, -1));
            cube.adj.back = this.makePhantomCube(pos2);
            cube.adj.back.adj.front = cube;
        }
    }

    makeCubeGeometry() {
        let geom = new THREE.Geometry();
        let box = new THREE.BoxGeometry(1,1,1);
        geom.merge(box);
        const rad = 0.20;
        let cyl = new THREE.CylinderGeometry(rad, rad,0.5, 16);
        cyl.translate(0,0.5,0);

        cyl.translate(-0.25,0,-0.25);
        geom.merge(cyl);
        cyl.translate(+0.5,0,0);
        geom.merge(cyl);
        cyl.translate(0,0,+0.5);
        geom.merge(cyl);
        cyl.translate(-0.5,0,0);
        geom.merge(cyl);
        return geom;
    }
}

const app = new App();
app.init();
app.start();

