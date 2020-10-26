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
import { GameLayersContainer } from '../terrain/GameLayersContainer';
import { HoleArrow } from '../game/HoleArrow';
import { HoleHighlight } from '../game/HoleHighlight';

//------------------------------------------------------------------------------------------
export class TerrainEditor extends XState {
    public m_currentBrush:TerrainTileBrush;
    public m_terrainContainer:TerrainContainer;
    public m_gameLayersContainer:GameLayersContainer;
    public m_terrainTilePalette64:TerrainTilePalette;
    public m_terrainTilePalette32:TerrainTilePalette;
    public m_terrainTilePalette16:TerrainTilePalette;
    public m_terrainTilePaletteMisc:TerrainTilePalette;
    public m_forceVector:ForceVector;

    public m_ctrlKeyDown:boolean;
    public m_mouseDownFlag:boolean;
    public m_mouseDownPos:PIXI.Point;
    public m_layerPos:PIXI.Point;

    // html forms
    public m_worldForm:any;
    public m_reloadWorldButton:any;

    public m_terrainNameForm:any;
    public m_newTerrainButton:any;
    public m_loadTerrainButton:any;
    public m_saveTerrainButton:any;

    public m_layersNameForm:any;
    public m_newLayersButton:any;
    public m_loadLayersButton:any;
    public m_saveLayersButton:any;

    public m_bgLayerButton:any;
    public m_fgLayerButton:any;
    public m_terrainLayerButton:any;
    public m_platformLayerButton:any;

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
        
        this.newTerrainContainer (this.m_worldForm.value);
        this.newGameLayersContainer (this.m_worldForm.value);
        this.createPalettes ();

        this.createInputHandlers ();

        console.log (": getParentObject: ", this.m_terrainContainer.getParentObject ());

        return this;
    }

//------------------------------------------------------------------------------------------
    public createForms ():void {
        this.m_worldForm = document.createElement ("input");
        this.m_worldForm.id = "__world";
        this.m_worldForm.value = "Earth";
        this.m_terrainNameForm = document.createElement ("input");
        this.m_terrainNameForm.id = "__terain";
        this.m_terrainNameForm.value = "";

        this.m_layersNameForm = document.createElement ("input");
        this.m_layersNameForm.id = "__layers";
        this.m_layersNameForm.value = "";

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

        this.m_XApp.container.appendChild (this.m_bgLayerButton);
        this.appendLabel ("bg");

        this.m_XApp.container.appendChild (this.m_fgLayerButton);
        this.appendLabel ("fg");

        this.m_XApp.container.appendChild (this.m_terrainLayerButton);
        this.appendLabel ("terrain");

        this.m_XApp.container.appendChild (this.m_platformLayerButton);
        this.appendLabel ("platform");

        this.appendLineBreak ();

        this.appendLabel ("world: ");
        this.m_XApp.container.appendChild (this.m_worldForm);

        this.appendReloadWorldButton ();

        this.appendLineBreak ();
        
        this.appendLabel ("terrain name: ");
        this.m_XApp.container.appendChild (this.m_terrainNameForm);

        this.appendNewTerrainButton ();
        this.appendLoadTerrainButton ();
        this.appendSaveTerrainButton ();

        this.appendLineBreak ();

        this.appendLabel ("layers name: ");
        this.m_XApp.container.appendChild (this.m_layersNameForm);

        this.appendNewLayersButton ();
        this.appendLoadLayersButton ();
        this.appendSaveLayersButton ();
    }

//------------------------------------------------------------------------------------------
    public appendReloadWorldButton ():void {
        this.m_reloadWorldButton = document.createElement ("button");
        this.m_reloadWorldButton.id = "__reload";
        this.m_reloadWorldButton.appendChild (document.createTextNode ("reload"));
        this.m_XApp.container.appendChild (this.m_reloadWorldButton);
        this.m_reloadWorldButton.addEventListener ("click", ()=> {
            console.log (": reload: ");

            this.removePalettes ();
            this.m_gameLayersContainer.changeWorldName (this.m_worldForm.value, this.m_terrainContainer);
            this.m_terrainContainer.changeWorldName (this.m_worldForm.value);
            this.createPalettes ();
        });
    }

