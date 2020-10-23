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
import { GameLayer } from '../terrain/GameLayer';
import { ForceVector } from '../game/ForceVector';

//------------------------------------------------------------------------------------------
export class TerrainEditor extends XState {
    public m_currentBrush:TerrainTileBrush;
    public m_terrainContainer:TerrainContainer;
    public m_terrainTilePalette64:TerrainTilePalette;
    public m_terrainTilePalette32:TerrainTilePalette;
    public m_terrainTilePalette16:TerrainTilePalette;
    public m_terrainTilePaletteMisc:TerrainTilePalette;
    public m_forceVector:ForceVector;
    public m_golfBall:GolfBall;

    public m_ctrlKeyDown:boolean;
    public m_mouseDownFlag:boolean;
    public m_mouseDownPos:PIXI.Point;
    public m_layerPos:PIXI.Point;

    // html forms
    public m_worldForm:any;
    public m_nameForm:any;
    public m_bgLayerButton:any;
    public m_fgLayerButton:any;
    public m_terrainLayerButton:any;
    public m_platformLayerButton:any;
    public m_newButton:any;
    public m_loadButton:any;
    public m_saveButton:any;

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

        this.m_layerPos = new PIXI.Point ();

        this.createForms ();
        
        this.newTerrainContainer ("Earth");

        this.createInputHandlers ();

        console.log (": getParentObject: ", this.m_terrainContainer.getParentObject ());

        return this;
    }

