//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSignal } from '../../engine/signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine/task/XTaskSubManager';
import { XWorld} from '../../engine/sprite/XWorld';
import { XType } from '../../engine/type/XType';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { TerrainTilePalette } from './TerrainTilePalette';
import { TerrainTileIcon } from './TerrainTileIcon';
import { TerrainTileBrush } from './TerrainTileBrush';
import { G } from '../../engine/app/G';
import { XPoint } from '../../engine/geom/XPoint';
import { XRect } from '../../engine/geom/XRect';
import { TerrainTile } from '../terrain/TerrainTile'
import { TerrainContainer } from '../terrain/TerrainContainer';
import { XSimpleXMLDocument } from '../../engine/xml/XSimpleXMLDocument';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { GolfBall } from '../game/GolfBall';
import { OctopusBug } from '../test/OctopusBug';
import * as Matter from 'matter-js';
import { World, Body, Engine } from 'matter-js';
import { GameLayer } from '../terrain/GameLayer';
import { ForceVectorToo } from '../game/ForceVectorToo';
import { GameLayersContainer } from '../terrain/GameLayersContainer';
import { HoleArrow } from '../game/HoleArrow';
import { HoleHighlight } from '../game/HoleHighlight';
import { GolfGame } from '../game/GolfGame';
import { SidePanelPlaceHolder } from './SidePanelPlaceHolder';

//------------------------------------------------------------------------------------------
export class TerrainEditor extends XState {
    public m_currentBrush:TerrainTileBrush;
    public m_terrainContainer:TerrainContainer;
    public m_gameLayersContainer:GameLayersContainer;
    public m_sidePanelPlaceHolder:SidePanelPlaceHolder;
    public m_terrainTilePalette64:TerrainTilePalette;
    public m_terrainTilePalette32:TerrainTilePalette;
    public m_terrainTilePalette16:TerrainTilePalette;
    public m_terrainTilePaletteMisc:TerrainTilePalette;
    public m_forceVector:ForceVectorToo;

    public m_ctrlKeyDown:boolean;
    public m_mouseDownFlag:boolean;
    public m_mouseDownPos:PIXI.Point;
    public m_layerPos:PIXI.Point;

    // html forms
    public m_loadInput:any;
    public m_saveLink:any;

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

    public m_htmlElements:Map<any, number>;

    public m_keyDownHandler:any;
    public m_keyUpHandler:any;

    public m_resizeListenerID:number;
    
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

        var __layersXMLString = __params[0];
        var __terrainXMLString = __params[1];

        this.m_currentBrush = null;

        this.m_layerPos = new PIXI.Point ();

        this.createForms ();
        
        // this.newTerrainContainer (this.m_worldForm.value);
        // this.newGameLayersContainer (this.m_worldForm.value);

        var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
        __xml.setupWithXMLString (__layersXMLString);
            
        this.m_worldForm.value = __xml.getAttributeString ("world");

        this.newTerrainContainerFromXML (__terrainXMLString);
        this.newGameLayersContainerFromXML (__layersXMLString);

        this.createPalettes ();
        this.createSidePanelPlaceHolder ();

        this.createInputHandlers ();

        console.log (": getParentObject: ", this.m_terrainContainer.getParentObject ());

        this.m_resizeListenerID = this.m_XApp.addWindowResizeListener (this.resize.bind (this));
        this.resize ();

        return this;
    }
	
//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();

        XType.forEach (this.m_htmlElements,
            (__htmlElement:any) => {
                __htmlElement.remove ();
            }
        );

        document.removeEventListener ('keydown', this.m_keyDownHandler);
        document.removeEventListener ('keyup', this.m_keyUpHandler);
    }