//------------------------------------------------------------------------------------------
    public appendNewTerrainButton ():void {
        this.m_newTerrainButton = document.createElement ("button");
        this.m_newTerrainButton.id = "__new";
        this.m_newTerrainButton.appendChild (document.createTextNode ("new terrain"));
        this.m_XApp.container.appendChild (this.m_newTerrainButton);
        this.m_newTerrainButton.addEventListener ("click", ()=> {
            console.log (": new: ");

            this.m_terrainContainer.nukeLater ();
            this.removePalettes ();

            this.newTerrainContainer (this.m_worldForm.value);

            this.createPalettes ();
        });
    }

//------------------------------------------------------------------------------------------
    public appendLoadTerrainButton ():void {
        this.m_loadTerrainButton = document.createElement ("button");
        this.m_loadTerrainButton.id = "__load";
        this.m_loadTerrainButton.appendChild (document.createTextNode ("load terrain"));
        this.m_XApp.container.appendChild (this.m_loadTerrainButton);
        this.m_loadTerrainButton.addEventListener ("click", ()=> {
            console.log (": load: ");	

            (document.querySelector('.inputFile') as any).click();	
            var input:any = document.querySelector('.inputFile');
            input.onchange = () => {
                console.log(": changed: ", this, input.files[0]);
                this.readTerrainFile(input);
            };
        });
    }

//------------------------------------------------------------------------------------------
    public appendSaveTerrainButton ():void {
        this.m_saveTerrainButton = document.createElement ("button");
        this.m_saveTerrainButton.id = "__save";
        this.m_saveTerrainButton.appendChild (document.createTextNode ("save terain"));
        this.m_XApp.container.appendChild (this.m_saveTerrainButton);
        this.m_saveTerrainButton.addEventListener ("click", ()=> {
            console.log (": save: ");

            if (this.m_terrainNameForm.value == "") {
                window.alert ("Please specify a name for the terrain");
            } else {
                this.m_terrainContainer.setLevelName (this.m_terrainNameForm.value);

                var __xml:XSimpleXMLNode = this.m_terrainContainer.serialize ();

                console.log (": xml: ", __xml.toXMLString ());

                var save:any = document.querySelector('.btnSave');
                console.log(": ", save.download);
                var data = 'data:application/text;charset=utf-8,' + encodeURIComponent(__xml.toXMLString ());
                save.href = data;
                save.download = "terrain_" + this.m_terrainNameForm.value + ".xml";
                (document.querySelector('.btnSave') as any).click();
            }
        });
    }

//------------------------------------------------------------------------------------------
    public appendNewLayersButton ():void {
        this.m_newLayersButton = document.createElement ("button");
        this.m_newLayersButton.id = "__new";
        this.m_newLayersButton.appendChild (document.createTextNode ("new layers"));
        this.m_XApp.container.appendChild (this.m_newLayersButton);
        this.m_newLayersButton.addEventListener ("click", ()=> {
            console.log (": new: ");

            this.m_gameLayersContainer.nukeLater ();
            this.removePalettes ();

            this.newGameLayersContainer (this.m_worldForm.value);
            this.m_terrainContainer.changeWorldName (this.m_worldForm.value);

            this.createPalettes ();
        });
    }

//------------------------------------------------------------------------------------------
    public appendLoadLayersButton ():void {
        this.m_loadLayersButton = document.createElement ("button");
        this.m_loadLayersButton.id = "__load";
        this.m_loadLayersButton.appendChild (document.createTextNode ("load layers"));
        this.m_XApp.container.appendChild (this.m_loadLayersButton);
        this.m_loadLayersButton.addEventListener ("click", ()=> {
            console.log (": load: ");	

             // TODO reload terrain container with new world (while keeping contents)
            (document.querySelector('.inputFile') as any).click();	
            var input:any = document.querySelector('.inputFile');
            input.onchange = () => {
                console.log(": changed: ", this, input.files[0]);
                this.readLayersFile(input);
            };
        });
    }

