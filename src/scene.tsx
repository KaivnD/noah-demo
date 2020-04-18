import React, { Component } from "react";
import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Mesh,
  Color,
  PlaneBufferGeometry,
  AmbientLight,
  GridHelper,
  ShadowMaterial,
  AxesHelper,
  Shape,
  Vector2,
  DirectionalLight,
  ExtrudeBufferGeometry,
  CameraHelper,
  Fog,
  PCFSoftShadowMap,
  MeshStandardMaterial,
  LineBasicMaterial,
  Vector3,
  SphereGeometry,
} from "three";

import model from "./abc.json";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface ThreeProp {}

class Three extends Component<ThreeProp> {
  el: HTMLDivElement | null = null;
  scene!: Scene;
  camera!: PerspectiveCamera;
  renderer!: WebGLRenderer;

  componentDidMount() {
    if (!this.el) return;

    this.scene = new Scene();

    const ambient = new AmbientLight(0xe8ecff, 1.4);
    ambient.name = "ambientLight";
    this.scene.add(ambient);

    const directionalLight1 = new DirectionalLight(0xfff1f1, 0.7);
    directionalLight1.name = "directionalLight1";
    directionalLight1.position.set(-1000, 600, 1000);
    directionalLight1.castShadow = true;
    this.scene.add(directionalLight1);

    directionalLight1.shadow.mapSize.width = 2048;
    directionalLight1.shadow.mapSize.height = 2048;

    const d = 300;

    directionalLight1.shadow.camera.right = d;
    directionalLight1.shadow.camera.left = -d;
    directionalLight1.shadow.camera.top = d;
    directionalLight1.shadow.camera.bottom = -d;
    directionalLight1.shadow.camera.near = 0;
    directionalLight1.shadow.camera.far = 5000;
    // directionalLight1.shadow.camera.fov = 2000;

    const shadowCameraHelper = new CameraHelper(
      directionalLight1.shadow.camera
    );
    shadowCameraHelper.visible = false;
    shadowCameraHelper.name = "directionalLight1Helper";
    this.scene.add(shadowCameraHelper);

    const directionalLight2 = new DirectionalLight(0x87c0ff, 0.2);
    directionalLight2.name = "directionalLight2";
    directionalLight2.position.set(1, 1, -1);
    this.scene.add(directionalLight2);

    this.camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.camera.position.set(256, 300, 0);
    this.scene.add(this.camera);

    const grid = new GridHelper(2000, 100);
    grid.name = "grid";
    grid.position.y = 0;
    grid.visible = true;
    grid.material = new LineBasicMaterial({
      opacity: 0.1,
      transparent: true,
    });
    this.scene.add(grid);

    const axes = new AxesHelper(100);
    axes.name = "axes";
    axes.visible = true;
    axes.position.set(0, 0, 0);
    this.scene.add(axes);

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.scene.background = new Color(0x0f131a);
    this.scene.fog = new Fog(0x1a2050, 10000, 10000);

    // Controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.maxDistance = 2000;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.1;
    controls.enableDamping = true;
    controls.dampingFactor = 0.4;
    controls.maxPolarAngle = Math.PI / 2 - 0.15;
    controls.update();

    const planeGeometry = new PlaneBufferGeometry(2000, 2000);
    planeGeometry.rotateX(-Math.PI / 2);
    const planeMaterial = new ShadowMaterial({
      opacity: 0.2,
    });

    const plane = new Mesh(planeGeometry, planeMaterial);
    plane.position.y = 0;
    plane.receiveShadow = true;
    this.scene.add(plane);

    this.el.appendChild(this.renderer.domElement);

    window.addEventListener("resize", () => this.onWindowResize(), false);

    this.createCube();

    this.animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  createCube() {
    const material = new MeshStandardMaterial({
      color: new Color(0xffffff),
      metalness: 0.5,
      roughness: 1,
      side: 0,
      // transparent: true,
      // opacity: 0.7,
    });
    // const lineMat = new LineBasicMaterial({ color: new Color(0x000000) });
    model.a.forEach((a) => {
      const pts: Vector2[] = [];

      a.p.forEach((p) => pts.push(new Vector2(Number(p.x), Number(p.y))));
      const base = new Shape(pts);

      // const lineGeo = new BufferGeometry().setFromPoints(pts);

      const building = new ExtrudeBufferGeometry(base, {
        bevelEnabled: false,
        steps: a.c,
        depth: Number(a.h) * a.c,
      });
      building.rotateX(-Math.PI / 2);
      building.translate(-700, 0, 150);

      const buildingMesh = new Mesh(building, material);
      buildingMesh.name = "buildings";
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;

      this.scene.add(buildingMesh);

      // for (let i = 1; i <= a.c; i++) {
      //   const line = new Line(lineGeo, lineMat);
      //   line.rotateX(-Math.PI / 2);
      //   line.translateZ(Number(a.h) * i);
      //   line.translateX(-600);
      //   this.scene.add(line);
      // }
    });

    model.b.forEach((b) => {
      const pts: Vector2[] = [];

      b.forEach((p) => pts.push(new Vector2(Number(p.x), Number(p.y))));
      const base = new Shape(pts);

      const building = new ExtrudeBufferGeometry(base, {
        bevelEnabled: false,
        steps: 1,
        depth: 0.45,
      });
      building.rotateX(-Math.PI / 2);
      building.translate(-700, 0, 150);

      const buildingMesh = new Mesh(building, material);
      buildingMesh.name = "block";
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;

      this.scene.add(buildingMesh);
    });

    model.t.forEach((t) => {
      const loc = new Vector3(Number(t.p.x), Number(t.p.y), 3);
      const tree = new SphereGeometry(Number(t.s));

      tree.translate(loc.x, loc.y, loc.z);
      tree.rotateX(-Math.PI / 2);
      tree.translate(-700, 0, 150);

      const treeMesh = new Mesh(tree, material);
      treeMesh.castShadow = true;
      treeMesh.receiveShadow = true;
      this.scene.add(treeMesh);
    });
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  componentWillUnmount() {
    if (!this.el) return;
    this.el.removeChild(this.renderer.domElement);
  }
  render() {
    return <div ref={(el) => (this.el = el)} />;
  }
}
export default Three;
