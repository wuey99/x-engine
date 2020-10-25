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
import { GameLayer } from './GameLayer';
import { XSimpleXMLDocument } from '../xml/XSimpleXMLDocument';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';

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
			this.m_bgLayer = this.addGameObjectAsChild (GameLayer, 0, 0.0) as GameLayer;
			this.m_bgLayer.afterSetup ([this.getWorldName () + "_Layers_BackgroundX"])
		}

		if (this.m_XApp.getResourceByName (this.getWorldName () + "_Layers_PlatformX") != null) {
			this.m_platformLayer = this.addGameObjectAsChild (GameLayer, 0, 500.0) as GameLayer;
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
	public deserialize (__root:XSimpleXMLNode) {
		this.m_worldName = __root.getAttributeString ("world");
		this.m_levelName = __root.getAttributeString ("name");
		
		var __backgroundXML:XSimpleXMLNode = __root.child ("background")[0];
		var __foregroundXML:XSimpleXMLNode = __root.child ("foreground")[0];
		var __platformXML:XSimpleXMLNode = __root.child ("platform")[0];

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
	}

//------------------------------------------------------------------------------------------
	public serialize ():XSimpleXMLNode {
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

		return __root;
	}

//------------------------------------------------------------------------------------------
}