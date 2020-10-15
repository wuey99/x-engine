//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XDepthSprite} from '../sprite/XDepthSprite';
import { XType } from '../type/Xtype';
import { XGameObject} from '../gameobject/XGameObject';
import { XState } from '../state/XState';
import { TerrainTilePalette } from './TerrainTilePalette';
import { TerrainTileIcon } from './TerrainTileIcon';
import { TerrainTileBrush } from './TerrainTileBrush';
import { G } from '../app/G';
import { XPoint } from '../geom/XPoint';
import { XRect } from '../geom/XRect';
import { TerrainTile } from '../terrain/TerrainTile'
import { TerrainContainer } from '../terrain/TerrainContainer';
import { XSimpleXMLDocument } from '../xml/XSimpleXMLDocument';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { GolfBall } from '../game/GolfBall';
import { OctopusBug } from '../game/OctopusBug';
import * as Matter from 'matter-js';
import { World, Body, Engine } from 'matter-js';
import { GameLayer } from '../game/GameLayer';

//------------------------------------------------------------------------------------------
export class TerrainEditor extends XState {
    public m_currentBrush:TerrainTileBrush;
    public m_terrainContainer:TerrainContainer;
    public m_bgLayer:GameLayer;
    public m_fgLayer:GameLayer;
    public m_platformLayer:GameLayer;
    public m_ctrlKeyDown:boolean;

    public m_worldForm:any;
    public m_bgLayerButton:any;
    public m_fgLayerButton:any;
    public m_terrainLayerButton:any;
    public m_platformLayerButton:any;
    public m_reloadButton:any;

//------------------------------------------------------------------------------------------	
	constructor () {
		super ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);

        this.m_currentBrush = null;

        this.createForms ();

		this.createPalettes ();
        
        this.createLayers ();

        this.createTerrainContainer ();

        this.createInputHandlers ();

        return this;
    }

//------------------------------------------------------------------------------------------
    public createForms ():void {
        this.m_worldForm = document.createElement ("input");
        this.m_worldForm.id = "__world";
        this.m_worldForm.value = "Earth";

        this.m_bgLayerButton = document.createElement ("input");
        this.m_bgLayerButton.id = "__bg";
        this.m_bgLayerButton.type = "radio";
        this.m_bgLayerButton.name = "layer";

        this.m_fgLayerButton = document.createElement ("input");
        this.m_fgLayerButton.id = "__fg";
        this.m_fgLayerButton.type = "radio";
        this.m_fgLayerButton.name = "layer";

        this.m_terrainLayerButton = document.createElement ("input");
        this.m_terrainLayerButton.id = "__terrain";
        this.m_terrainLayerButton.type = "radio";
        this.m_terrainLayerButton.name = "layer";
        this.m_terrainLayerButton.checked = true;

        this.m_platformLayerButton = document.createElement ("input");
        this.m_platformLayerButton.id = "__platform";
        this.m_platformLayerButton.type = "radio";
        this.m_platformLayerButton.name = "layer";

        this.appendLineBreak ();

        this.appendLabel ("world: ");
        this.m_XApp.container.appendChild (this.m_worldForm);

        this.appendReloadButton ();

        this.m_XApp.container.appendChild (this.m_bgLayerButton);
        this.appendLabel ("bg");

        this.m_XApp.container.appendChild (this.m_fgLayerButton);
        this.appendLabel ("fg");

        this.m_XApp.container.appendChild (this.m_terrainLayerButton);
        this.appendLabel ("terrain");

        this.m_XApp.container.appendChild (this.m_platformLayerButton);
        this.appendLabel ("platform");
    }

//------------------------------------------------------------------------------------------
    public appendReloadButton ():void {
        this.m_reloadButton = document.createElement ("button");
        this.m_reloadButton.id = "__reload";
        this.m_reloadButton.appendChild (document.createTextNode ("reload"));
        this.m_XApp.container.appendChild (this.m_reloadButton);
        this.m_reloadButton.addEventListener ("click", ()=> {
            console.log (": reload: ");
        });
    }

//------------------------------------------------------------------------------------------
    public appendLineBreak ():void {
        this.m_XApp.container.appendChild (document.createElement ("br"));
    }

//------------------------------------------------------------------------------------------
    public appendLabel (__text:string):void {
        var __label = document.createElement ("label");
        __label.appendChild (document.createTextNode (__text));
        this.m_XApp.container.appendChild (__label);
    }

//------------------------------------------------------------------------------------------
    public isEditingTerrain ():boolean {
        return (document.getElementById ("__terrain") as any).checked;
    }

