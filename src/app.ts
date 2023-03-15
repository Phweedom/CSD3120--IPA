import { Animation, AnimationGroup, Color3, Engine, HtmlElementTexture, Matrix, MeshBuilder, PointerEventTypes, Scene, SceneLoader, StandardMaterial, VideoTexture } from "babylonjs";
import {AdvancedDynamicTexture, TextBlock} from "babylonjs-gui";
import 'babylonjs-loaders'
import { AuthoringData } from "xrauthor-loader";

export class App {

    private engine: Engine;
    private canvas: HTMLCanvasElement;
    private data: AuthoringData;

    constructor(engine: Engine, canvas: HTMLCanvasElement, data: any)
    {
        this.engine = engine;
        this.canvas = canvas;
        this.data = data;      
        console.log('app is running');
    }

    async createScene () {
        console.log(this.data)
        /**
         * Scene creation
         */
        const scene = new Scene(this.engine);
        scene.createDefaultCameraOrLight(false, true, true);

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
         * Video
         */
        const videoHeight = 5;
        const videoWidth = videoHeight * this.data.recordingData.aspectRatio;
        const videoPlane = MeshBuilder.CreatePlane('video plane',
        {
            height: videoHeight,
            width: videoWidth,
        },
        scene);
        videoPlane.position.z = 6;
        const videoMaterial = new StandardMaterial('video material', scene);
        const videoTexture = new VideoTexture('video texture', this.data.video, scene);
        videoTexture.video.autoplay = false;
        videoTexture.onUserActionRequestedObservable.add(() => { });
        videoMaterial.diffuseTexture = videoTexture;
        videoMaterial.roughness = 1;
        videoMaterial.emissiveColor = Color3.White();
        videoPlane.material = videoMaterial;
        scene.onPointerObservable.add(evtData => {
            console.log("picked")
            if(evtData.pickInfo.pickedMesh === videoPlane){
                console.log("video plane")
                if(videoTexture.video.paused){
                    videoTexture.video.play();
                    animationGroup.play(true);
                }
                else{
                    videoTexture.video.pause();
                    animationGroup.pause();
                }
                console.log(videoTexture.video.paused? 'playing':'paused');
            }
            console.log(evtData.pickInfo.pickedMesh);
        }, PointerEventTypes.POINTERPICK);

        /**
         * Animation
         */
        const id = 'm2';
        const track = this.data.recordingData.animation.tracks[id];
        const lenght = track.times.length;
        const fps = length / this.data.recordingData.animation.duration;
        const keyframes = [];
        for (let i = 0; i < length; i++){
            const mat = Matrix.FromArray(track.matrices[i].elements);
            const pos = mat.getTranslation();
            //Convert position form right handed to left handed coords
            pos.z = -pos.z;
            const s = 6 / pos.z;
            keyframes.push({
                frame: track.times[i] * fps,
                value: pos.scale(s).multiplyByFloats(3, 3, 1),
            });
        }
        const animation = new Animation('animation', 'position', fps, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);
        animation.setKeys(keyframes);
        //sphere.animations = [animation];
        //scene.beginAnimation(sphere, 0, length - 1, true);
        const animationGroup = new AnimationGroup('animation group', scene);
        //animationGroup.addTargetedAnimation(animation, sphere);

        const info = this.data.recordingData.modelInfo[id];
        const label = info.label;
        const name = info.name;
        const url = this.data.models[name];
        SceneLoader.AppendAsync(url, undefined,scene,undefined,
            '.glb').then(result =>{
                const root = result.getMeshById('__root__');
                root.id = id + ': ' + label;
                root.name = label;
                helloPlane.position.setAll(0);
                helloPlane.position.y = -0.5;
                helloPlane.position.z = -0.1;
                helloPlane.setParent(root);
                helloText.text = label;
                animationGroup.addTargetedAnimation(animation,root);
                animationGroup.reset();
        });

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