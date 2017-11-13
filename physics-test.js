//make a renderer and add to page
const container = document.getElementById("container");
let containerWidth = container.clientWidth;
let containerHeight = container.clientHeight;

let renderer = new THREE.WebGLRenderer();
renderer.setSize(containerWidth, containerHeight);
renderer.antialias = true
renderer.setPixelRatio(2);
container.appendChild(renderer.domElement);

//make a standard scene and camera
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(45, containerWidth/containerHeight,  0.1,10000);
camera.position.set(0,3,10);
camera.lookAt(new THREE.Vector3(0,0,0));



function makeLight() {
    const ambient = new THREE.AmbientLight(0x666666);
    scene.add( ambient );

    let light = new THREE.SpotLight(0xffffff);
    light.position.set(0, 30, 20);
    light.target.position.set(0, 0, 0);
    light.castShadow = true
    light.shadow.camera.near = 20;
    light.shadow.camera.far = 50;//camera.far;
    light.shadow.camera.fov = 40;
    light.shadow.MapBias = 0.5;
    light.shadowMapDarkness = 0.2;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add(light)
}
makeLight()


renderer.shadowMap.enabled = true
renderer.shadowMapSoft = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

let world;

function makeCannon() {
    world = new CANNON.World()
    world.gravity.set(0,-5,0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
}
makeCannon()

const fixedTimeStep = 1.0 / 60.0

function makePlane() {
    const geometry = new THREE.PlaneGeometry(8, 4, 32)
    const material = new THREE.MeshLambertMaterial({color: 0xcccccc, side: THREE.DoubleSide})
    const plane = new THREE.Mesh(geometry, material)
    plane.rotation.x = Math.PI/2;
    plane.receiveShadow = true
    scene.add( plane );


    const groundShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({mass: 0})
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(groundBody);
}

let cubes = [];

function makeCube(x,y,z) {
    const geometry = new THREE.BoxGeometry(2,2,2);
    const material = new THREE.MeshLambertMaterial({color: 0xffcccc, side: THREE.DoubleSide})
    const cube = new THREE.Mesh(geometry,material)
    cube.castShadow = true
    cube.receiveShadow = true
    cube.position.x = x
    cube.position.y = y;
    cube.position.z = z;
    scene.add(cube);

    const cubeBody = new CANNON.Body({
        mass:1,
        position: new CANNON.Vec3(x,y,z),
        shape: new CANNON.Box(new CANNON.Vec3(1,1,1))
    });
    world.addBody(cubeBody)
    cubes.push({obj:cube,body:cubeBody})
}

function updatePhysics() {
    world.step(fixedTimeStep)
    cubes.forEach((cube)=>{
        cube.obj.position.copy(cube.body.position);
        cube.obj.quaternion.copy(cube.body.quaternion);
    })
}

const controls = new THREE.OrbitControls( camera, renderer.domElement );

makePlane();
makeCube(0,2,0)
makeCube(-4,2,0)
makeCube(1.5,6,0)

window.addEventListener( 'resize', function(e) {
    containerWidth = container.clientWidth;
    containerHeight = container.clientHeight;
    renderer.setSize( containerWidth, containerHeight );
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
}, false );

function draw(time) {
    requestAnimationFrame(draw)
    updatePhysics();
    renderer.render(scene,camera)
}
draw();