//------------------------------------------------------------------------------------------
    public appendSaveLayersButton ():void {
        this.m_saveLayersButton = document.createElement ("button");
        this.m_saveLayersButton.id = "__save";
        this.m_saveLayersButton.appendChild (document.createTextNode ("save layers"));
        this.m_XApp.container.appendChild (this.m_saveLayersButton);
        this.m_saveLayersButton.addEventListener ("click", ()=> {
            console.log (": save: ");

            if (this.m_layersNameForm.value == "") {
                window.alert ("Please specify a name for the layers");
            } else {
                this.m_gameLayersContainer.setLevelName (this.m_layersNameForm.value);

                var __xml:XSimpleXMLNode = this.m_gameLayersContainer.serialize (this.m_terrainContainer);

                console.log (": xml: ", __xml.toXMLString ());

                var save:any = document.querySelector('.btnSave');
                console.log(": ", save.download);
                var data = 'data:application/text;charset=utf-8,' + encodeURIComponent(__xml.toXMLString ());
                save.href = data;
                save.download = "layers_" + this.m_layersNameForm.value + ".xml";
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
            // console.log (": keyDown: ", key.code);

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

                case "KeyA":
                    var __point:XPoint = this.m_XApp.getMousePos ().cloneX ();
                    this.m_terrainContainer.globalToLocal (this.m_terrainContainer, __point);

                    this.m_terrainContainer.createHoleArrow (__point.x, __point.y);

                    break;

                case "KeyH":
                    var __point:XPoint = this.m_XApp.getMousePos ().cloneX ();
                    this.m_terrainContainer.globalToLocal (this.m_terrainContainer, __point);
    
                    this.m_terrainContainer.createHoleHighlight (__point.x, __point.y);
    
                    break;

                case "KeyX":
                    var __point:XPoint = this.m_XApp.getMousePos ().cloneX ();
                    this.m_terrainContainer.globalToLocal (this.m_terrainContainer, __point);
    
                    this.m_terrainContainer.createHoleMarker (__point.x, __point.y);
    
                    break;

                case "KeyQ":
                    if (this.isEditingTerrain ()) {
                        // var __x:number = this.m_XApp.getMousePos ().x;
                        // var __y:number = this.m_XApp.getMousePos ().y;
            
                        var __point:XPoint = this.m_XApp.getMousePos ().cloneX ();
                        this.m_terrainContainer.globalToLocal (this.m_terrainContainer, __point);

                        var __x:number = __point.x;
                        var __y:number = __point.y;

                        var __octopusBug:OctopusBug = this.m_terrainContainer.addGameObjectAsChild (OctopusBug, 0, 0.0, false) as OctopusBug;
                        __octopusBug.afterSetup ().attachMatterBodyCircle (Matter.Bodies.circle (__x, __y, 8, {restitution: 0.80}), 8);
                    }
                    
                    break;

                case "KeyW":
                    if (this.isEditingTerrain ()) {
                        // var __x:number = this.m_XApp.getMousePos ().x;
                        // var __y:number = this.m_XApp.getMousePos ().y;
    
                        var __point:XPoint = this.m_XApp.getMousePos ().cloneX ();
                        this.m_terrainContainer.globalToLocal (this.m_terrainContainer, __point);

                        var __x:number = __point.x;
                        var __y:number = __point.y;

                        this.m_terrainContainer.createGolfBall (__x, __y);
                    }

                    break;
            }
        });

        document.addEventListener ('keyup', (key:KeyboardEvent) => {
            // console.log (": keyUp: ", key.code);

            switch (key.code) {
                case "ControlLeft":
                    this.m_ctrlKeyDown = false;

                    break;
            }
        });

        this.m_XApp.getStage ().on ("mousedown", (e:PIXI.InteractionEvent) => {
            this.m_mouseDownFlag = true;

            this.m_mouseDownPos = e.data.getLocalPosition (this.m_XApp.getStage ()).clone ();

                if (this.isEditingBackground () && this.m_gameLayersContainer.getBGLayer () != null) {
                    this.m_layerPos.x = this.m_gameLayersContainer.getBGLayer ().x;
                    this.m_layerPos.y = this.m_gameLayersContainer.getBGLayer ().y;
                }

                if (this.isEditingForeground () && this.m_gameLayersContainer.getFGLayer () != null) {
                    this.m_layerPos.x = this.m_gameLayersContainer.getFGLayer ().x;
                    this.m_layerPos.y = this.m_gameLayersContainer.getFGLayer ().y;
                }

                if (this.isEditingPlatform () && this.m_gameLayersContainer.getPlatformLayer () != null) {
                    this.m_layerPos.x = this.m_gameLayersContainer.getPlatformLayer ().x;
                    this.m_layerPos.y = this.m_gameLayersContainer.getPlatformLayer ().y;
                }

                if (this.isEditingTerrain ()) {
                    console.log (": mousedown: ", this.m_terrainContainer.x, this.m_terrainContainer.y);

                    if (this.m_ctrlKeyDown) {
                        this.m_layerPos.x = this.m_terrainContainer.x;
                        this.m_layerPos.y = this.m_terrainContainer.y;  
                    } else {
                        this.editTerrain (e);
                    }
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
                    if (this.m_ctrlKeyDown) {
                        this.moveTerrain (e);
                    }
                }
            }
        });

        this.m_XApp.getStage ().on ("mouseup", (e:PIXI.InteractionEvent) => {
            this.m_mouseDownFlag = false;

            console.log (": mouseup: ", this.m_terrainContainer.x, this.m_terrainContainer.y);
        });
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public readTerrainFile (input:any) {
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

            this.m_terrainNameForm.value = this.m_terrainContainer.getLevelName ();

            this.createPalettes ();
        };
        
        reader.readAsText(file);
    }

