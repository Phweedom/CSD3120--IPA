import {MeshBuilder, Scene, Mesh} from 'babylonjs';
import {AdvancedDynamicTexture, TextBlock} from 'babylonjs-gui'

export class TextPlane{
    public mesh: Mesh;
    public textBlock: TextBlock;

    /**
     * Creates a plane mesh with text on it.
     * @param name - The name of the plane mesh.
     * @param width - The width of the plane mesh.
     * @param height - The height of the plane mesh.
     * @param x - The x coordinate of the plane mesh position.
     * @param y - The y coordinate of the plane mesh position.
     * @param z - The z coordinate of the plane mesh position.
     * @param text - The text to display on the plane mesh.
     * @param backgroundColor - The background color of the text.
     * @param textColor - The color of the text.
     * @param fontSize - The font size of the text.
     * @param scene - The scene to add the mesh to.
     */
    constructor(
        name:   string, 
        width:  number, 
        height: number, 
        x:      number, 
        y:      number, 
        z:      number,
        text:   string,
        backgroundColor: string,
        textColor: string,
        fontSize: number,
        scene: Scene
        ){
        const textPlane = MeshBuilder.CreatePlane(name + "text plane", {
            width: width,
            height: height,
        });
        textPlane.position.set(x,y,z);
        const planeTexture = AdvancedDynamicTexture.CreateForMesh(
            textPlane,
            width * 100,
            height * 100,
            false
        );
        planeTexture.background = backgroundColor;
        const planeText = new TextBlock(name + "plane text");
        planeText.text = text;
        planeText.color = textColor;
        planeText.fontSize = fontSize;
        planeTexture.addControl(planeText);

        this.mesh = textPlane;
        this.textBlock = planeText;
    }
}