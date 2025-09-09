import { BufferAttribute, BufferGeometry, Vector3 } from "three";
import { Face } from "./Face";

export class Brush {
    public faces: Face[];

    constructor() {
        this.faces = [];
    }

    public from(faces: Face[]) {
        this.faces = faces;
    }

    public geometry(): BufferGeometry {
        const geometry = new BufferGeometry();

        const vertices = this.faces.flatMap((face) => [
            face.v1.x,
            face.v1.y,
            face.v1.z,
            face.v2.x,
            face.v2.y,
            face.v2.z,
            face.v3.x,
            face.v3.y,
            face.v3.z,
        ]);

        const normals = this.faces.flatMap((face) => [
            face.normal.x,
            face.normal.y,
            face.normal.z,
            face.normal.x,
            face.normal.y,
            face.normal.z,
            face.normal.x,
            face.normal.y,
            face.normal.z,
        ]);

        geometry.setAttribute(
            "position",
            new BufferAttribute(new Float32Array(vertices), 3)
        );
        geometry.setAttribute(
            "normal",
            new BufferAttribute(new Float32Array(normals), 3)
        );

        return geometry;
    }
}