//------------------------------------------------------------------------------------------
    public resize ():void {
//        console.log (": Editor: resize: ", this.m_XApp.getWindowWidth (), this.m_XApp.getWindowHeight (), this.m_XApp.getScaleRatio ());

 //       this.m_XApp.getStage ().scale.x = this.m_XApp.getScaleRatio ();
 //       this.m_XApp.getStage ().scale.y = this.m_XApp.getScaleRatio ();

        this.m_XApp.getRenderer ().resize (this.getWindowWidth (), this.getWindowHeight ());

        var __scaleX:number = this.getWindowWidth () / this.m_XApp.getScreenWidth ();
        var __scaleY:number = this.getWindowHeight () / this.m_XApp.getScreenHeight ();

        var __scaleRatio:number = Math.min (__scaleX, __scaleY);
        
        this.m_XApp.getStage ().scale.x = __scaleRatio;
        this.m_XApp.getStage ().scale.y = __scaleRatio;

        this.world.resetLayers ();
    }

    //------------------------------------------------------------------------------------------
    public getWindowWidth ():number {
        var __gameElement:HTMLElement = document.getElementById ("game");
        var __rect:DOMRect = __gameElement.getBoundingClientRect ();

        // console.log (": domRect: ", __rect, window.innerWidth, window.innerHeight);

        // return window.innerWidth;
        return Math.min (__rect.width, window.innerWidth - __rect.x);
    }

    //------------------------------------------------------------------------------------------
    public getWindowHeight ():number {
        var __gameElement:HTMLElement = document.getElementById ("game");
        var __rect:DOMRect = __gameElement.getBoundingClientRect ();

        // return window.innerHeight;
        return Math.min (__rect.height - 250, window.innerHeight - __rect.y) - 8;
    }

//------------------------------------------------------------------------------------------
    public createElement (__name:string):HTMLElement {
        var __htmlElement:any = document.createElement (__name);

        this.m_htmlElements.set (__htmlElement, 0);

        return __htmlElement;
    }

//------------------------------------------------------------------------------------------
    public createForms ():void {
        this.m_htmlElements = new Map<any, number> ();

        this.m_loadInput = this.createElement ("input");
        this.m_loadInput.type = "file";
 
        this.m_saveLink = this.createElement ("a");
        this.m_saveLink.setAttribute ("href", "#");
        
        this.m_worldForm = this.createElement ("input");
        this.m_worldForm.id = "__world";
        this.m_worldForm.value = "Earth";
        this.m_terrainNameForm = this.createElement ("input");
        this.m_terrainNameForm.id = "__terain";
        this.m_terrainNameForm.value = "";

        this.m_layersNameForm = this.createElement ("input");
        this.m_layersNameForm.id = "__layers";
        this.m_layersNameForm.value = "";

        this.m_bgLayerButton = this.createElement ("input");
        this.m_bgLayerButton.id = "__bg";
        this.m_bgLayerButton.type = "radio";
        this.m_bgLayerButton.name = "layer";

        this.m_fgLayerButton = this.createElement ("input");
        this.m_fgLayerButton.id = "__fg";
        this.m_fgLayerButton.type = "radio";
        this.m_fgLayerButton.name = "layer";

        this.m_terrainLayerButton = this.createElement ("input");
        this.m_terrainLayerButton.id = "__terrain";
        this.m_terrainLayerButton.type = "radio";
        this.m_terrainLayerButton.name = "layer";
        this.m_terrainLayerButton.checked = true;

        this.m_platformLayerButton = this.createElement ("input");
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

        this.appendLineBreak ();

        var __gap:string = "  ...  ";
        this.appendLabel ("[b] toggle brush");
        this.appendLabel (__gap);
        this.appendLabel ("[a] position hole arrow");
        this.appendLabel (__gap);
        this.appendLabel ("[h] position hole highlight");
        this.appendLabel (__gap);
        this.appendLabel ("[w] add golf ball");
        this.appendLabel (__gap);
        this.appendLabel ("[x] position hole marker");
        this.appendLabel (__gap);
        this.appendLabel ("[ctrl] + [mouse-down-drag] position layer");

    }