//------------------------------------------------------------------------------------------
    public createForms ():void {
        this.m_worldForm = document.createElement ("input");
        this.m_worldForm.id = "__world";
        this.m_worldForm.value = "Earth";

        this.m_nameForm = document.createElement ("input");
        this.m_nameForm.id = "__world";
        this.m_nameForm.value = "";

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

        this.appendLabel ("name: ");
        this.m_XApp.container.appendChild (this.m_nameForm);

        this.appendNewButton ();
        this.appendLoadButton ();
        this.appendSaveButton ();

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
    public appendNewButton ():void {
        this.m_newButton = document.createElement ("button");
        this.m_newButton.id = "__new";
        this.m_newButton.appendChild (document.createTextNode ("new"));
        this.m_XApp.container.appendChild (this.m_newButton);
        this.m_newButton.addEventListener ("click", ()=> {
            console.log (": new: ");

            this.m_terrainContainer.nukeLater ();
            this.removePalettes ();

            this.newTerrainContainer (this.m_worldForm.value);
        });
    }

//------------------------------------------------------------------------------------------
    public appendLoadButton ():void {
        this.m_loadButton = document.createElement ("button");
        this.m_loadButton.id = "__load";
        this.m_loadButton.appendChild (document.createTextNode ("load"));
        this.m_XApp.container.appendChild (this.m_loadButton);
        this.m_loadButton.addEventListener ("click", ()=> {
            console.log (": load: ");	

            (document.querySelector('.inputFile') as any).click();	
            var input:any = document.querySelector('.inputFile');
            input.onchange = () => {
                console.log(": changed: ", this, input.files[0]);
                this.readSingleFile(input);
            };
        });
    }

//------------------------------------------------------------------------------------------
    public appendSaveButton ():void {
        this.m_saveButton = document.createElement ("button");
        this.m_saveButton.id = "__save";
        this.m_saveButton.appendChild (document.createTextNode ("save"));
        this.m_XApp.container.appendChild (this.m_saveButton);
        this.m_saveButton.addEventListener ("click", ()=> {
            console.log (": save: ");

            if (this.m_nameForm.value == "") {
                window.alert ("Please specify a name");
            } else {
                this.m_terrainContainer.setLevelName (this.m_nameForm.value);

                var __xml:XSimpleXMLNode = this.m_terrainContainer.serialize ();

                console.log (": xml: ", __xml.toXMLString ());

                var save:any = document.querySelector('.btnSave');
                console.log(": ", save.download);
                var data = 'data:application/text;charset=utf-8,' + encodeURIComponent(__xml.toXMLString ());
                save.href = data;
                save.download = this.m_nameForm.value + ".xml";
                (document.querySelector('.btnSave') as any).click();
            }
        });
    }

//------------------------------------------------------------------------------------------
    public setWorldName (__value:string):void {
        this.m_worldForm.value = __value;
    }

//------------------------------------------------------------------------------------------
    public getWorldName ():string {
        return this.m_worldForm.value;
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
    public isEditingBackground ():boolean {
        return (document.getElementById ("__bg") as any).checked;
    }

//------------------------------------------------------------------------------------------
    public isEditingForeground ():boolean {
        return (document.getElementById ("__fg") as any).checked;
    }

//------------------------------------------------------------------------------------------
    public isEditingPlatform ():boolean {
        return (document.getElementById ("__platform") as any).checked;
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

                case "KeyQ":
                    if (this.isEditingTerrain ()) {
                        var __x:number = this.m_XApp.getMousePos ().x;
                        var __y:number = this.m_XApp.getMousePos ().y;
            
                        var __octopusBug:OctopusBug = this.m_terrainContainer.addGameObjectAsChild (OctopusBug, 0, 0.0, false) as OctopusBug;
                        __octopusBug.afterSetup ().attachMatterBodyCircle (Matter.Bodies.circle (__x, __y, 8, {restitution: 0.80}), 8);
                    }
                    
                    break;

                case "KeyW":
                    if (this.isEditingTerrain ()) {
                        var __x:number = this.m_XApp.getMousePos ().x;
                        var __y:number = this.m_XApp.getMousePos ().y;
            
                        var __golfBall:GolfBall = this.m_golfBall = this.m_terrainContainer.addGameObjectAsChild (GolfBall, 0, 0.0, false) as GolfBall;
                        __golfBall.afterSetup ([this.m_terrainContainer, false])
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
            this.m_mouseDownFlag = true;

            this.m_mouseDownPos = e.data.getLocalPosition (this.m_XApp.getStage ()).clone ();

            if (this.isEditingBackground () && this.m_terrainContainer.getBGLayer () != null) {
                this.m_layerPos.x = this.m_terrainContainer.getBGLayer ().x;
                this.m_layerPos.y = this.m_terrainContainer.getBGLayer ().y;
            }

            if (this.isEditingForeground () && this.m_terrainContainer.getFGLayer () != null) {
                this.m_layerPos.x = this.m_terrainContainer.getFGLayer ().x;
                this.m_layerPos.y = this.m_terrainContainer.getFGLayer ().y;
            }

            if (this.isEditingPlatform () && this.m_terrainContainer.getPlatformLayer () != null) {
                this.m_layerPos.x = this.m_terrainContainer.getPlatformLayer ().x;
                this.m_layerPos.y = this.m_terrainContainer.getPlatformLayer ().y;
            }

            if (this.isEditingTerrain ()) {
                this.editTerrain (e);
            }
        });

        this.m_XApp.getStage ().on ("mousemove", (e:PIXI.InteractionEvent) => {
            if (this.m_mouseDownFlag) {
                if (this.isEditingBackground ()) {
                    this.moveBackground (e);
                }

                if (this.isEditingForeground ()) {
                    this.moveForeground (e);
                }

                if (this.isEditingPlatform ()) {
                    this.movePlatform (e);
                }

                if (this.isEditingTerrain ()) {
                    // this.moveTerrain (e);
                }
            }
        });

        this.m_XApp.getStage ().on ("mouseup", (e:PIXI.InteractionEvent) => {
            this.m_mouseDownFlag = false;
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
            this.removePalettes ();

            var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
            __xml.setupWithXMLString (contents);
        
            console.log (": xml: ", __xml.toXMLString ());

            this.createTerrainContainer ().deserialize (__xml);

            this.m_worldForm.value = this.m_terrainContainer.getWorldName ();
            this.m_nameForm.value = this.m_terrainContainer.getLevelName ();

            this.createPalettes ();
        };
        
        reader.readAsText(file);
    }

//------------------------------------------------------------------------------------------
    public moveBackground (e:PIXI.InteractionEvent):void {
        var __mousePos:PIXI.Point = e.data.getLocalPosition (this.m_XApp.getStage ());

        var __dx:number = (__mousePos.x - this.m_mouseDownPos.x);
        var __dy:number = (__mousePos.y - this.m_mouseDownPos.y);

        if (this.m_terrainContainer.getBGLayer () != null) {
            this.m_terrainContainer.getBGLayer ().x = this.m_layerPos.x + __dx;
            this.m_terrainContainer.getBGLayer ().y = this.m_layerPos.y + __dy;
        }
    }

//------------------------------------------------------------------------------------------
    public moveTerrain (e:PIXI.InteractionEvent):void {
        var __mousePos:PIXI.Point = e.data.getLocalPosition (this.m_XApp.getStage ());

        var __dx:number = (__mousePos.x - this.m_mouseDownPos.x);
        var __dy:number = (__mousePos.y - this.m_mouseDownPos.y);

        if (this.m_terrainContainer != null) {
            this.m_terrainContainer.x = this.m_layerPos.x + __dx;
            this.m_terrainContainer.y = this.m_layerPos.y + __dy;
        }
    }

//------------------------------------------------------------------------------------------
    public moveForeground (e:PIXI.InteractionEvent):void {
        var __mousePos:PIXI.Point = e.data.getLocalPosition (this.m_XApp.getStage ());
    }

//------------------------------------------------------------------------------------------
    public movePlatform (e:PIXI.InteractionEvent):void {
        var __mousePos:PIXI.Point = e.data.getLocalPosition (this.m_XApp.getStage ());

        var __dx:number = (__mousePos.x - this.m_mouseDownPos.x);
        var __dy:number = (__mousePos.y - this.m_mouseDownPos.y);

        if (this.m_terrainContainer.getPlatformLayer () != null) {
            this.m_terrainContainer.getPlatformLayer ().x = this.m_layerPos.x + __dx;
            this.m_terrainContainer.getPlatformLayer ().y = this.m_layerPos.y + __dy;
        }
    }

//------------------------------------------------------------------------------------------
    public editTerrain (e:PIXI.InteractionEvent):void {
        if (this.m_currentBrush == null) {
            var __x:number = e.data.getLocalPosition (this.m_XApp.getStage ()).x;
            var __y:number = e.data.getLocalPosition (this.m_XApp.getStage ()).y;

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

                this.m_mouseDownFlag = false;
            } else {
                this.m_mouseDownFlag = true;

                var __interactionData:PIXI.InteractionData = e.data;

                this.m_forceVector = this.m_terrainContainer.addGameObjectAsChild (ForceVector, 0, 0.0, true) as ForceVector;
                this.m_forceVector.afterSetup ([this.m_terrainContainer]);

                this.m_forceVector.x = __interactionData.getLocalPosition (this.m_XApp.getStage ()).x;
                this.m_forceVector.y = __interactionData.getLocalPosition (this.m_XApp.getStage ()).y;

                this.m_forceVector.addFiredListener ((__dx:number, __dy:number) => {
                    console.log (": fired: ", __dx, __dy);
                    
                    if (this.m_golfBall != null) {
                        this.m_golfBall.shootBall (__dx, __dy);
                    }
                });
            }
        }
    }

//------------------------------------------------------------------------------------------
    public newTerrainContainer (__worldName:string):void {
        var __xmlString:string = '<terrain world="' + __worldName + '" name="">'+
            '<background x="0" y="0"/>' +
            '<foreground x="0" y="0"/>' +
            '<platform x="0" y="0"/>' +
            '<tiles/>'+
        '</terrain>';

        var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
        __xml.setupWithXMLString (__xmlString);
        
        this.createTerrainContainer ().deserialize (__xml);

        this.setWorldName (this.m_terrainContainer.getWorldName ());
        
		this.createPalettes ();
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

		var __terrainTilePalette64:TerrainTilePalette = this.m_terrainTilePalette64 = this.addGameObjectAsChild (TerrainTilePalette, 0, 1000.0) as TerrainTilePalette;
		__terrainTilePalette64.afterSetup (["Terrain", 128, this.getWorldName (), TerrainTileIcon.MAX_ICONS, -32, 0.66]);
		__terrainTilePalette64.x = 16;
		__terrainTilePalette64.y = __y;
        __terrainTilePalette64.addSelectedListener (this.createTerrainTileBrushFromIcon.bind (this));
        __y += 128 + 16;

		var __terrainTilePalette32:TerrainTilePalette = this.m_terrainTilePalette32 = this.addGameObjectAsChild (TerrainTilePalette, 0, 1000.0) as TerrainTilePalette;
		__terrainTilePalette32.afterSetup (["Terrain", 64, this.getWorldName (), TerrainTileIcon.MAX_ICONS, 16, 1.0]);
		__terrainTilePalette32.x = 16;
		__terrainTilePalette32.y = __y;
        __terrainTilePalette32.addSelectedListener (this.createTerrainTileBrushFromIcon.bind (this));
        __y += 64 + 16;
        
		var __terrainTilePalette16:TerrainTilePalette = this.m_terrainTilePalette16 = this.addGameObjectAsChild (TerrainTilePalette, 0, 1000.0) as TerrainTilePalette;
		__terrainTilePalette16.afterSetup (["Terrain", 32, this.getWorldName (), TerrainTileIcon.MAX_ICONS, 16, 1.0]);
		__terrainTilePalette16.x = 16;
        __terrainTilePalette16.y = __y;
        __terrainTilePalette16.addSelectedListener (this.createTerrainTileBrushFromIcon.bind (this));
        __y += 32 + 16;

		var __terrainTileMisc:TerrainTilePalette = this.m_terrainTilePaletteMisc = this.addGameObjectAsChild (TerrainTilePalette, 0, 1000.0) as TerrainTilePalette;
		__terrainTileMisc.afterSetup (["TerrainMisc", 32, this.getWorldName (), 16, 16, 1.0]);
		__terrainTileMisc.x = 16;
        __terrainTileMisc.y = __y;
        __terrainTileMisc.addSelectedListener (this.createTerrainTileBrushFromIcon.bind (this));
	}

//------------------------------------------------------------------------------------------
    public removePalettes ():void {
        this.m_terrainTilePalette64.nukeLater ();
        this.m_terrainTilePalette32.nukeLater ();
        this.m_terrainTilePalette16.nukeLater ();
        this.m_terrainTilePaletteMisc.nukeLater ();
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