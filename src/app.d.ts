import { Engine, Scene } from "babylonjs";
export declare class App {
    private engine;
    private canvas;
    private data;
    constructor(engine: Engine, canvas: HTMLCanvasElement, data: any);
    createScene(): Promise<Scene>;
}
