//make a renderer and add to page
const container = document.getElementById("container");
const range = 5;
let containerWidth = container.clientWidth;
let containerHeight = container.clientHeight;

let renderer = new THREE.WebGLRenderer();
renderer.setSize(containerWidth, containerHeight);
container.appendChild(renderer.domElement);

//make a standard scene and camera
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(45,
    containerWidth/containerHeight,
    0.1,10000);
camera.position.set(0,0,range*2);
camera.lookAt(new THREE.Vector3(0,0,0));



const light1 = new THREE.PointLight( 0xff0040, 2, 50 );
light1.position.set(0,20,range*2);
scene.add( light1 );

const cube_geom = new THREE.CubeGeometry(1,1,1);
const cubes = new THREE.Object3D();
scene.add(cubes);
scene.add(camera);
const controls = new THREE.OrbitControls( camera, renderer.domElement );
// controls.addEventListener( 'change', render ); // remove when using animation loop
// controls.enableZoom = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let prev_intersections = [];
function onMouseMove(e) {
    mouse.x =  (e.clientX / renderer.domElement.clientWidth )*2 - 1;
    mouse.y = -(e.clientY / renderer.domElement.clientHeight)*2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const new_intersections = raycaster.intersectObjects( cubes.children );
    prev_intersections.forEach((prev)=>{
        let found = new_intersections.some((inter)=> inter.object === prev.object);
        if(!found) {
            if(prev.object.onMouseExit) prev.object.onMouseExit();
        }
    });
    new_intersections.forEach((inter)=>{
        let found = prev_intersections.some((prev)=>inter.object === prev.object);
        if(!found) {
            if(inter.object.onMouseEnter) inter.object.onMouseEnter();
        }
    });
    prev_intersections = new_intersections.slice();
}
function onMouseDown(e) {
    mouse.x =  (e.clientX / renderer.domElement.clientWidth )*2 - 1;
    mouse.y = -(e.clientY / renderer.domElement.clientHeight)*2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects( cubes.children );
    //only click on the thing closest to the viewer
    if(intersects.length > 0) {
        const intersection = intersects[0];
        const obj = intersection.object;
        if(obj.onClick) obj.onClick();
    }
}
window.addEventListener( 'mousemove', onMouseMove, false);
window.addEventListener( 'mousedown', onMouseDown, false);


function onWindowResize( e ) {
    containerWidth = container.clientWidth;
    containerHeight = container.clientHeight;
    renderer.setSize( containerWidth, containerHeight );
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener( 'resize', onWindowResize, false );


function rand(min,max) {
    return Math.random()*(max-min) + min;
}

let __NEXT_ID = 0;
function nextID() {
    __NEXT_ID+=1;
    return __NEXT_ID;
}

//make the central cube
function makeRegularCube(pos) {
    let mat = new THREE.MeshLambertMaterial();
    let cube = new THREE.Mesh(cube_geom,mat);
    mat.color.setRGB(0.5,0.5,0.5);
    cube.position.copy(pos);
    cube.phantom = false;
    cube.adj = {};
    cube.joshid = nextID();
    cubes.add(cube);
    makePhantoms(cube);
    return cube;
}

//make a phantom cube
function makePhantomCube(pos) {
    let mat = new THREE.MeshLambertMaterial();
    mat.transparent = true;
    mat.opacity = 0.0;
    let cube = new THREE.Mesh(cube_geom,mat);
    mat.color.setRGB(0.5,1.0,0.5);
    cube.adj = {};
    cube.joshid = nextID();
    cube.position.copy(pos);
    cube.phantom = true;
    cube.onMouseEnter = () => {
        mat.opacity = 0.5;
    };
    cube.onMouseExit = () => {
        mat.opacity = 0.0;
    };
    cube.onClick = () => {
        cube.phantom = false;
        mat.color.setRGB(0.5,0.5,0.5);
        mat.transparent = false;
        makePhantoms(cube);
    };
    cubes.add(cube);
    return cube;
}
function makePhantoms(cube) {
    if(!cube.adj.left) {
        let pos2 = cube.position.clone().add(new THREE.Vector3(-1, 0, 0));
        cube.adj.left = makePhantomCube(pos2);
        cube.adj.left.adj.right = cube;
    }
    if(!cube.adj.right) {
        let pos2 = cube.position.clone().add(new THREE.Vector3(+1, 0, 0));
        cube.adj.right = makePhantomCube(pos2);
        cube.adj.right.adj.left = cube;
    }
    if(!cube.adj.top) {
        let pos2 = cube.position.clone().add(new THREE.Vector3(0, +1, 0));
        cube.adj.top = makePhantomCube(pos2);
        cube.adj.top.adj.bottom = cube;
    }
    if(!cube.adj.bottom) {
        let pos2 = cube.position.clone().add(new THREE.Vector3(0, -1, 0));
        cube.adj.bottom = makePhantomCube(pos2);
        cube.adj.bottom.adj.top = cube;
    }
    if(!cube.adj.front) {
        let pos2 = cube.position.clone().add(new THREE.Vector3(0, 0, +1));
        cube.adj.front = makePhantomCube(pos2);
        cube.adj.front.adj.back = cube;
    }
    if(!cube.adj.back) {
        let pos2 = cube.position.clone().add(new THREE.Vector3(0, 0, -1));
        cube.adj.back = makePhantomCube(pos2);
        cube.adj.back.adj.front = cube;
    }
}



makeRegularCube(new THREE.Vector3(0,0,0));

function animate() {
    requestAnimationFrame(animate);
    // cubes.rotation.y += 0.001;
    controls.update();
    renderer.render(scene,camera);
}
animate();