import { Engine } from "babylonjs";
import { AuthoringData } from "xrauthor-loader";
import {App} from './app'

export function createXRScene(canvasID: string, authoringData: AuthoringData)
{
    const canvas = <HTMLCanvasElement>document.getElementById(canvasID);

    const engine =  new Engine(canvas, true);

    const app = new App(engine, canvas, authoringData);
    app.createScene().then(scene => {
        engine.runRenderLoop(() => {
            scene.render();
        })
    });

    window.addEventListener('resize', function() {
        engine.resize();
    });
}

