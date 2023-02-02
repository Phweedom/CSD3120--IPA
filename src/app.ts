import { Engine, HtmlElementTexture, MeshBuilder, Scene } from "babylonjs";
import {AdvancedDynamicTexture, TextBlock} from "babylonjs-gui";

export class App {

    private engine: Engine;
    private canvas: HTMLCanvasElement;

    constructor(engine: Engine, canvas: HTMLCanvasElement)
    {
        this.engine = engine;
        this.canvas = canvas;
        console.log('app is running');
    }

    async createScene() {
        /**
         * Scene creation
         */
        const scene = new Scene(this.engine);
        scene.createDefaultCameraOrLight();

        /**
         * Sphere creation
         */
        const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 1.3}, scene);
        sphere.position.y = 1;
        sphere.position.z = 5;

        /**
         * Text creation
         */
        const helloPlane = MeshBuilder.CreatePlane('hello plane', {size: 15});
        helloPlane.position.y = 0;
        helloPlane.position.z = 5;
        const helloTexture = AdvancedDynamicTexture.CreateForMesh(helloPlane);
        const helloText = new TextBlock('hello');
        helloText.text ='hello XR';
        helloText.color = 'purple';
        helloText.fontSize = 50;
        helloTexture.addControl(helloText);

        /**
         * XR Creation
         */
        const xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: 'immersive-vr'
            }
        });

        //xr.baseExperience.featuresManager

        //only for debugging
        //(window as any) = xr; 

        const debugXR = xr;


        return scene;
    }

}