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
  DirectionalLight,
  CameraHelper,
  Fog,
  PCFSoftShadowMap,
  LineBasicMaterial,
  Raycaster,
  Vector2,
  Object3D,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import TWEEN from "@tweenjs/tween.js";

import eve from "../../libs/eve";
import isDev from "../../libs/isDev";

interface BaseSceneState {
  showHelper: boolean;
}

export abstract class BaseScene<P, S extends BaseSceneState> extends Component<
  P,
  S
> {
  el: HTMLDivElement | null = null;
  scene!: Scene;
  camera!: PerspectiveCamera;
  renderer!: WebGLRenderer;
  directionalLight1!: DirectionalLight;
  raycaster: Raycaster;
  mouse: Vector2;
  outlinePass!: OutlinePass;
  composer!: EffectComposer;
  clicked: boolean = false;
  selectedObject: Object3D | null = null;
  selectedObjects: Object3D[] = [];
  controls!: OrbitControls;

  constructor(prop: P) {
    super(prop);

    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
  }

  componentDidMount() {
    if (!this.el) return;

    this.scene = new Scene();

    this.godSayNeedLights();

    const retio = window.innerWidth / window.innerHeight;

    this.camera = new PerspectiveCamera(60, retio, 1, 500);
    if (!isDev()) {
      this.camera.position.set(0, 300, 0);
      this.camera.rotateX(-Math.PI / 2);
    } else this.camera.position.set(0, 10, 30);
    this.scene.add(this.camera);

    this.godSayNeedHelp();

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.scene.background = new Color(0x021122);
    this.scene.fog = new Fog(0x1a2050, 10000, 10000);

    this.godSayNeedControls();

    const planeGeometry = new PlaneBufferGeometry(2000, 2000);
    planeGeometry.rotateX(-Math.PI / 2);
    const planeMaterial = new ShadowMaterial({
      opacity: 0.2,
    });

    const plane = new Mesh(planeGeometry, planeMaterial);
    plane.name = "ground";
    plane.position.y = 0;
    plane.receiveShadow = true;
    this.scene.add(plane);

    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.outlinePass = new OutlinePass(
      new Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );
    this.outlinePass.edgeStrength = 2.4;
    this.outlinePass.edgeGlow = 1;
    this.outlinePass.edgeThickness = 1;
    this.outlinePass.visibleEdgeColor = new Color(0x007bd2);
    this.outlinePass.hiddenEdgeColor = new Color(0x033766);
    this.composer.addPass(this.outlinePass);

    const bloom = new UnrealBloomPass(new Vector2(1024, 1024), 1, 1, 1);
    this.composer.addPass(bloom);

    this.el.appendChild(this.renderer.domElement);

    window.addEventListener("resize", () => this.onWindowResize(), false);
    window.addEventListener("mousemove", (e) => this.onTouchMove(e));
    window.addEventListener("touchmove", (e) => this.onTouchMove(e));
    window.addEventListener("mousedown", (e) => this.onTouchStart(e));
    window.addEventListener("mouseup", (e) => this.onTouchend(e));

    this.createSceneObjects();

    this.animate();
  }

  onTouchend(e: MouseEvent): any {
    this.clicked = false;
    this.selectedObject = null;
  }

  onTouchStart(e: MouseEvent): any {
    if (e.button !== 0) return;
    this.clicked = true;
    this.checkIntersection();

    if (!this.selectedObject) return;
    eve.emit("object-clicked", this.selectedObject.name, this.selectedObject);
  }

  godSayNeedControls() {
    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 6, 0);
    this.controls.maxDistance = 100;
    this.controls.minDistance = 10;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.4;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    // this.controls.maxAzimuthAngle = Math.PI / 2
    if (!isDev()) this.controls.enabled = false;

    this.controls.update();
  }

  godSayNeedHelp() {
    const grid = new GridHelper(1000, 100);
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
    axes.visible = false;
    axes.position.set(0, 0, 0);
    this.scene.add(axes);
  }

  godSayNeedLights() {
    const ambient = new AmbientLight(0xe8ecff, 1.4);
    ambient.name = "ambientLight";
    this.scene.add(ambient);

    this.directionalLight1 = new DirectionalLight(0xfff1f1, 0.7);
    this.directionalLight1.name = "directionalLight1";
    this.directionalLight1.position.set(-1000, 600, 1000);
    this.directionalLight1.castShadow = true;
    this.scene.add(this.directionalLight1);

    this.directionalLight1.shadow.mapSize.width = 512;
    this.directionalLight1.shadow.mapSize.height = 512;

    const d = 50;

    this.directionalLight1.shadow.camera.right = d;
    this.directionalLight1.shadow.camera.left = -d;
    this.directionalLight1.shadow.camera.top = d;
    this.directionalLight1.shadow.camera.bottom = -d;
    this.directionalLight1.shadow.camera.near = 0;
    this.directionalLight1.shadow.camera.far = 3000;
    // directionalLight1.shadow.camera.fov = 2000;90

    const shadowCameraHelper = new CameraHelper(
      this.directionalLight1.shadow.camera
    );
    shadowCameraHelper.visible = false;
    shadowCameraHelper.name = "directionalLight1Helper";
    this.scene.add(shadowCameraHelper);

    const directionalLight2 = new DirectionalLight(0x87c0ff, 0.2);
    directionalLight2.name = "directionalLight2";
    directionalLight2.position.set(1, 1, -1);
    this.scene.add(directionalLight2);
  }

  onTouchMove(e: any) {
    let x, y;

    if (e.changedTouches) {
      x = e.changedTouches[0].pageX;
      y = e.changedTouches[0].pageY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }

    this.mouse.x = (x / window.innerWidth) * 2 - 1;
    this.mouse.y = -(y / window.innerHeight) * 2 + 1;

    this.checkIntersection();
  }

  lastSelectedObj?: Object3D;

  checkIntersection() {
    if (!this.scene) return;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects([this.scene], true);

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.name === "ground") return;
      if (this.clicked) this.selectedObject = obj;
      this.outlinePass.selectedObjects = [obj];
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  abstract createSceneObjects(): void;

  animate = () => {
    requestAnimationFrame(this.animate);
    this.composer.render();
    TWEEN.update();
  };

  componentWillUnmount() {
    if (!this.el) return;
    this.el.removeChild(this.renderer.domElement);
  }

  render() {
    return <div ref={(el) => (this.el = el)} />;
  }
}
