import {
  Mesh,
  Color,
  MeshStandardMaterial,
  LoadingManager,
  MeshStandardMaterialParameters,
  Vector2,
  Shape,
  ExtrudeBufferGeometry,
  Group,
  Object3D,
} from "three";

import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";

import { BaseScene } from "./base/BaseScene";

import axios from "axios";

import eve from "../libs/eve";

import TWEEN from "@tweenjs/tween.js";

interface ThreeState {
  showHelper: boolean;
  clicked: boolean;
}

interface Point2D {
  x: number;
  y: number;
}

interface BlockBuilding {
  c: number;
  h: number;
  p: Point2D[];
}

interface BlockDetail {
  a: BlockBuilding[];
  b: Point2D[][];
  t: {
    p: Point2D;
    s: number;
  }[];
}

interface ThreeProp {
  loading?: boolean;
}

class Three extends BaseScene<ThreeProp, ThreeState> {
  blockMap: Map<string, BlockDetail>;

  constructor(prop: ThreeProp) {
    super(prop);

    this.state = {
      showHelper: true,
      clicked: false,
    };

    this.blockMap = new Map();

    eve.on("start-clicked", () => {
      if (!this.camera) return;
      var tween1 = new TWEEN.Tween(this.camera.rotation).to(
        { x: -0.849, y: 0, z: 0 },
        1500
      );
      // tween.delay(10);
      tween1.start();
      // tween1.easing(TWEEN.Easing.Exponential.InOut);

      var tween2 = new TWEEN.Tween(this.camera.position).to(
        { x: 0, y: 1400, z: 1200 },
        1500
      );
      tween2.delay(10);
      tween2.start();
      // tween2.easing(TWEEN.Easing.Exponential.InOut);

      setTimeout(() => {
        this.scene.add(this.designBase);
        this.designBase.visible = true;
        this.controls.enabled = true;
      }, 2000);
    });

    eve.on("changeLightPos", (v) => {
      if (!this.directionalLight1) return;
      this.directionalLight1.position.setY(v);
    });

    eve.on("object-clicked", (name: string) => {
      if (!this.scene || !name.startsWith("block")) return;
      axios.get(`/demo/${name}.json`).then((res) => {
        const block: BlockDetail = res.data;
        this.blockMap.set(name, block);
        // eve.emit("open-hud", name);
        this.updateBlocks(name);
      });
    });

    eve.on("block-reload", (name) => {
      if (!this.scene || !name.startsWith("block")) return;
      axios.get(`/demo/${name}-2.json`).then((res) => {
        const block: BlockDetail = res.data;
        this.blockMap.set(name, block);
        eve.emit("open-hud", name);
        this.updateBlocks(name);
      });
    });
  }
  updateBlocks(name: string) {
    const material = new MeshStandardMaterial({
      color: new Color(0xffffff),
      metalness: 0.5,
      roughness: 1,
      side: 0,
      // transparent: true,
      // opacity: 0.7,
    });

    const block: BlockDetail | undefined = this.blockMap.get(name);

    console.log(block);

    const blockName = `${name}-detail`;
    let group: Group | undefined = this.scene.getObjectByName(
      blockName
    ) as Group;

    if (!group) {
      group = new Group();
      group.name = blockName;
      // group.rotateX(-Math.PI / 2);
      this.scene.add(group);
    } else group.children = [];

    setTimeout(() => {
      block?.a.forEach((a) => {
        const pts: Vector2[] = [];
        a.p.forEach((p) => pts.push(new Vector2(Number(p.x), Number(p.y))));
        const base = new Shape(pts);
        // const lineGeo = new BufferGeometry().setFromPoints(pts);
        const building = new ExtrudeBufferGeometry(base, {
          bevelEnabled: false,
          steps: a.c,
          depth: a.h * a.c,
        });
        const buildingMesh = new Mesh(building, material);
        buildingMesh.name = "buildings";
        building.rotateX(-Math.PI / 2);
        building.translate(0, 53.3, 0);
        buildingMesh.castShadow = true;
        buildingMesh.receiveShadow = true;
        group?.add(buildingMesh);
        // for (let i = 1; i <= a.c; i++) {
        //   const line = new Line(lineGeo, lineMat);
        //   line.rotateX(-Math.PI / 2);
        //   line.translateZ(Number(a.h) * i);
        //   line.translateX(-600);
        //   this.scene.add(line);
        // }
      });

      block?.b.forEach((b) => {
        const pts: Vector2[] = [];

        b.forEach((p) => pts.push(new Vector2(Number(p.x), Number(p.y))));
        const base = new Shape(pts);

        const building = new ExtrudeBufferGeometry(base, {
          bevelEnabled: false,
          steps: 1,
          depth: 0.45,
        });
        building.rotateX(-Math.PI / 2);
        building.translate(0, 53.3, 0);

        const buildingMesh = new Mesh(building, material);
        buildingMesh.name = "block";
        buildingMesh.castShadow = true;
        buildingMesh.receiveShadow = true;

        group?.add(buildingMesh);
      });

      // block?.t.forEach((t) => {
      //   const loc = new Vector3(t.p.x, t.p.y, 3);
      //   const tree = new SphereGeometry(Number(t.s));

      //   tree.translate(loc.x, loc.y, loc.z);
      //   tree.rotateX(-Math.PI / 2);
      //   tree.translate(0, 53.5, 0);

      //   const treeMesh = new Mesh(tree, material);
      //   treeMesh.castShadow = true;
      //   treeMesh.receiveShadow = true;
      //   group?.add(treeMesh);
      // });
    }, 1000);
  }

  designBase!: Group;
  createCube() {
    // const lineMat = new LineBasicMaterial({ color: new Color(0x000000) });
    let base: Object3D[] = [];
    const loadingManager = new LoadingManager(() => {
      this.designBase = new Group();
      this.designBase.visible = false;
      base.forEach((m) => this.designBase.add(m));
    });

    const loader = new ColladaLoader(loadingManager);
    loader.load("/base.dae", (collada) => {
      collada.scene.children.forEach((m) => {
        let params: MeshStandardMaterialParameters;
        switch (m.name) {
          // case "water": {
          //   params = {
          //     color: new Color(0x738ad1),
          //     metalness: 0.14,
          //     roughness: 0.01,
          //     side: 0,
          //     transparent: true,
          //     opacity: 0.7,
          //   };
          //   break;
          // }
          // case "base": {
          //   params = {
          //     color: new Color(0xb3b3b3),
          //     metalness: 0.5,
          //     roughness: 0.8,
          //     side: 0,
          //   };
          //   break;
          // }
          // case "beach": {
          //   params = {
          //     color: new Color(0xebd9a2),
          //     metalness: 0.5,
          //     roughness: 0.8,
          //     side: 0,
          //   };
          //   break;
          // }
          // case "green": {
          //   params = {
          //     color: new Color(0xa8ca81),
          //     metalness: 0.5,
          //     roughness: 0.8,
          //     side: 0,
          //   };
          //   break;
          // }
          default: {
            params = {
              color: new Color(0xffffff),
              metalness: 0.5,
              roughness: 1,
              side: 0,
              // transparent: true,
              // opacity: 0.7,
            };
            break;
          }
        }
        const material = new MeshStandardMaterial(params);
        const mesh = m as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = material;
        mesh.rotateX(-Math.PI / 2);
        base.push(mesh);
      });
    });
  }
}
export default Three;
