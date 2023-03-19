import { 
    Engine,
    MeshBuilder,
    Scene,
    StandardMaterial,
    CubeTexture,
    Texture,
    Color3,
    ArcRotateCamera,
    Vector3,
    UniversalCamera,
    HemisphericLight,
    PointLight,
    VideoDome,
    SceneLoader,
    Animatable,
    AbstractMesh,
    Color4,
    Sound,
    Matrix,
    Animation,
    AnimationGroup,
    PointerEventTypes,
    VideoTexture,
    ParticleSystem,
    PointerDragBehavior,
    ActionManager,
    Observable,
    Observer,
    WebXRAbstractFeature,
    WebXRFeaturesManager,
    WebXRDefaultExperience,
    Mesh,
    WebXRFeatureName,
    WebXRMotionControllerTeleportation,
    MultiPointerScaleBehavior,
    GizmoManager,
    SixDofDragBehavior,
    ExecuteCodeAction,
    Nullable,
    Axis,
    Space,
    KeyboardInfo,
    KeyboardInfoPre,
} from "babylonjs";
import {AdvancedDynamicTexture, TextBlock} from "babylonjs-gui";
import 'babylonjs-loaders'
import { AuthoringData } from "xrauthor-loader";
import { HelloSphere, TextPlane, Model } from './components/meshes'

/**
 * Represents the main application that runs the scene.
 */
export class App {

    private engine: Engine;
    private canvas: HTMLCanvasElement;
    private data: AuthoringData;

    /**
     * Constructs a new instance of the App class.
     * @param engine - The Babylon.js Engine instance.
     * @param canvas - The HTMLCanvasElement used for rendering.
     * @param data - The data used for authoring the scene.
     */
    constructor(engine: Engine, canvas: HTMLCanvasElement, data: any)
    {
        this.engine = engine;
        this.canvas = canvas;
        this.data = data;      
        console.log('app is running');
    }