//------------------------------------------------------------------------------------------
    public readLayersFile (input:any) {
        var file = input.files[0];
        
        if (!file) {
            return;
        }
        
        var reader = new FileReader();
        
        reader.onload = (e) => {
            var contents:string = e.target.result as string;

            console.log(": contents: ", contents);

            this.m_gameLayersContainer.nukeLater ();
            this.removePalettes ();

            var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
            __xml.setupWithXMLString (contents);
        
            console.log (": xml: ", __xml.toXMLString ());

            this.createGameLayersContainer ().deserialize (__xml, this.m_terrainContainer);

            this.m_worldForm.value = this.m_gameLayersContainer.getWorldName ();
            this.m_layersNameForm.value = this.m_gameLayersContainer.getLevelName ();
            this.m_terrainContainer.changeWorldName (this.m_worldForm.value);
            
            this.createPalettes ();
        };
        
        reader.readAsText(file);
    }

//------------------------------------------------------------------------------------------
    public moveBackground (e:PIXI.InteractionEvent):void {
        var __mousePos:PIXI.Point = e.data.getLocalPosition (this.m_XApp.getStage ());

        var __dx:number = (__mousePos.x - this.m_mouseDownPos.x);
        var __dy:number = (__mousePos.y - this.m_mouseDownPos.y);

        if (this.m_gameLayersContainer.getBGLayer () != null) {
            this.m_gameLayersContainer.getBGLayer ().x = this.m_layerPos.x + __dx;
            this.m_gameLayersContainer.getBGLayer ().y = this.m_layerPos.y + __dy;
        }
    }

