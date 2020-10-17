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
import { XType } from '../type/XType';
import { XGameObject} from '../gameobject/XGameObject';
import { TerrainTile } from './TerrainTile';
import { TerrainMisc } from './TerrainMisc';
import { G } from '../app/G';
import { XSimpleXMLDocument } from '../xml/XSimpleXMLDocument';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { GameLayer } from './GameLayer';

//------------------------------------------------------------------------------------------
export class TerrainContainer extends XGameObject {
    public m_terrainTiles:Map<TerrainTile, number>;
    public graphics:PIXI.Graphics;

    public m_worldName:string;
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

        var __sprite:PIXI.Sprite = new PIXI.Sprite ();
        this.graphics = new PIXI.Graphics ();
        __sprite.addChild (this.graphics);
        this.addSortableChild (__sprite, 0, 999999.0, true);

        this.m_levelName = "";

        this.m_terrainTiles = new Map<TerrainTile, number> ();

		return this;
	}
    
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
    }

//------------------------------------------------------------------------------------------
    public clearGraphics ():void {
        this.graphics.clear ();
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
        if (this.m_XApp.getResourceByName (this.getWorldName () + "_Layers_Background") != null) {
            this.m_bgLayer = this.addGameObjectAsChild (GameLayer, 0, 0.0) as GameLayer;
            this.m_bgLayer.afterSetup ([this.getWorldName () + "_Layers_Background"])
        }

        if (this.m_XApp.getResourceByName (this.getWorldName () + "_Layers_Platform") != null) {
            this.m_platformLayer = this.addGameObjectAsChild (GameLayer, 0, 5.0) as GameLayer;
            this.m_platformLayer.afterSetup ([this.getWorldName () + "_Layers_Platform"])
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
    public drawForceVector (__x1:number, __y1:number, __x2:number, __y2:number):void {
        this.graphics.clear ();
        this.graphics.lineStyle (2.0, 0xffff00);
        this.graphics.moveTo (__x1, __y1);
        this.graphics.lineTo (__x2, __y2);
    }

//------------------------------------------------------------------------------------------
    public pickupTerrainTile (__x:number, __y:number):TerrainTile {
        var __selectedTile:TerrainTile = null;

        XType.forEach (this.m_terrainTiles,
            (__key:any) => {
                var __terrainTile:TerrainTile = __key as TerrainTile;

                var __dx:number = __terrainTile.getMatterDX ();
                var __dy:number = __terrainTile.getMatterDY ();

                if (
                    (__x > __terrainTile.x - __dx && __x < __terrainTile.x - __dx + __terrainTile.getSize ()) &&
                    (__y > __terrainTile.y - __dy && __y < __terrainTile.y - __dy + __terrainTile.getSize ())
                ) {
                    __selectedTile = __terrainTile;
                }
            }
        );

        return __selectedTile;
    }

//------------------------------------------------------------------------------------------
    public addTerrainTile (__x:number, __y:number, __name:string, __size:number, __world:string, __frame:number):TerrainTile {
        var __terrainTile:TerrainTile;
        
        console.log (": x: ", __x);
        console.log (": y: ", __y);
        console.log (": name: ", __name);
        console.log (": size: ", __size);
        console.log (": world: ", __world);
        console.log (": frame: ", __frame);

        switch (__name) {
            case "Terrain":
                __terrainTile = this.addGameObjectAsChild (TerrainTile, 0, 10.0, true) as TerrainTile;
                break;
            
            case "TerrainMisc":
                __terrainTile = this.addGameObjectAsChild (TerrainMisc, 0, 10.0, true) as TerrainTile;
                break;
        }

        var __dx:number = TerrainTile.calculateCenter (__frame, __size).x;
        var __dy:number = TerrainTile.calculateCenter (__frame, __size).y;

        __terrainTile.afterSetup ([
            __x + __dx, __y + __dy,
            __size,
            __world,
            __frame
        ]);

        this.m_terrainTiles.set (__terrainTile, 0);

        return __terrainTile;
    }
    
//------------------------------------------------------------------------------------------
    public removeTerrainTile (__terrainTile:TerrainTile):void {
        this.m_terrainTiles.delete (__terrainTile);

        __terrainTile.nukeLater ();
    }

//------------------------------------------------------------------------------------------
    public deserialize (__root:XSimpleXMLNode) {
        this.m_worldName = __root.getAttributeString ("world");
        this.m_levelName = __root.getAttributeString ("name");

        var __backgroundXML:XSimpleXMLNode = __root.child ("background")[0];
        var __foregroundXML:XSimpleXMLNode = __root.child ("foreground")[0];
        var __platformXML:XSimpleXMLNode = __root.child ("platform")[0];

        var __tilesXMLList:Array<XSimpleXMLNode> = __root.child ("tiles");
        var __tileXMLList:Array<XSimpleXMLNode> = __tilesXMLList[0].child ("tile");

        var i:number;

        for (i = 0; i < __tileXMLList.length; i++) {
            var __tileXML:XSimpleXMLNode = __tileXMLList[i];

            console.log (": tileXML: ", __tileXML.toXMLString ());

            this.addTerrainTile (
                __tileXML.getAttributeFloat ("x"),
                __tileXML.getAttributeFloat ("y"),
                __tileXML.getAttributeString ("name"),
                __tileXML.getAttributeInt ("size"),
                __tileXML.getAttributeString ("world"),
                __tileXML.getAttributeInt ("frame")
            );
        }

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
        __root.setupWithParams ("terrain", "", ["world", this.m_worldName, "name", this.m_levelName]);

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

        var __tilesXML:XSimpleXMLNode = new XSimpleXMLNode ();
        __tilesXML.setupWithParams ("tiles", "", []);

        __root.addChildWithXMLNode (__tilesXML);

        XType.forEach (this.m_terrainTiles,
            (x:any) => {
                var __terrainTile:TerrainTile = x as TerrainTile; 

                var __tileXML:XSimpleXMLNode = new XSimpleXMLNode ();
                __tileXML.setupWithParams (
                    "tile",
                    "",
                    [
                        "x", __terrainTile.x - __terrainTile.getMatterDX (),
                        "y", __terrainTile.y - __terrainTile.getMatterDY (),
                        "name", __terrainTile.getName (),
                        "size", __terrainTile.getSize (),
                        "world", __terrainTile.getWorld (),
                        "frame", __terrainTile.getFrame ()
                    ]
                );

                __tilesXML.addChildWithXMLNode (__tileXML);
            }
        );

        return __root;
    }

//------------------------------------------------------------------------------------------
}