//------------------------------------------------------------------------------------------
    public createInputHandlers ():void {
        this.m_ctrlKeyDown = false;

        document.addEventListener ('keydown', (key:KeyboardEvent) => {
            console.log (": keyDown: ", key.code);

            switch (key.code) {
                case "ControlLeft":
                    this.m_ctrlKeyDown = true;

                    break;

                case "Space":
                    if (this.isEditingTerrain ()) {
                        if (this.m_currentBrush != null) {
                            this.m_currentBrush.nukeLater ();

                            this.m_currentBrush = null;
                        }
                    }

                    break;
                
                case "KeyS":
                    if (this.isEditingTerrain ()) {
                        var __xml:XSimpleXMLNode = this.m_terrainContainer.serialize ();

                        console.log (": xml: ", __xml.toXMLString ());
            
                        var save:any = document.querySelector('.btnSave');
                        console.log(": ", save.download);
                        var data = 'data:application/text;charset=utf-8,' + encodeURIComponent(__xml.toXMLString ());
                        save.href = data;
                        save.download = "level.xml";
                        (document.querySelector('.btnSave') as any).click();	
                        }

                    break;

                case "KeyL":
                    if (this.isEditingTerrain ()) {
                        (document.querySelector('.inputFile') as any).click();	
                        var input:any = document.querySelector('.inputFile');
                        input.onchange = () => {
                            console.log(": changed: ", this, input.files[0]);
                            this.readSingleFile(input);
                        };
                    }

                    break;

                case "KeyQ":
                    if (this.isEditingTerrain ()) {
                        var __x:number = this.m_XApp.getMousePos ().x;
                        var __y:number = this.m_XApp.getMousePos ().y;
            
                        var __octopusBug:OctopusBug = this.addGameObjectAsChild (OctopusBug, 0, 0.0, false) as OctopusBug;
                        __octopusBug.afterSetup ().attachMatterBodyCircle (Matter.Bodies.circle (__x, __y, 8, {restitution: 0.80}), 8);
                    }
                    
                    break;

                case "KeyW":
                    if (this.isEditingTerrain ()) {
                        var __x:number = this.m_XApp.getMousePos ().x;
                        var __y:number = this.m_XApp.getMousePos ().y;
            
                        var __golfBall:GolfBall = this.addGameObjectAsChild (GolfBall, 0, 0.0, false) as GolfBall;
                        __golfBall.afterSetup ([this.m_terrainContainer])
                            .attachMatterBodyCircle (Matter.Bodies.circle (__x, __y, 15, {restitution: 0.80}), 15)
                            .setMatterRotate (false);
                    }

                    break;
            }
        });

        document.addEventListener ('keyup', (key:KeyboardEvent) => {
            console.log (": keyUp: ", key.code);

            switch (key.code) {
                case "ControlLeft":
                    this.m_ctrlKeyDown = true;

                    break;
            }
        });

        this.m_XApp.getStage ().on ("mousedown", (e:PIXI.InteractionEvent) => {
            if (this.isEditingTerrain () && this.m_currentBrush == null) {
                var __x:number = e.data.global.x;
                var __y:number = e.data.global.y;

                var __terrainTile:TerrainTile = this.m_terrainContainer.pickupTerrainTile (__x, __y);
                console.log (": terrainTile: ", __terrainTile);

                if (__terrainTile != null) {
                    this.m_terrainContainer.removeTerrainTile (__terrainTile);

                    this.createTerrainTileBrush (
                        __terrainTile.getName (),
                        __terrainTile.getSize (),
                        __terrainTile.getWorld (),
                        __terrainTile.getFrame ()
                    );
                }
            }
        });
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public readSingleFile (input:any) {
        var file = input.files[0];
        
        if (!file) {
            return;
        }
        
        var reader = new FileReader();
        
        reader.onload = (e) => {
            var contents:string = e.target.result as string;

            console.log(": contents: ", contents);

            this.m_terrainContainer.nukeLater ();

            var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
            __xml.setupWithXMLString (contents);
        
            console.log (": xml: ", __xml.toXMLString ());

            this.createTerrainContainer ().deserialize (__xml);
        };
        
        reader.readAsText(file);
    }

//------------------------------------------------------------------------------------------
    public createLayers ():void {
        this.m_bgLayer = this.addGameObjectAsChild (GameLayer, 0, 0.0) as GameLayer;
        this.m_bgLayer.afterSetup (["Earth_Layers_Background"])

        this.m_platformLayer = this.addGameObjectAsChild (GameLayer, 0, 5.0) as GameLayer;
        this.m_platformLayer.afterSetup (["Earth_Layers_Platform"])
        this.m_platformLayer.y = 384;
    }

//------------------------------------------------------------------------------------------
    public createTerrainContainer ():TerrainContainer {
        this.m_terrainContainer = this.addGameObjectAsChild (TerrainContainer, 0, 500.0) as TerrainContainer;
        this.m_terrainContainer.afterSetup ();
        this.m_terrainContainer.x = 0;
        this.m_terrainContainer.y = 0;

        return this.m_terrainContainer;
    }

//------------------------------------------------------------------------------------------
	public createPalettes ():void {
		var __y:number = 16;

		var __terrainTilePalette64:TerrainTilePalette = this.addGameObjectAsChild (TerrainTilePalette, 0, 1000.0) as TerrainTilePalette;
		__terrainTilePalette64.afterSetup (["Terrain", 64, "Earth", TerrainTileIcon.MAX_ICONS]);
		__terrainTilePalette64.x = 16;
		__terrainTilePalette64.y = __y;
        __terrainTilePalette64.addSelectedListener (this.createTerrainTileBrushFromIcon.bind (this));
        __y += 64 + 8;

		var __terrainTilePalette32:TerrainTilePalette = this.addGameObjectAsChild (TerrainTilePalette, 0, 1000.0) as TerrainTilePalette;
		__terrainTilePalette32.afterSetup (["Terrain", 32, "Earth", TerrainTileIcon.MAX_ICONS]);
		__terrainTilePalette32.x = 16;
		__terrainTilePalette32.y = __y;
        __terrainTilePalette32.addSelectedListener (this.createTerrainTileBrushFromIcon.bind (this));
        __y += 32 + 8;
        
		var __terrainTilePalette16:TerrainTilePalette = this.addGameObjectAsChild (TerrainTilePalette, 0, 1000.0) as TerrainTilePalette;
		__terrainTilePalette16.afterSetup (["Terrain", 16, "Earth", TerrainTileIcon.MAX_ICONS]);
		__terrainTilePalette16.x = 16;
        __terrainTilePalette16.y = __y;
        __terrainTilePalette16.addSelectedListener (this.createTerrainTileBrushFromIcon.bind (this));
        __y += 16 + 8;

		var __terrainTileMisc:TerrainTilePalette = this.addGameObjectAsChild (TerrainTilePalette, 0, 1000.0) as TerrainTilePalette;
		__terrainTileMisc.afterSetup (["TerrainMisc", 16, "Earth", 16]);
		__terrainTileMisc.x = 16;
        __terrainTileMisc.y = __y;
        __terrainTileMisc.addSelectedListener (this.createTerrainTileBrushFromIcon.bind (this));
	}

//------------------------------------------------------------------------------------------
    public createTerrainTileBrushFromIcon (__terrainTileIcon:TerrainTileIcon):void {
        if (!this.isEditingTerrain ()) {
            return;
        }

        this.createTerrainTileBrush (
            __terrainTileIcon.getName (),
            __terrainTileIcon.getSize (),
            __terrainTileIcon.getWorld (),
            __terrainTileIcon.getFrame ()
        );
    }

//------------------------------------------------------------------------------------------
    public createTerrainTileBrush (__name:string, __size:number, __terrain:String, __frame:number):void {
        if (this.m_currentBrush == null) {
            var __brush:TerrainTileBrush = this.m_currentBrush = this.addGameObjectAsChild (TerrainTileBrush, 0, 0.0) as TerrainTileBrush;
            __brush.afterSetup ([__name, __size, __terrain, __frame]);

            this.m_currentBrush.addDroppedListener (() => {
                if (!this.isEditingTerrain ()) {
                    return;
                }

                console.log (": dropped: ");

                var __dx:number = 0; // this.m_currentBrush.getSize () / 2;
                var __dy:number = 0; // this.m_currentBrush.getSize () / 2;

                this.m_terrainContainer.addTerrainTile (
                    this.m_currentBrush.x + __dx, this.m_currentBrush.y + __dy,
                    this.m_currentBrush.getName (),
                    this.m_currentBrush.getSize (),
                    this.m_currentBrush.getWorld (),
                    this.m_currentBrush.getFrame ()
                )
            });

            this.m_currentBrush.addKillListener (() => {
                this.m_currentBrush = null;
            });
        }
    }

//------------------------------------------------------------------------------------------
}