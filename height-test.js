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
        const ambient = new THREE.AmbientLight(0xffffff,0.3);
        this.scene.add( ambient );

        //spot light
        const light = new THREE.SpotLight(0xffffff, 0.4);
        light.position.set(-20, 30, 5);
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


        //hemi light
        const hemi = new THREE.HemisphereLight( 0xffffff, 0xff66ff, 0.3 );
        this.scene.add( hemi );
    }

    setup() {
        const rows = 15
        const cols = 10
        const geo = new THREE.PlaneGeometry(15, 10, rows,cols)
        const tx = 5;
        const ty = 7;
        //distort the geometry
        for(let i=0;i<geo.vertices.length; i++) {
            let row = Math.floor(i / (rows + 1))
            // console.log(row);
            let col = i % (rows+1);
            const vert = geo.vertices[i];
            const dist = Math.sqrt((row-ty)*(row-ty) + (col-tx)*(col-tx));
            if(dist < 3) {
                vert.z -= (3-dist);
                vert.x += (Math.random()-0.5)*0.2
                vert.y += (Math.random()-0.5)*0.2
            } else {
                vert.z += (Math.random()-0.5)*0.2
            }
        }
        for(let i=0; i<geo.faces.length; i++) {
            const face = geo.faces[i];
            let a = geo.vertices[face.a]
            let b = geo.vertices[face.b]
            let c = geo.vertices[face.c]
            let color = new THREE.Color(0x88ff66)
            if(Math.min(a.z,b.z,c.z) < -0.5) color = new THREE.Color(0xaa8866)
            if(Math.min(a.z,b.z,c.z) < -1.5) color = new THREE.Color(0xffffff)
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


        const sunGeo = new THREE.IcosahedronGeometry(1);
        const sunMat = new THREE.MeshPhongMaterial({
            color: new THREE.Color('#e89e17'),
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            emissive: new THREE.Color('#ffe10c'),
            emissiveIntensity: 0.5
        })
        const sun = new THREE.Mesh(sunGeo,sunMat)
        sun.castShadow = false
        sun.position.x = -6;
        sun.position.y = 6;
        sun.position.z = 3;
        this.scene.add(sun);
        this.ball = sun;



        function jitterGeometry(geo, scale) {
            for(let i=0;i<geo.vertices.length; i++) {
                const vert = geo.vertices[i];
                vert.x += (Math.random()-0.5)*scale
                vert.y += (Math.random()-0.5)*scale
                vert.z += (Math.random()-0.5)*scale
            }
            return geo
        }

        function iter(len) {
            const arr = []
            for(let i=0; i<len; i++) arr.push(i);
            return arr;
        }


        const cloudWhite = new THREE.MeshPhongMaterial({
            color: new THREE.Color('#ffffff'),
            shading: THREE.FlatShading,
            side: THREE.DoubleSide
        });

        function makeCloud() {
            const cloud = new THREE.Group();

            iter(3).forEach((i)=>{
                const part = new THREE.Mesh(jitterGeometry(new THREE.IcosahedronGeometry(0.6+Math.random()*0.2,1),0.3), cloudWhite);
                part.position.x = i
                part.castShadow = true;
                // part.position.y = Math.random();
                part.rotation.x = Math.random();
                cloud.add(part);
            })
            return cloud;
        }

        this.cloud1 = makeCloud()
        this.scene.add(this.cloud1);
        this.cloud1.position.y = 2;
        this.cloud1.position.x = 3;

        this.cloud2 = makeCloud();
        this.scene.add(this.cloud2);
        this.cloud2.position.y = 3;
        this.cloud2.position.x = -3;
        this.cloud2.position.z = 2;



        var self = this;
        function makeCreature() {
            const lightBlue = new THREE.MeshPhongMaterial({
                color: new THREE.Color('#00ccff'),
                shading: THREE.FlatShading,
                side: THREE.DoubleSide
            });

            const group = new THREE.Group();
            const c1 = new THREE.Mesh(new THREE.BoxGeometry(1,0.2,0.8), lightBlue);
            c1.rotation.z = -0.1;
            c1.position.x = -0.5;
            c1.castShadow = true;
            self.wing1 = new THREE.Group();
            self.wing1.add(c1)
            group.add(self.wing1)


            // group.add(c1);
            const c2 = new THREE.Mesh(new THREE.BoxGeometry(1,0.2,0.8), lightBlue);
            c2.rotation.z = +0.1;
            c2.position.x = +0.5;
            c2.castShadow = true;
            self.wing2 = new THREE.Group();
            self.wing2.add(c2);
            group.add(self.wing2);


            const c3 = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,2), lightBlue);
            c3.castShadow = true;
            c3.position.z = -0.3;
            c3.rotation.z = Math.PI/4;
            group.add(c3);



            return group;
        }
        this.creature = makeCreature();
        this.scene.add(this.creature);
        this.creature.position.y = 1;
    }

    update(time) {
        const t = time/1000;
        this.ball.rotation.y += 0.005;
        this.ball.rotation.z += 0.006;
        this.cloud1.rotation.x += 0.002;
        this.cloud2.rotation.x += 0.0025;


        this.wing1.rotation.z = Math.sin(t)/2;
        this.wing2.rotation.z = -Math.sin(t)/2;
        this.wing1.rotation.y = -0.2;
        this.wing2.rotation.y = 0.2;

        this.creature.position.x = Math.sin(t/4)*5 + -3;
        this.creature.position.z = Math.cos(t/4)*5 - 3;
        this.creature.rotation.y = Math.PI/2 + t/4;
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

const ex = new BasicExample('#container')
ex.setup();
ex.start();
