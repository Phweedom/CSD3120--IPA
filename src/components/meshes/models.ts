import { AbstractMesh, Scene, SceneLoader, Vector3, Animation, Mesh, MeshBuilder, PointerDragBehavior, SixDofDragBehavior, MultiPointerScaleBehavior } from "babylonjs";

/**
 * Represents a 3D model loaded from a file.
 */
export class Model {
    m_Name    : string;
    m_Position: Vector3;
    m_Rotation: Vector3;
    m_Scale   : Vector3;

    /**
     * Initializes a new instance of the `Model` class.
     * @param name The name of the model.
     * @param filePath The path to the file containing the model.
     * @param fileName The name of the file containing the model.
     * @param position The position of the model in 3D space.
     * @param rotation The rotation of the model in 3D space.
     * @param scale The scale of the model in 3D space.
     * @param scene The scene in which to load the model.
     */
    constructor(
        name    : string,
        filePath: string,
        fileName: string,
        position: Vector3,
        rotation: Vector3,
        scale   : Vector3,
        scene   : Scene
    ) 
    {
        this.m_Name     = name;
        this.m_Position = position;
        this.m_Rotation = rotation;
        this.m_Scale    = scale;

        SceneLoader.ImportMeshAsync('', filePath, fileName, scene).then(result => {
            const root      = result.meshes[0];
            
            root.id         = name;
            root.name       = name;
            root.position   = position;
            root.rotation   = rotation;
            root.scaling    = scale;

            
            // const sixDofDragBehavior = new SixDofDragBehavior();
            // root.addBehavior(sixDofDragBehavior);

            // const multiPointerScaleBehavior = new MultiPointerScaleBehavior();
            // root.addBehavior(multiPointerScaleBehavior);
        });
    }
}