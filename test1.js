//make a renderer and add to page
const container = document.getElementById("container");
const range = 50;
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

const geom = new THREE.CubeGeometry(5,5,5);
const cubes = new THREE.Object3D();
scene.add(cubes);
scene.add(camera);


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function onMouseMove(e) {
    mouse.x =  (e.clientX / renderer.domElement.clientWidth )*2 - 1;
    mouse.y = -(e.clientY / renderer.domElement.clientHeight)*2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects( cubes.children );
    cubes.children.forEach(function( cube ) {
        cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
    });
    for( let i = 0; i < intersects.length; i++ ) {
        const intersection = intersects[ i ];
        const obj = intersection.object;
        obj.material.color.setRGB( 1.0 - i / intersects.length, 0, 0 );
    }
}
window.addEventListener( 'mousemove', onMouseMove, false );


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
//make 100 random cubes
for(let i=0;i<10;i++) {
    let grayness = Math.random()*0.5+0.25;
    let mat = new THREE.MeshBasicMaterial();
    let cube = new THREE.Mesh(geom,mat);
    mat.color.setRGB(grayness,grayness,grayness);
    cube.position.set(
        range * rand(-0.5,0.5),
        range * rand(-0.5,0.5),
        range * rand(-0.5,0.5));
    cube.rotation.set(rand(0,1),rand(0,1),rand(0,1));//.multiplyScalar(2*Math.PI);
    cube.grayness = grayness;
    cubes.add(cube);
}


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}
animate();