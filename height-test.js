//create scene

class BasicExample {
    constructor(selector) {
        const container = document.querySelector(selector)
        this.width = container.clientWidth
        this.height = container.clientHeight

        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(this.width,this.height)
        this.renderer.antialias = true
        this.renderer.setPixelRatio(2);
        container.appendChild(this.renderer.domElement)

        //make a standard scene and camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.width/this.height,  0.1,10000);
        //move camera back and up
        this.camera.position.set(0,3,10);
        //look at the origin
        this.camera.lookAt(new THREE.Vector3(0,0,0));

        //turn on shadows
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMapSoft = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

        //ambient
        const ambient = new THREE.AmbientLight(0x666666);
        this.scene.add( ambient );

        //spot light
        const light = new THREE.SpotLight(0xffffff, 0.6);
        light.position.set(0, 30, 20);
        light.target.position.set(0, 0, 0);
        light.castShadow = true
        light.shadow.camera.near = 20;
        light.shadow.camera.far = 50;
        light.shadow.camera.fov = 40;
        light.shadow.MapBias = 0.5;
        light.shadowMapDarkness = 0.2;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        this.scene.add(light)
    }

    setup() {
        var rows = 32
        var cols = 32
        const geo = new THREE.PlaneGeometry(8, 8, rows,cols)
        for(let i=0;i<geo.vertices.length; i++) {
            var row = Math.floor(i/(rows+1));
            // geo.vertices[i].z = Math.sin(row/10)
            geo.vertices[i].z += Math.random() * 0.5 + Math.sin(row/10)
        }
        for(let i=0; i<geo.faces.length; i++) {
            const face = geo.faces[i];
            var a = geo.vertices[face.a];
            var b = geo.vertices[face.b];
            var c = geo.vertices[face.c];
            let color = new THREE.Color(0xffffff)
            if(Math.max(a.z,b.z,c.z) > 0.5) {
                color = new THREE.Color(0xff0000)
            }
            face.vertexColors[0] = color
            face.vertexColors[1] = color
            face.vertexColors[2] = color

        }
        geo.colorsNeedUpdate = true
        geo.elementsNeedUpdate = true
        geo.computeFaceNormals()
        geo.computeVertexNormals()


        const plmaterial = new THREE.MeshPhongMaterial({
            // color: 0xffffff,
            side: THREE.DoubleSide,
            shading: THREE.FlatShading,
            vertexColors:  THREE.VertexColors
        })
        const plane = new THREE.Mesh(geo, plmaterial)


        plane.rotation.x = Math.PI/2;
        plane.receiveShadow = true
        this.scene.add( plane );


        const geometry = new THREE.IcosahedronGeometry(1);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color('#e89e17'),
            shading: THREE.FlatShading,
            side: THREE.DoubleSide
        })
        const cube = new THREE.Mesh(geometry,material)
        cube.castShadow = true
        cube.receiveShadow = true
        cube.position.y = 2;
        this.scene.add(cube);

    }

    update() {
    }

    start() {
        var self = this;
        function draw(time) {
            requestAnimationFrame(draw)
            self.update();
            self.renderer.render(self.scene,self.camera)
        }
        draw();
    }
}

var ex = new BasicExample('#container');
ex.setup();
ex.start();
//create a plane
//randomly change the y value of the vertexes
// apply a scaling factor
//randomly change the color of the vertexes using a very simple interpolation between two colors
//perturb the lines non-randomly using a function
//set the colors using a multi-stop gradient