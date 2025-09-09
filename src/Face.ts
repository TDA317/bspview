import { Vector3 } from "three";

export class Face {
    public normal: Vector3;

    constructor(
        public v1: Vector3,
        public v2: Vector3,
        public v3: Vector3,
        public texture: string
    ) {
        const _v1 = this.v2.clone().sub(this.v1);
        const _v2 = this.v3.clone().sub(this.v1);
        this.normal = _v1.cross(_v2).normalize();
    }
}