    /**
     * Creates a new Babylon.js scene and returns it.
     * @param canvas - HTMLCanvasElement to use for rendering the scene.
     * @param engine - BABYLON.Engine to use for rendering the scene.
     * @param xr - WebXRDefaultExperience to use for VR/AR support.
     * @returns A new BABYLON.Scene object.
     */
    async createScene () {
        console.log(this.data)
        /**
         * Scene creation
         */
        const scene = new Scene(this.engine);
        scene.actionManager = new ActionManager(scene);
        this.createCamera(scene);
        scene.createDefaultLight();
        //this.createLights(scene);
        //scene.createDefaultCameraOrLight(false, true, true);

        /**
         * Environment
         */
        // Ground
        const groundMaterial = new StandardMaterial("ground material", scene);
        groundMaterial.backFaceCulling = true;
        groundMaterial.diffuseTexture = new Texture('/assets/textures/woodfloor.png', scene);
        const ground = MeshBuilder.CreateGround("ground", {width: 20, height: 20},scene);
        ground.material = groundMaterial;
        ground.position.set(0, -1, 8);

        /**
         * Text creation
         */
        this.createText(scene);

        //Wall
        this.loadWall(scene);

        //Models
        this.loadModel(scene, 'H2O', new Vector3(1,0.35,3.5));
        this.loadModel(scene, 'O2', new Vector3(0,0.3,3.5));
        this.loadModel(scene, 'H2', new Vector3(-1,0.3,3.5));

        /**
         * Sphere creation
         */
        const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 1.3}, scene);
        sphere.position.x = 8;
        sphere.position.y = -0.5;
        sphere.position.z = 8;

        /**
         * Hello Sphere creation
         */
        const helloSphere = new HelloSphere("Light Switch", {diameter: 1}, scene);
        helloSphere.position.set(8, 1, 8);
        //helloSphere.sayHello("testing");

        this.createTable(scene);

         /**
         * Class Room Model
         */
         //const floor = this.loadClassroom(scene, 'basic_classroom.glb', new Vector3(0, -1.3, 1), 1);
         //const classroom = MeshBuilder.CreateGround("classroom",{width: 12, height: 12},scene);
         //classroom.material = floor;
         //classroom.position.set(0, -1, 8);

        
        
        /**
         * Interactions
         */
        const pointerDragBehaviour = new PointerDragBehavior({
            dragPlaneNormal: Vector3.Up(),
        });
        pointerDragBehaviour.onDragStartObservable.add(evtData =>{
            console.log("drag Start: pointer ID - " + pointerDragBehaviour.currentDraggingPointerId);
            console.log(evtData);
        });
        sphere.addBehavior(pointerDragBehaviour);

        const helloSphereDragBehaviour = new PointerDragBehavior({
            dragPlaneNormal: Vector3.Backward(),
        });
        helloSphere.addBehavior(helloSphereDragBehaviour);

        /**
         * Multiple pointer scale
         */
        const multiPointerScaleBehavior = new MultiPointerScaleBehavior();
        helloSphere.addBehavior(multiPointerScaleBehavior);

        /**
         * Gizmo Behaviors
         */
        //const gizmoManager = new GizmoManager(scene);
        // gizmoManager.positionGizmoEnabled = true;
        // gizmoManager.rotationGizmoEnabled = true;
        // gizmoManager.scaleGizmoEnabled = true;
        //gizmoManager.boundingBoxGizmoEnabled = true;

        /**
         * User Observables
         * 
         * Create an observable for detecting intersections
         */
        const onIntersectObservable = new Observable<boolean> ();
        scene.registerBeforeRender( function() {
            const isIntersecting = sphere.intersectsMesh(helloSphere, true, true);
            onIntersectObservable.notifyObservers(isIntersecting);
        });
        helloSphere.onIntersectObservable = onIntersectObservable;
        const redColor = Color3.Red();
        const whiteColor = Color3.White();
        helloSphere.onIntersectObservable.add(isIntersecting => {
            const material = helloSphere.mesh.material as StandardMaterial;
            const isRed = material.diffuseColor == redColor;
            helloSphere.onIntersectObservable.add((isIntersecting) => {
                const material = helloSphere.mesh.material as StandardMaterial;
                const isRed = material.diffuseColor == redColor;
                if(isIntersecting && !isRed){
                    material.diffuseColor = redColor;
                }else if(!isIntersecting && isRed){
                    material.diffuseColor = whiteColor;
                }
            })
        });

        // create an observable for checking distance
        const onDistanceChangeObservable = new Observable<number>();
        let previousState: number = null;
        scene.onBeforeRenderObservable.add( () => {
            const currentState = Vector3.Distance(sphere.position, helloSphere.position);
            if(currentState !== previousState){
                console.log("distance updated!");
                previousState = currentState;
                onDistanceChangeObservable.notifyObservers(currentState);
            }
        });
        helloSphere.onDistanceChangeObservable = onDistanceChangeObservable;
        const blueColor = Color3.Blue();
        helloSphere.onDistanceChangeObservable.add((distance) => {
            const isCloseEnough = distance <= 1.2;
            const material = helloSphere.mesh.material as StandardMaterial;
            const isBlue = material.diffuseColor === blueColor;
            const isRed = material.diffuseColor === redColor;
            if(isCloseEnough && !isBlue && !isRed){
                material.diffuseColor = blueColor;
            }else if(!isCloseEnough && isBlue){
                material.diffuseColor = whiteColor;
            }
        });

        //Create Observer
        const observer = new Observer<number> ((disntace) => {
            helloSphere.label.textBlock.text = "d: " + disntace.toFixed(2);
        }, -1);
        //onDistanceChangeObservable.observers.push(observer);

        //Add observer using coroutine
        // const addObserverCoroutine = function* () {
        //     yield;
        //     console.log("frame" + scene.getFrameId() + ": add observer");
        //     onDistanceChangeObservable.observers.push(observer);
        // };
        // scene.onBeforeRenderObservable.runCoroutineAsync(addObserverCoroutine);

        /**
         * XR Video
         */
        const videoHeight = 5;
        const videoWidth = videoHeight * this.data.recordingData.aspectRatio;
        const videoPlane = MeshBuilder.CreatePlane('video plane',
        {
            height: videoHeight,
            width: videoWidth,
        },
        scene);
        videoPlane.position.set(0, 1, 14);
        const videoMaterial = new StandardMaterial('video material', scene);
        const videoTexture = new VideoTexture('video texture', this.data.video, scene);
        videoTexture.video.autoplay = false;
        videoTexture.onUserActionRequestedObservable.add(() => { });
        videoMaterial.diffuseTexture = videoTexture;
        videoMaterial.roughness = 1;
        videoMaterial.emissiveColor = Color3.White();
        videoPlane.material = videoMaterial;
        videoPlane.rotation.z = Math.PI;
        scene.onPointerObservable.add(evtData => {
            console.log("picked")
            if(evtData.pickInfo.pickedMesh === videoPlane){
                console.log("video plane")
                if(videoTexture.video.paused){
                    videoTexture.video.play();
                    //animationGroup.play(true);
                }
                else{
                    videoTexture.video.pause();
                    //animationGroup.pause();
                }
                console.log(videoTexture.video.paused? 'playing':'paused');
            }
            console.log(evtData.pickInfo.pickedMesh);
        }, PointerEventTypes.POINTERPICK);

        /**
         * Animation
         */
        // const id = 'm2';
        // const track = this.data.recordingData.animation.tracks[id];
        // const lenght = track.times.length;
        // const fps = length / this.data.recordingData.animation.duration;
        // const keyframes = [];
        // const XRModel = MeshBuilder.CreateSphere('XRModel', {diameter: 1.3}, scene);
        // for (let i = 0; i < length; i++){
        //     const mat = Matrix.FromArray(track.matrices[i].elements);
        //     const pos = mat.getTranslation();
        //     //Convert position form right handed to left handed coords
        //     pos.z = -pos.z;
        //     const s = 6 / pos.z;
        //     keyframes.push({
        //         frame: track.times[i] * fps,
        //         value: pos.scale(s).multiplyByFloats(3, 3, 1),
        //     });
        // }
        // const animation = new Animation('animation', 'position', fps, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);
        // animation.setKeys(keyframes);
        // XRModel.animations = [animation];
        // scene.beginAnimation(XRModel, 0, length - 1, true);
        // const animationGroup = new AnimationGroup('animation group', scene);
        // //animationGroup.addTargetedAnimation(animation, sphere);

        // const info = this.data.recordingData.modelInfo[id];
        // const label = info.label;
        // const name = info.name;
        // const url = this.data.models[name];
        // SceneLoader.AppendAsync(url, undefined,scene,undefined,
        //     '.glb').then(result =>{
        //         const root = result.getMeshById('__root__');
        //         root.id = id + ': ' + label;
        //         root.name = label;
        //         XRModel.position.setAll(0);
        //         XRModel.position.y = -0.5;
        //         XRModel.position.z = -0.1;
        //         XRModel.setParent(root);
        //         //XRModel.text = label;
        //         animationGroup.addTargetedAnimation(animation,root);
        //         animationGroup.reset();
        // });

        /**
         * XR Creation
         */
        const xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: 'immersive-vr'
            },
            optionalFeatures: true
        });

        const debugXR = xr;

        const featureManager = xr.baseExperience.featuresManager;
        console.log(WebXRFeaturesManager.GetAvailableFeatures());

        // Get the first controller
        var controller = xr.input.controllers[0];

        //Locomotion
        this.initLocomotion(xr, featureManager, ground, scene);

        //Hand Tracking
        try{
            featureManager.enableFeature(WebXRFeatureName.HAND_TRACKING, "latest", {
                xrInput: xr.input,
                jointMeshes:{
                    disableDeafultHandMesh: false,
                }
            });
        }catch(error){
            console.log(error);
        }

        //Hand&Controller drag
        let mesh: AbstractMesh;
        xr.input.onControllerAddedObservable.add((controller) => {
            controller.onMotionControllerInitObservable.add((motionController) => {
                const trigger = motionController.getComponentOfType("trigger");
                const touchPad = motionController.getComponentOfType("touchpad");
                
                 // check if a there is a mesh under the pointer, if yes, return the distance
                 function checkMeshUnderPointer() : Number {
                    // Check if there is a mesh under the controller's pointer
                    if((mesh = xr.pointerSelection.getMeshUnderPointer(controller.uniqueId))) {
                        console.log("mesh under controller pointers: " + mesh.name);
                        
                        // If the mesh is not the ground plane
                        if(mesh.name !== "ground") {
                            // Calculate the distance between the motion controller and the mesh
                            const distance = Vector3.Distance(
                                motionController.rootMesh.getAbsolutePosition(), mesh.getAbsolutePosition()
                            );
                            console.log("distance: " + distance);
        
                            return distance;
                        }
                    }
                    return null;
                }

                // When the state of the trigger button changes
                trigger.onButtonStateChangedObservable.add( () => {
                    if(trigger.changes.pressed){
                        if(trigger.pressed)
                        {
                            if(
                                (mesh = xr.pointerSelection.getMeshUnderPointer(controller.uniqueId))
                            ){
                                console.log("mesh under controller pointer:" + mesh.name);
                                if(mesh.name !== "ground"){
                                    const distance = Vector3.Distance(
                                        motionController.rootMesh.
                                        getAbsolutePosition(),
                                        mesh.getAbsolutePosition()
                                    );
                                    console.log ("distance: " + distance);
                                    if(distance <1){
                                        mesh.setParent(motionController.rootMesh);
                                        console.log("grab Mesh: " + mesh.name);
                                    }
                                }
                            }else{
                                console.log("no mesh under pointer")
                            }
                        }else{
                            if( mesh && mesh.parent){
                                mesh.setParent(null);
                            }
                        }
                    }
                })
            });
        });

        return scene;
    }

    /**
     * Creates a universal camera and attaches it to the scene.
     * @param scene The scene to attach the camera to.
     */
    createCamera(scene: Scene){
        // Create a new universal camera with position (0, 0, -1)
        const camera = new UniversalCamera(
            "uniCamera",
            new Vector3(0, 0, -1),
            scene
        );

        // Attach camera controls to the canvas
        camera.attachControl(this.canvas, true);
    }

    /**
     * Creates and positions hemispheric and point lights in the scene.
     * @param scene The scene to add the lights to.
     */
    createLights(scene: Scene){
        // Create a new hemispheric light with direction (-1, 1, 0)
        const hemiLight = new HemisphericLight(
            "hemLight",
            new Vector3(-1, 1, 0),
            scene
        );

        // Set the intensity and color of the hemispheric light
        hemiLight.intensity = 0.3;
        hemiLight.diffuse = new Color3(1, 1, 1);

        // Create a new point light at position (0, 1.5, 2)
        const pointLight = new PointLight(
            "pointLight",
            new Vector3(0, 1.5, 2),
            scene
        );

        // Set the intensity and color of the point light
        pointLight.intensity = 1;
        pointLight.diffuse = new Color3(1, 0, 0);
    }

    /**
     * Creates a table mesh with a tabletop and four legs.
     * @param scene The scene to add the table to.
     */
    createTable(scene: Scene){
        // Create a table
        const tableTop = MeshBuilder.CreateBox("tableTop", { width: 3, depth: 2, height: 0.1 }, scene);

        // Create an array of four table leg meshes with dimensions (0.1, 0.1, 1)
        const tableLegs = [
            MeshBuilder.CreateBox("tableLeg1", { width: 0.1, depth: 0.1, height: 1 }, scene),
            MeshBuilder.CreateBox("tableLeg2", { width: 0.1, depth: 0.1, height: 1 }, scene),
            MeshBuilder.CreateBox("tableLeg3", { width: 0.1, depth: 0.1, height: 1 }, scene),
            MeshBuilder.CreateBox("tableLeg4", { width: 0.1, depth: 0.1, height: 1 }, scene),
        ];

        // Position the table top and legs
        tableTop.position.set(0, 0, 3.5);
        tableLegs[0].position.set(-1.4, -0.5, 3);
        tableLegs[1].position.set(1.4, -0.5, 3);
        tableLegs[2].position.set(-1.4, -0.5, 4);
        tableLegs[3].position.set(1.4, -0.5, 4);
    }

    /**
     * Creates and positions four walls in the scene.
     * @param scene The scene to add the walls to.
     */
    loadWall(scene: Scene){
        // Create the walls
        const wall1 = MeshBuilder.CreateBox("wall1", { width: 20, height: 10, depth: 0.1 }, scene);
        const wall2 = MeshBuilder.CreateBox("wall2", { width: 20, height: 10, depth: 0.1 }, scene);
        const wall3 = MeshBuilder.CreateBox("wall3", { width: 20, height: 10, depth: 0.1 }, scene);
        const wall4 = MeshBuilder.CreateBox("wall4", { width: 20, height: 10, depth: 0.1 }, scene);

        // Position the walls
        wall1.position.set(0, 4, 18);
        wall2.position.set(0, 4, -2);
        wall3.position.set(10, 4, 8);
        wall4.position.set(-10, 4, 8);

        // Rotate walls 3 and 4 by 90 degrees
        wall3.rotation.y = Math.PI / 2;
        wall4.rotation.y = Math.PI / 2;

        // Set the material for the walls and ground
        const material = new StandardMaterial("material", scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        material.diffuseTexture = new Texture("/assets/textures/brickWall.jpg", scene);
        material.specularColor = new BABYLON.Color3(0, 0, 0);
        material.ambientColor = new BABYLON.Color3(1, 1, 1);
        wall1.material = material;
        wall2.material = material;
        wall3.material = material;
        wall4.material = material;
    }

    /**
     * Loads a 3D model from a file, applies various transformations to it, and makes it pickable and rotatable using the controller.
     * @param scene The scene to add the model to.
     * @param modelName The name of the model file to load (without the file extension).
     * @param position The position to place the model in the scene.
     */
    loadModel(scene: Scene, modelName: string, position: Vector3){
        SceneLoader.ImportMeshAsync('', 'assets/models/', modelName + '.glb', scene).then(result => {
                const root = result.meshes[0];
                root.id = modelName + 'Root';
                root.name = modelName + 'Root';

                // playing with transform
                root.position.set(position.x, position.y, position.z);
                root.rotation = new Vector3(0, 0, Math.PI);
                root.scaling.setAll(0.5);

                // Make the mesh pickable
                root.isPickable = true;

                // Create an action when the mesh is clicked
                root.actionManager = new ActionManager(scene);
                root.actionManager.registerAction(new ExecuteCodeAction(
                    ActionManager.OnPickTrigger,
                    (event) => {
                    // Handle the click event here
                    console.log('Mesh clicked!');
                    }
                ));
                //Rotate
                //var keyboard = new KeyboardInfoPre();
                root.actionManager.registerAction(
                    new ExecuteCodeAction(
                        {
                            trigger: ActionManager.OnKeyUpTrigger,
                            parameter: "z",
                        },
                        () => {
                            root.rotate(Axis.Z, Math.PI/2, Space.WORLD);
                        }
                    )
                );
                root.actionManager.registerAction(
                    new ExecuteCodeAction(
                        {
                            trigger: ActionManager.OnKeyUpTrigger,
                            parameter: "x",
                        },
                        () => {
                            root.rotate(Axis.X, Math.PI/2, Space.WORLD);
                        }
                    )
                );
                root.actionManager.registerAction(
                    new ExecuteCodeAction(
                        {
                            trigger: ActionManager.OnKeyDownTrigger,
                            parameter: "c",
                        },
                        () => {
                            root.rotate(Axis.Y, Math.PI/2, Space.WORLD);
                            console.log('C pressed!');
                        }
                    )
                );

                //window.addEventListener('keydown',)

                // Animation & Particles
                this.createAnimation(scene, root);
                //this.createParticles(scene);

                const sixDofDragBehavior = new SixDofDragBehavior();
                root.addBehavior(sixDofDragBehavior);

                const multiPointerScaleBehavior = new MultiPointerScaleBehavior();
                root.addBehavior(multiPointerScaleBehavior);
            }
        )
    }

    /**
     * Loads a 3D model and returns the root mesh of the model.
     * @param scene The scene to load the model into.
     * @param fileName The name of the file containing the model.
     * @param position The position to place the model in the scene.
     * @param scale The scale factor to apply to the model.
     * @returns The root mesh of the loaded model.
     */
    loadClassroom(scene: Scene, fileName: string, position: Vector3, scale: number) : AbstractMesh {
        let mesh: AbstractMesh;
        SceneLoader.ImportMeshAsync('', 'assets/textures/', fileName, scene).then(result => {
            const root = result.meshes[0];
            root.id = fileName;
            root.name = fileName;
            root.position = position;
            root.scaling.setAll(scale);
            mesh = root;
        });
        return mesh;
    }

    /**
     * Creates a rotation animation for a given model.
     * @param scene - The scene to which the model belongs.
     * @param model - The model to animate.
     */
    createAnimation(scene: Scene, model: AbstractMesh){
        const animationName = 'rotateAnim';
        const anim = new Animation(
            // name, property name, by how much
            animationName,'rotation', 30,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE,
        );

        const keyframes = [
            {frame: 0, value: new Vector3(0, 0, 0)},
            {frame: 120, value: new Vector3(0, 0, 0)}
        ];
        // set animation keyframes
        anim.setKeys(keyframes);

        // array of animation
        model.animations = [];
        // push into animation
        model.animations.push(anim);
    }

    /**
     * Creates a particle system in the scene.
     * @param scene - The scene to add the particle system to.
     * @returns void
     */
    createParticles(scene: Scene){
        const particleSystem = new ParticleSystem("patricles", 5000, scene);
        particleSystem.particleTexture = new Texture(
            "public/assets/textures/flare.png",
            scene
        );

        particleSystem.emitter = new Vector3(0, 0, 0);
        particleSystem.minEmitBox = new Vector3(0, 0, 0);
        particleSystem.maxEmitBox = new Vector3(0, 0, 0);

        particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
        particleSystem.color2 = new Color4(0.3, 0.5, 1.0, 1.0);
        particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

        particleSystem.minSize = 0.01;
        particleSystem.maxSize = 0.05;

        (particleSystem.minLifeTime = 0.3, (particleSystem.maxLifeTime = 1.5));

        particleSystem.direction1 = new Vector3(-1, 8, 1);
        particleSystem.direction2 = new Vector3(1,8, -1);

        particleSystem.minEmitPower = 0.2;
        particleSystem.maxEmitPower = 0.8;
        particleSystem.updateSpeed = 0.01;

        particleSystem.gravity = new Vector3(0, -9.8, 0);
        particleSystem.start();
    }

    /**
    * Adds sound effects to the scene.
    * @param scene - The Babylon.js Scene object to which the sounds will be added.
    */
    addSounds(scene: Scene){ 
        const mucis = new Sound(
            "music",
            "assets/sounds/hello-xr.mp3",
            scene,
            null,
            {loop: true, autoplay: false}
        );
        //this.sound = new Sound("sound", "assets/sounds/button.mp3", scene, null);
    }

    /**
    * Creates a 3D text plane with a specific message and color scheme.
    * @param scene - The Babylon.js Scene object to which the text plane will be added.
    */
    createText(scene :Scene){
        const helloPlane = new TextPlane(
            "hello plane",
            3,
            1, 
            0,
            4,
            14,
            "Hello XR",
            "White", 
            "purple",
            60,
            scene
        );

        helloPlane.textBlock.onPointerUpObservable.add( (evtData) => {

        });

        helloPlane.textBlock.onPointerDownObservable.add(() =>{
            //this.sound.play();
        })
    }

    // createSkyBox(scene: Scene){
    // }

    /**
     * Initialize the teleportation locomotion mode.
     * @param xr - The WebXR experience to use for teleportation.
     * @param featuresManager - The WebXR features manager to use for enabling teleportation.
     * @param ground - The ground mesh to use as the teleportation target.
     * @param scene - The scene to which the teleportation target should be added.
     */
    initLocomotion(xr: WebXRDefaultExperience, featuresManager: WebXRFeaturesManager, ground: Mesh, scene: Scene ){
        console.log("movement mode: teleportation");
        const teleportation = featuresManager.enableFeature(
            WebXRFeatureName.TELEPORTATION,
            "stable",
            {
                xrInput: xr.input,
                floorMeshes: [ground],
                timeToTeleport: 2000,
                useMainComponentOnly: true,
                defaultTargetMeshOptions:{
                    teleportationFillColor: "#55FF99",
                    teleportationBorderColor: "blue",
                    torusArrowMaterial: ground.material,
                },
            },
            true,
            true
        ) as WebXRMotionControllerTeleportation;
        teleportation.parabolicRayEnabled = true;
        teleportation.parabolicCheckRadius = 2;
    }

    /**
     * Rotate a mesh using a motion controller.
     * @param mesh - The mesh to rotate.
     * @param controller - The controller to use for the rotation.
     */
    rotateMeshWithController(mesh, controller){
        controller.onSelectObservable.add(function() {
            var position = controller.getAbsolutePosition();
            var rotation = controller.getAbsoluteRotationQuaternion();
        
            mesh.position.copyFrom(position);
            mesh.rotationQuaternion.copyFrom(rotation);
        });
    }
}