class LoaderTest {
    constructor(selector) {
        const container = document.querySelector(selector)
        this.width = container.clientWidth
        this.height = container.clientHeight

        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(this.width,this.height)
        // this.renderer.antialias = true
        // this.renderer.setPixelRatio(2);
        container.appendChild(this.renderer.domElement)


        this.setupCamera();

        //turn on shadows
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMapSoft = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

        this.setupControls()
        this.setupLight()
        this.setupScene()


        const url = './imp_character/scene.gltf'
        const loader = new THREE.GLTFLoader()
        loader.load(url,
            (model)=>{
                console.log("got the model",model)
                this.scene.add(model.scene)
            },
            undefined,
            // (xhr) => {
            //     console.log('xhr loading')
            // },
            (error) => {
                console.log("ERROR loading GLTF file",error.target.responseURL,error.target.status,error.target.statusText)
            }
        );
    }

    setupCamera() {
        //make a standard scene and camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.width/this.height,  0.1,10000);
        //move camera back and up
        this.camera.position.set(0,3,10);
        //look at the origin
        this.camera.lookAt(new THREE.Vector3(0,0,0));
    }

    setupControls() {
        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    }

    setupLight() {
        //ambient
        const ambient = new THREE.AmbientLight(0xffffff,0.6);
        this.scene.add( ambient );

        //hemi light
        const hemi = new THREE.HemisphereLight( 0xffffff, 0xff66ff, 0.3 );
        this.scene.add( hemi );

        //spot light
        const light = new THREE.SpotLight(0xffffff, 0.4);
        light.position.set(-20, 30, 5);
        light.target.position.set(0, 0, 0);
        // light.castShadow = true
        // light.shadow.camera.near = 20;
        // light.shadow.camera.far = 50;
        // light.shadow.camera.fov = 40;
        // light.shadow.MapBias = 0.5;
        // light.shadowMapDarkness = 0.2;
        // light.shadow.mapSize.width = 2048;
        // light.shadow.mapSize.height = 2048;
        this.scene.add(light)

    }


    setupScene() {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1),
            new THREE.MeshPhongMaterial({
                color: new THREE.Color('white'),
                flatShading: THREE.FlatShading
            })
        )
        // this.scene.add(sphere)
    }

    update(time) {

    }
    start() {
        const self = this

        function draw(time) {
            requestAnimationFrame(draw)
            self.update(time);
            self.renderer.render(self.scene,self.camera)
        }
        draw();
    }

}
const ex = new LoaderTest('#container')
// ex.setup();
ex.start();
