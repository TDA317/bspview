import { Vector3 } from "three";
import { Brush } from "./Brush";
import { Face } from "./Face";

export class MapParser {
    private brushes: Brush[] = [];

    constructor(private mapData: string) {
        this.parse();
    }

    private parse() {
        const lines = this.mapData.split("\n");
        let brushLines: string[] = [];

        for (const line of lines) {
            if (line.trim() === "{") {
                brushLines = [];
            } else if (line.trim() === "}") {
                this.createBrush(brushLines);
            } else {
                brushLines.push(line);
            }
        }
    }

    private createBrush(brushLines: string[]) {
        const faces: Face[] = [];
        for (const line of brushLines) {
            const parts = line.trim().split(" ");
            if (parts.length < 15) continue;

            const v1 = new Vector3(
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
            );
            const v2 = new Vector3(
                parseFloat(parts[6]),
                parseFloat(parts[7]),
                parseFloat(parts[8])
            );
            const v3 = new Vector3(
                parseFloat(parts[11]),
                parseFloat(parts[12]),
                parseFloat(parts[13])
            );
            const texture = parts[15];
            faces.push(new Face(v1, v2, v3, texture));
        }

        const brush = new Brush();
        brush.from(faces);
        this.brushes.push(brush);
    }

    public getBrushes(): Brush[] {
        return this.brushes;
    }
}
