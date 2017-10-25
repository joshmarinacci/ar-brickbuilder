//make a renderer and add to page
let __NEXT_ID = 0;

function $(selector) {
    return document.querySelector(selector);
}

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


class BlockBuilderApp extends XRExampleBase {
    constructor(elem) {
        super(elem, false);
    }
    initializeScene() {
        const light1 = new THREE.DirectionalLight();
        light1.position.set(0, 5, 10);
        this.scene.add(light1);
        this.scene.add(new THREE.AmbientLight(WHITE, 0.5));

        this.cube_geom = this.makeCubeGeometry();
        this.cubes = new THREE.Object3D();
        this.floorGroup.add(this.cubes);
        // this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.prev_intersections = [];

        // window.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        // window.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        // window.addEventListener('resize', (e) => this.onWindowResize(e), false);

        this.hovered = null;

        this.rf = true;
        setTimeout(()=>this.rf = false,3000);
    }


    foundFloor() {
        this.makeRegularCube(new THREE.Vector3(0, 0, -1));
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

    updateScene(frame) {
        if(this.rf === false) {
            $("#overlay").innerHTML = "<b>finding</b>";
            this.rf = true;
            frame.findFloorAnchor('first-floor-anchor').then((off) => {
                $("#overlay").innerHTML = "<b>found</b>";
                this.foundFloor();
            }).catch((e) => {
                $("#overlay").innerHTML = "<b>error</b>";
            })
        }
    }

    makeCube(pos) {
        let mat = new THREE.MeshLambertMaterial();
        let cube = new THREE.Mesh(this.cube_geom, mat);
        mat.color.set(GREEN);
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
        const size = 0.2; //size in meters
        const half = size/2;
        let box = new THREE.BoxGeometry(size, size*0.7, size);
        geom.merge(box);
        const rad = size*0.20;
        const qt = size/4;
        let cyl = new THREE.CylinderGeometry(rad, rad, rad, 16);
        cyl.translate(0,size*0.7-rad/2,0);

        cyl.translate(-qt,0,-qt);
        geom.merge(cyl);
        cyl.translate(+half,0,0);
        geom.merge(cyl);
        cyl.translate(0,0,+half);
        geom.merge(cyl);
        cyl.translate(-half,0,0);
        geom.merge(cyl);
        return geom;
    }
}


