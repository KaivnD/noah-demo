import {
  Mesh,
  Color,
  Shape,
  Vector2,
  ExtrudeBufferGeometry,
  MeshStandardMaterial,
  Vector3,
  SphereGeometry,
} from "three";

import { BaseScene } from "./base/BaseScene";

import model from "../abc.json";
import eve from "../libs/eve";

interface ThreeState {
  showHelper: boolean;
  clicked: boolean;
}

class Three extends BaseScene<{}, ThreeState> {
  constructor(prop: {}) {
    super(prop);

    this.state = {
      showHelper: true,
      clicked: false,
    };

    eve.on("changeLightPos", (v) => {
      if (!this.directionalLight1) return;
      this.directionalLight1.position.setY(v);
    });
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
      building.translate(-800, 0, 150);

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
      building.translate(-800, 0, 150);

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
      tree.translate(-800, 0, 150);

      const treeMesh = new Mesh(tree, material);
      treeMesh.castShadow = true;
      treeMesh.receiveShadow = true;
      this.scene.add(treeMesh);
    });
  }
}
export default Three;