//------------------------------------------------------------------------------------------
    public appendReloadWorldButton ():void {
        this.m_reloadWorldButton = this.createElement ("button");
        this.m_reloadWorldButton.id = "__reload";
        this.m_reloadWorldButton.appendChild (document.createTextNode ("reload"));
        this.m_XApp.container.appendChild (this.m_reloadWorldButton);
        this.m_reloadWorldButton.addEventListener ("click", ()=> {
            console.log (": reload: ");

            if (["Earth", "Moon", "Mars", "Ice", "Squid"].indexOf (this.m_worldForm.value) > -1) {
                this.removePalettes ();
                this.m_gameLayersContainer.changeWorldName (this.m_worldForm.value, this.m_terrainContainer);
                this.m_terrainContainer.changeWorldName (this.m_worldForm.value);
                this.createPalettes ();
            } else {
                window.alert (': valid worlds are: "Earth", "Moon", "Mars", "Ice", "Squid": ');
            }
        });
    }

//------------------------------------------------------------------------------------------
    public appendNewTerrainButton ():void {
        this.m_newTerrainButton = this.createElement ("button");
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
        this.m_loadTerrainButton = this.createElement ("button");
        this.m_loadTerrainButton.id = "__load";
        this.m_loadTerrainButton.appendChild (document.createTextNode ("load terrain"));
        this.m_XApp.container.appendChild (this.m_loadTerrainButton);
        this.m_loadTerrainButton.addEventListener ("click", ()=> {
            console.log (": load: ");	

            this.m_loadInput.click();	
            this.m_loadInput.onchange = () => {
                console.log(": changed: ", this, this.m_loadInput.files[0]);
                this.readTerrainFile(this.m_loadInput);
            };
        });
    }

//------------------------------------------------------------------------------------------
    public appendSaveTerrainButton ():void {
        this.m_saveTerrainButton = this.createElement ("button");
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

                console.log(": ", this.m_saveLink.download);
                var data = 'data:application/text;charset=utf-8,' + encodeURIComponent(__xml.toXMLString ());
                this.m_saveLink.href = data;
                this.m_saveLink.download = "terrain_" + this.m_terrainNameForm.value + ".xml";
                this.m_saveLink.click();
            }
        });
    }

//------------------------------------------------------------------------------------------
    public appendNewLayersButton ():void {
        this.m_newLayersButton = this.createElement ("button");
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
        this.m_loadLayersButton = this.createElement ("button");
        this.m_loadLayersButton.id = "__load";
        this.m_loadLayersButton.appendChild (document.createTextNode ("load layers"));
        this.m_XApp.container.appendChild (this.m_loadLayersButton);
        this.m_loadLayersButton.addEventListener ("click", ()=> {
            console.log (": load: ");	

             // TODO reload terrain container with new world (while keeping contents)
             this.m_loadInput.click();
            this.m_loadInput.onchange = () => {
                console.log(": changed: ", this, this.m_loadInput.files[0]);
                this.readLayersFile(this.m_loadInput);
            };
        });
    }

