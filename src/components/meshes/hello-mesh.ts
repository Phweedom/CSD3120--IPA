import { AbstractMesh, Scene, Mesh, MeshBuilder, StandardMaterial, ActionManager, InterpolateValueAction, Color3, PredicateCondition, Vector3, SetValueAction, ExecuteCodeAction, Observable, Axis, Space} from "babylonjs";
import {TextPlane} from "./text-plane";

export interface HelloMesh{
    scene: Scene;
    mesh: Mesh;
    label: TextPlane;
    //isPicked: boolean;
    onDistanceChangeObservable: Observable<number>;
    onIntersectObservable: Observable<boolean>;
    

    sayHello(message?: string): void;
}

export class HelloSphere extends AbstractMesh implements HelloMesh{
    scene: Scene;
    mesh: Mesh;
    label: TextPlane;
    //isPicked: boolean;
    onDistanceChangeObservable: Observable<number>;
    onIntersectObservable: Observable<boolean>;

    constructor(
        name: string,
        options: {diameter: number},
        scene: Scene,
    ){
        super(name, scene);
        this.scene = scene;
        this.mesh = MeshBuilder.CreateSphere("hello sphere mesh", options, scene);
        this.mesh.material = new StandardMaterial("hello sphere material", scene);
        this.addChild(this.mesh);
        this.label = new TextPlane(
            "hello sphere label", 
            1.5, 
            1, 
            0, 
            options.diameter / 2 + 0.2, 
            0, 
            "Light", 
            "purple", 
            "white", 
            25, 
            scene
        );
        this.addChild(this.label.mesh);
        //this.getChildMeshes();

        this.initAction();
        //this.rotateAction();
    }

    sayHello(message?: string): void{
        console.log("message from hello sphere" + message);
    }

    private initAction(){
        const actionManager = this.actionManager = new ActionManager(this.scene);
        actionManager.isRecursive = true;

        const light = this.scene.getLightById("default light");
        actionManager.registerAction(
            new InterpolateValueAction(
                ActionManager.OnPickTrigger,
                light,
                "diffuse",
                Color3.Black(),
                1000
            )
        )
        .then(
            new InterpolateValueAction(
                ActionManager.OnPickTrigger,
                light,
                "diffuse",
                Color3.White(),
                1000
            )
        );
        // actionManager.registerAction(
        //     new InterpolateValueAction(
        //         ActionManager.OnPickDownTrigger,
        //         this,
        //         'scaling',
        //         new Vector3(2,2,2),
        //         1000,
        //         new PredicateCondition(actionManager, ()=> {
        //                 return light.diffuse.equals(Color3.Black());
        //         })
        //     )
        // );
        const otherMesh = this.scene.getMeshById("sphere");
        actionManager.registerAction(
            new SetValueAction(
            {
                trigger: ActionManager.OnIntersectionEnterTrigger,
                parameter: {
                    mesh: otherMesh,
                    userPreciseIntersection:true,
                }
            },
            this.mesh.material,
            "wireframe",
            true
            ) 
        );

        this.scene.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnKeyUpTrigger,
                    parameter: "r",
                },
                () => {
                    this.scaling.setAll(1);
                    this.mesh.material.wireframe = false;
                    console.log("r was pressed: reset " + this.name); 
                }
            )
        );
    }

    // rotateAction(){
    //     window.addEventListener('keydown', (event) => {
    //         if( event.key === 'z' && this.isPicked){
    //             this.mesh.rotate(Axis.Z, Math.PI/2, Space.WORLD);
    //         }
    //     });

    //     window.addEventListener('keydown', (event) => {
    //         if( event.key === 'x' && this.isPicked){
    //             this.mesh.rotate(Axis.X, Math.PI/2, Space.WORLD);
    //         }
    //     });

    //     window.addEventListener('keydown', (event) => {
    //         if( event.key === 'y' && this.isPicked){
    //             this.mesh.rotate(Axis.Y, Math.PI/2, Space.WORLD);
    //         }
    //     });
    // }
}

