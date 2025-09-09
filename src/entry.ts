import * as THREE from "three";
import { CameraControls } from "./CameraControls";
import { WadManager } from "./WadManager";
import { ListApi, Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import { FpsGraphBladeApi } from "@tweakpane/plugin-essentials";
import { FilePicker } from "./FilePicker";
import { DragEvents } from "./DragEvents";
import { BspRenderer } from "./BspRenderer";
import { MapParser } from "./MapParser";
import { AmbientLight, BoxGeometry, CubeTextureLoader, Mesh, MeshBasicMaterial, MeshStandardMaterial, Scene } from "three";

const NEAR_CLIPPING = 0.01;
const FAR_CLIPPING = 10000;

const viewElement = document.body;

const params = {
    entities: false,
    models: false,
};

const pane = new Pane();
pane.registerPlugin(EssentialsPlugin);

const fileButton = pane.addButton({
    title: "Load Map",
});

// FPS graph
const fpsGraph = pane.addBlade({
    view: "fpsgraph",
    label: "fps",
}) as FpsGraphBladeApi;

const materialBlade = pane.addBlade({
    view: "list",
    label: "material",
    options: [
        { text: "phong", value: "phong" },
        { text: "normal", value: "normal" },
        { text: "wireframe", value: "wireframe" },
    ],
    value: "phong",
}) as ListApi<string>;

const wadFolder = pane.addFolder({
    title: "WADs",
});

const wadButton = wadFolder.addButton({
    title: "Load WAD",
});

const clearWadButton = wadFolder.addButton({
    title: "Clear WADs",
});

// const info = pane.addFolder({
//     title: "Info",
// });

const canvas = document.createElement("canvas");
const context = canvas.getContext("webgl2", { alpha: false });

const clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    NEAR_CLIPPING,
    FAR_CLIPPING
);
const orthoCamera = new THREE.OrthographicCamera(
    0,
    0,
    0,
    0,
    NEAR_CLIPPING,
    FAR_CLIPPING
);
const renderer = new THREE.WebGLRenderer({ canvas, context });
const controls = new CameraControls(camera, renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
viewElement.appendChild(renderer.domElement);

window.onresize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
};

const filePicker = new FilePicker();

fileButton.on("click", async () => {
    const file = await filePicker.activate();
    const buffer = await file.arrayBuffer();
    loadMap(file.name, buffer);
});

const wadManager = new WadManager();
const dragEvents = new DragEvents(loadMap, wadManager);

loadMapFromURL("bsp/de_inferno.bsp");

wadButton.on("click", async () => {
    const file = await filePicker.activate();
    const buffer = await file.arrayBuffer();
    wadManager.load(file.name, buffer);
    console.log(wadManager.wadState());
});

async function loadMapFromURL(url: string) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const name = url.split("/").pop();

    if (buffer.byteLength > 0) {
        loadMap(name, buffer);
    }
}

function checkMobileSupport() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        alert('bspview has very limited mobile support');
    }
}

checkMobileSupport();

async function loadMap(name: string, buffer: ArrayBuffer) {

    const scene = new Scene();
    const light = new AmbientLight(0xffffff, 1.0);
    scene.add(light);

    let map: any;

    if (name.endsWith(".bsp")) {
        map = new BspRenderer(buffer, wadManager);
        scene.add(map.mesh());
    } else if (name.endsWith(".map")) {
        const text = new TextDecoder().decode(buffer);
        const parser = new MapParser(text);
        const brushes = parser.getBrushes();
        const material = new MeshStandardMaterial({ color: 0xcccccc });
        for (const brush of brushes) {
            const mesh = new Mesh(brush.geometry(), material);
            scene.add(mesh);
        }
    }

    // Register hotkeys

    materialBlade.on('change', (ev) => {
        if (!map) return;
        let material: THREE.Material = null;
        switch (ev.value) {
            case 'phong':
            default:
                material = new THREE.MeshPhongMaterial()
                break;
            case 'normal':
                material = new THREE.MeshNormalMaterial();
                break;
            case 'wireframe':
                material = new THREE.MeshBasicMaterial({ wireframe: true });
                break;
        }

        map.mesh().material = material;
    });

    controls.registerHotkey(220, () => {
        controls.invertMouseY = !controls.invertMouseY;
    });

    // const level = bsp.models[0];

    const render = () => {
        const delta = clock.getDelta();
    
        fpsGraph.begin();
    
        renderer.render(scene, camera);
    
        fpsGraph.end();
    
        controls.update(delta);
        requestAnimationFrame(render);
    };
    
    requestAnimationFrame(render);
}