//------------------------------------------------------------------------------------------
    public appendSaveLayersButton ():void {
        this.m_saveLayersButton = this.createElement ("button");
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

                console.log(": ", this.m_saveLink.download);
                var data = 'data:application/text;charset=utf-8,' + encodeURIComponent(__xml.toXMLString ());
                this.m_saveLink.href = data;
                this.m_saveLink.download = "layers_" + this.m_layersNameForm.value + ".xml";
                this.m_saveLink.click();
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
    public serializeLayers ():XSimpleXMLNode {
        return this.m_gameLayersContainer.serialize (this.m_terrainContainer);
    }

    //------------------------------------------------------------------------------------------
    public serializeTerrain ():XSimpleXMLNode {
        return this.m_terrainContainer.serialize ();
    }

//------------------------------------------------------------------------------------------
    public appendLineBreak ():void {
        this.m_XApp.container.appendChild (this.createElement ("br"));
    }

//------------------------------------------------------------------------------------------
    public appendLabel (__text:string):void {
        var __label = this.createElement ("label");
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

        document.addEventListener ('keydown', this.m_keyDownHandler = this.keyDownHandler.bind (this));
        document.addEventListener ('keyup', this.m_keyUpHandler = this.keyUpHandler.bind (this));

        this.addStageEventListenerX ("mousedown", this.mouseDownHandler.bind (this));
        this.addStageEventListenerX ("mousemove", this.mouseMoveHandler.bind (this));
        this.addStageEventListenerX ("mouseup", this.mouseUpHandler.bind (this));
	}

//------------------------------------------------------------------------------------------
    public keyDownHandler (key:KeyboardEvent):void {
        console.log (": keyDown: ", key.code);

        switch (key.code) {
            /*
            case "Digit1":
                var __point:XPoint = this.m_XApp.getMousePos ().cloneX ();
                this.m_terrainContainer.globalToLocal (this.m_terrainContainer, __point);

                this.m_terrainContainer.createLeftRangeBorder (__point.x, __point.y);

                break;

            case "Digit2":
                var __point:XPoint = this.m_XApp.getMousePos ().cloneX ();
                this.m_terrainContainer.globalToLocal (this.m_terrainContainer, __point);

                this.m_terrainContainer.createRightRangeBorder (__point.x, __point.y)

                break;
            */
           
            case "Digit9":
                this.showPalettes ();

                break;

            case "Digit0":
                this.hidePalettes ();

                break;

            case "ControlLeft":
                this.m_ctrlKeyDown = true;

                break;

            case "KeyB":
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

                    this.m_terrainContainer.createGolfBallAt (__x, __y);
                }

                break;

            case "Backquote":
                this.getGameInstance ().gotoState (
                    "GolfGame",
                    [
                        this.getWorldName (),
                        this.serializeLayers (),
                        this.serializeTerrain ()
                    ]
                );

                break;
        }
    }
    
//------------------------------------------------------------------------------------------
    public keyUpHandler (key:KeyboardEvent):void {
        // console.log (": keyUp: ", key.code);

        switch (key.code) {
            case "ControlLeft":
                this.m_ctrlKeyDown = false;

                break;
        }
    }

//------------------------------------------------------------------------------------------
    public mouseDownHandler (e:PIXI.InteractionEvent):void {
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
    }

//------------------------------------------------------------------------------------------
    public mouseMoveHandler (e:PIXI.InteractionEvent):void {
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
        } else {
            this.pointInTerrainTile (e);
        }
    }

