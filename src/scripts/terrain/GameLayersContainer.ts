//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
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
import { XDepthSprite} from '../../engine/sprite/XDepthSprite';
import { XType } from '../../engine/type/XType';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { GameLayer } from './GameLayer';
import { XSimpleXMLDocument } from '../../engine/xml/XSimpleXMLDocument';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { XPoint } from '../../engine/geom/XPoint';
import { TerrainContainer } from './TerrainContainer';
import { GolfGame } from '../game/GolfGame';

//------------------------------------------------------------------------------------------
export class GameLayersContainer extends XGameObject {
    public m_worldName:string;;
    public m_levelName:string;	

    public m_bgLayer:GameLayer;
    public m_fgLayer:GameLayer;
    public m_platformLayer:GameLayer;

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

		this.createLayers ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}

//------------------------------------------------------------------------------------------
	public getWorldName ():string {
		return this.m_worldName;
	}

//------------------------------------------------------------------------------------------
	public getLevelName ():string {
		return this.m_levelName;
	}

//------------------------------------------------------------------------------------------
	public setLevelName (__value:string):void {
		this.m_levelName = __value;
	}

//------------------------------------------------------------------------------------------
	public createLayers ():void {
		if (this.m_XApp.getResourceByName (this.getWorldName () + "_Layers_BackgroundX") != null) {
			this.m_bgLayer = this.addGameObjectAsChild (GameLayer, 0, GolfGame.BACKGROUND_DEPTH) as GameLayer;
			this.m_bgLayer.afterSetup ([this.getWorldName () + "_Layers_BackgroundX"])
		}

		if (this.m_XApp.getResourceByName (this.getWorldName () + "_Layers_PlatformX") != null) {
			this.m_platformLayer = this.addGameObjectAsChild (GameLayer, 0, GolfGame.PLATFORM_DEPTH) as GameLayer;
			this.m_platformLayer.afterSetup ([this.getWorldName () + "_Layers_PlatformX"])
			this.m_platformLayer.y = 384;
		}
	}

//------------------------------------------------------------------------------------------
	public getBGLayer ():GameLayer {
		return this.m_bgLayer;
	}

//------------------------------------------------------------------------------------------
	public getFGLayer ():GameLayer {
		return this.m_fgLayer;
	}

//------------------------------------------------------------------------------------------
	public getPlatformLayer ():GameLayer {
		return this.m_platformLayer;
	}

//------------------------------------------------------------------------------------------
	public changeWorldName (__worldName:string, __terrainContainer:TerrainContainer):void {
		this.m_worldName = __worldName;

		var __xml:XSimpleXMLNode = this.serialize (__terrainContainer);

		if (this.m_bgLayer != null) {
			this.m_bgLayer.nukeLater ();

			this.m_bgLayer = null;
		}

		if (this.m_platformLayer != null) {
			this.m_platformLayer.nukeLater ();

			this.m_platformLayer = null;
		}

		this.deserialize (__xml, __terrainContainer);
	}

//------------------------------------------------------------------------------------------
	public deserialize (__root:XSimpleXMLNode, __terrainContainer:TerrainContainer):void {
		this.m_worldName = __root.getAttributeString ("world");
		this.m_levelName = __root.getAttributeString ("name");
		
		var __backgroundXML:XSimpleXMLNode = __root.child ("background")[0];
		var __foregroundXML:XSimpleXMLNode = __root.child ("foreground")[0];
		var __platformXML:XSimpleXMLNode = __root.child ("platform")[0];
		var __terrainXML:XSimpleXMLNode = __root.child ("terrain")[0];

		this.m_bgLayer = null;
		this.m_fgLayer = null;
		this.m_platformLayer = null;

		this.createLayers ();

		console.log (": deserialize: ", __backgroundXML, __foregroundXML, __platformXML);

		if (this.m_bgLayer != null) {
			this.m_bgLayer.x = __backgroundXML.getAttributeFloat ("x");
			this.m_bgLayer.y = __backgroundXML.getAttributeFloat ("y");
		}

		if (this.m_fgLayer != null) {
			this.m_fgLayer.x = __foregroundXML.getAttributeFloat ("x");
			this.m_fgLayer.y = __foregroundXML.getAttributeFloat ("y");
		}

		if (this.m_platformLayer != null) {
			this.m_platformLayer.x = __platformXML.getAttributeFloat ("x");
			this.m_platformLayer.y = __platformXML.getAttributeFloat ("y");
		}

		__terrainContainer.x = __terrainXML.getAttributeFloat ("x");
		__terrainContainer.y = __terrainXML.getAttributeFloat ("y");
	}

//------------------------------------------------------------------------------------------
	public serialize (__terrainContainer:TerrainContainer):XSimpleXMLNode {
		var __root:XSimpleXMLDocument = new XSimpleXMLDocument ();
        __root.setupWithParams ("layers", "", ["world", this.m_worldName, "name", this.m_levelName]);

		function getLayerX (__layer:GameLayer):number {
			return __layer != null ? __layer.x : 0;
		}

		function getLayerY (__layer:GameLayer):number {
			return __layer != null ? __layer.y : 0;
		}

		var __bgLayerXML:XSimpleXMLNode = new XSimpleXMLNode ();
		__bgLayerXML.setupWithParams (
			"background",
			"", 
			["x", getLayerX (this.m_bgLayer), "y", getLayerY (this.m_bgLayer)]
		);
		__root.addChildWithXMLNode (__bgLayerXML);

		var __fgLayerXML:XSimpleXMLNode = new XSimpleXMLNode ();
		__fgLayerXML.setupWithParams (
			"foreground",
			"",
			["x", getLayerX (this.m_fgLayer), "y", getLayerY (this.m_fgLayer)]
		);
		__root.addChildWithXMLNode (__fgLayerXML);

		var __platformLayerXML:XSimpleXMLNode = new XSimpleXMLNode ();
		__platformLayerXML.setupWithParams (
			"platform",
			"",
			["x", getLayerX (this.m_platformLayer), "y", getLayerY (this.m_platformLayer)]
		);
		__root.addChildWithXMLNode (__platformLayerXML);

		var __terrainContainerXML:XSimpleXMLNode = new XSimpleXMLNode ();
		__terrainContainerXML.setupWithParams (
			"terrain",
			"",
			["x", __terrainContainer.x, "y", __terrainContainer.y]
		);
		__root.addChildWithXMLNode (__terrainContainerXML);

		return __root;
	}

//------------------------------------------------------------------------------------------
}