//------------------------------------------------------------------------------------------
    public moveTerrain (e:PIXI.InteractionEvent):void {
        var __mousePos:PIXI.Point = e.data.getLocalPosition (this.m_XApp.getStage ());

        var __dx:number = (__mousePos.x - this.m_mouseDownPos.x);
        var __dy:number = (__mousePos.y - this.m_mouseDownPos.y);

        // console.log (": moveTerrain: ", this.m_layerPos.x, this.m_layerPos.y);

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

        if (this.m_gameLayersContainer.getPlatformLayer () != null) {
            this.m_gameLayersContainer.getPlatformLayer ().x = this.m_layerPos.x + __dx;
            this.m_gameLayersContainer.getPlatformLayer ().y = this.m_layerPos.y + __dy;
        }
    }

//------------------------------------------------------------------------------------------
    public editTerrain (e:PIXI.InteractionEvent):void {
        if (this.m_currentBrush == null) {
            // var __x:number = e.data.getLocalPosition (this.m_XApp.getStage ()).x;
            // var __y:number = e.data.getLocalPosition (this.m_XApp.getStage ()).y;

            var __x:number = e.data.getLocalPosition (this.m_terrainContainer).x;
            var __y:number = e.data.getLocalPosition (this.m_terrainContainer).y;

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

                // this.m_forceVector.x = __interactionData.getLocalPosition (this.m_XApp.getStage ()).x;
                // this.m_forceVector.y = __interactionData.getLocalPosition (this.m_XApp.getStage ()).y;

                this.m_forceVector.x = __interactionData.getLocalPosition (this.m_terrainContainer).x;
                this.m_forceVector.y = __interactionData.getLocalPosition (this.m_terrainContainer).y;

                this.m_forceVector.addFiredListener ((__dx:number, __dy:number) => {
                    console.log (": fired: ", __dx, __dy);
                    
                    if (this.m_terrainContainer.getGolfBall () != null) {
                        this.m_terrainContainer.getGolfBall ().shootBall (__dx, __dy);
                    }
                });
            }
        }
    }

//------------------------------------------------------------------------------------------
    public newTerrainContainer (__worldName:string):void {
        var __xmlString:string = '<terrain name="">'+
            '<ball x="128" y="512"/>'+
            '<arrow x="256" y="512"/>'+
            '<marker x="320" y="512"/>'+
            '<highlight x="400" y="640"/>'+
            '<tiles/>'+
        '</terrain>';

        var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
        __xml.setupWithXMLString (__xmlString);
        
        this.createTerrainContainer ().deserialize (__xml);
    }

//------------------------------------------------------------------------------------------
    public newGameLayersContainer (__worldName:string):void {
        var __xmlString:string = '<layers world="' + __worldName + '">'+
            '<background x="0" y="0"/>' +
            '<foreground x="0" y="0"/>' +
            '<platform x="0" y="0"/>' +
            '<terrain x="0" y="0"/>' +
        '</layers>';

        var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
        __xml.setupWithXMLString (__xmlString);
            
        this.createGameLayersContainer ().deserialize (__xml, this.m_terrainContainer);
    }

//------------------------------------------------------------------------------------------
    public createTerrainContainer ():TerrainContainer {
        this.m_terrainContainer = this.addGameObjectAsChild (TerrainContainer, 0, 500.0) as TerrainContainer;
        this.m_terrainContainer.afterSetup ([this.m_worldForm.value]);
        this.m_terrainContainer.x = 0;
        this.m_terrainContainer.y = 0;

        return this.m_terrainContainer;
    }

//------------------------------------------------------------------------------------------
    public createGameLayersContainer ():GameLayersContainer {
        this.m_gameLayersContainer = this.addGameObjectAsChild (GameLayersContainer, 0, 500.0) as GameLayersContainer;
        this.m_gameLayersContainer.afterSetup ();
        this.m_gameLayersContainer.x = 0;
        this.m_gameLayersContainer.y = 0;

        return this.m_gameLayersContainer;
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
            var __brush:TerrainTileBrush = this.m_currentBrush = this.m_terrainContainer.addGameObjectAsChild (TerrainTileBrush, 0, 0.0) as TerrainTileBrush;
            __brush.afterSetup ([this.m_terrainContainer, __name, __size, __terrain, __frame]);

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