//------------------------------------------------------------------------------------------
    public mouseUpHandler (e:PIXI.InteractionEvent):void {
        this.m_mouseDownFlag = false;

        console.log (": mouseup: ", this.m_terrainContainer.x, this.m_terrainContainer.y);
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
    public pointInTerrainTile (e:PIXI.InteractionEvent):void {
        var __x:number = e.data.getLocalPosition (this.m_terrainContainer).x;
        var __y:number = e.data.getLocalPosition (this.m_terrainContainer).y;

        var __collision:boolean = this.m_terrainContainer.pointInTerrainTile (__x, __y);
        console.log (": terrainTile: ", __collision);
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

                
                this.m_forceVector = this.m_terrainContainer.addGameObjectAsChild (ForceVectorToo, GolfGame.PLAYFIELD_FRONT_LAYER, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as ForceVectorToo;
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
    public newTerrainContainerFromXML (__xmlString:string):void {
        var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
        __xml.setupWithXMLString (__xmlString);
        
        this.createTerrainContainer ().deserialize (__xml);
    }

//------------------------------------------------------------------------------------------
    public newGameLayersContainerFromXML (__xmlString:string):void {
        var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
        __xml.setupWithXMLString (__xmlString);
            
        this.m_worldForm.value = __xml.getAttributeString ("world");
        
        this.createGameLayersContainer ().deserialize (__xml, this.m_terrainContainer);
    }

//------------------------------------------------------------------------------------------
    public createSidePanelPlaceHolder ():SidePanelPlaceHolder {
        this.m_sidePanelPlaceHolder = this.addGameObjectAsChild (SidePanelPlaceHolder, GolfGame.SIDEPANEL_LAYER, GolfGame.SIDEPANEL_DEPTH) as SidePanelPlaceHolder;
        this.m_sidePanelPlaceHolder.afterSetup ([]);
        this.m_sidePanelPlaceHolder.x = 0;
        this.m_sidePanelPlaceHolder.y = 0;
        this.m_sidePanelPlaceHolder.alpha = 0.66;

        return this.m_sidePanelPlaceHolder;
    }

//------------------------------------------------------------------------------------------
    public createTerrainContainer ():TerrainContainer {
        this.m_terrainContainer = this.addGameObjectAsChild (TerrainContainer, 0, 500.0) as TerrainContainer;
        this.m_terrainContainer.afterSetup ([this.m_worldForm.value, true]);
        this.m_terrainContainer.x = 0;
        this.m_terrainContainer.y = 0;
        this.m_terrainContainer.setPropagateCount (-1);
        
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

		var __terrainTilePalette64:TerrainTilePalette = this.m_terrainTilePalette64 = this.addGameObjectAsChild (TerrainTilePalette, GolfGame.HUD_LAYER, 1000.0) as TerrainTilePalette;
		__terrainTilePalette64.afterSetup (["Terrain", 128, this.getWorldName (), TerrainTileIcon.MAX_ICONS, -32, 0.66]);
		__terrainTilePalette64.x = 16;
		__terrainTilePalette64.y = __y;
        __terrainTilePalette64.addSelectedListener (this.createTerrainTileBrushFromIcon.bind (this));
        __y += 128 + 16;

		var __terrainTilePalette32:TerrainTilePalette = this.m_terrainTilePalette32 = this.addGameObjectAsChild (TerrainTilePalette, GolfGame.HUD_LAYER, 1000.0) as TerrainTilePalette;
		__terrainTilePalette32.afterSetup (["Terrain", 64, this.getWorldName (), TerrainTileIcon.MAX_ICONS, 16, 1.0]);
		__terrainTilePalette32.x = 16;
		__terrainTilePalette32.y = __y;
        __terrainTilePalette32.addSelectedListener (this.createTerrainTileBrushFromIcon.bind (this));
        __y += 64 + 16;
        
		var __terrainTilePalette16:TerrainTilePalette = this.m_terrainTilePalette16 = this.addGameObjectAsChild (TerrainTilePalette, GolfGame.HUD_LAYER, 1000.0) as TerrainTilePalette;
		__terrainTilePalette16.afterSetup (["Terrain", 32, this.getWorldName (), TerrainTileIcon.MAX_ICONS, 16, 1.0]);
		__terrainTilePalette16.x = 16;
        __terrainTilePalette16.y = __y;
        __terrainTilePalette16.addSelectedListener (this.createTerrainTileBrushFromIcon.bind (this));
        __y += 32 + 16;

		var __terrainTileMisc:TerrainTilePalette = this.m_terrainTilePaletteMisc = this.addGameObjectAsChild (TerrainTilePalette, GolfGame.HUD_LAYER, 1000.0) as TerrainTilePalette;
		__terrainTileMisc.afterSetup (["TerrainMisc", 32, this.getWorldName (), 20, 16, 1.0]);
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
    public showPalettes ():void {
        this.m_terrainTilePalette64.show ();
        this.m_terrainTilePalette32.show ();
        this.m_terrainTilePalette16.show ();
        this.m_terrainTilePaletteMisc.show ();
    }

//------------------------------------------------------------------------------------------
    public hidePalettes ():void {
        this.m_terrainTilePalette64.hide ();
        this.m_terrainTilePalette32.hide ();
        this.m_terrainTilePalette16.hide ();
        this.m_terrainTilePaletteMisc.hide ();
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