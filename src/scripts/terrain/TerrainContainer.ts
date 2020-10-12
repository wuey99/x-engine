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

//------------------------------------------------------------------------------------------
export class TerrainContainer extends XGameObject {
    public m_terrainTiles:Map<TerrainTile, number>;
    
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

        this.m_terrainTiles = new Map<TerrainTile, number> ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
    }

//------------------------------------------------------------------------------------------
    public pickupTerrainTile (__x:number, __y:number):TerrainTile {
        var __selectedTile:TerrainTile = null;

        XType.forEach (this.m_terrainTiles,
            (__key:any) => {
                var __terrainTile:TerrainTile = __key as TerrainTile;

                if (
                    (__x > __terrainTile.x && __x < __terrainTile.x + __terrainTile.getSize ()) &&
                    (__y > __terrainTile.y && __y < __terrainTile.y + __terrainTile.getSize ())
                ) {
                    __selectedTile = __terrainTile;
                }
            }
        );

        return __selectedTile;
    }

//------------------------------------------------------------------------------------------
    public addTerrainTile (__x:number, __y:number, __name:string, __size:number, __terrain:string, __frame:number):TerrainTile {
        var __terrainTile:TerrainTile;
        
        console.log (": x: ", __x);
        console.log (": y: ", __y);
        console.log (": name: ", __name);
        console.log (": size: ", __size);
        console.log (": terrain: ", __terrain);
        console.log (": frame: ", __frame);
        
        switch (__name) {
            case "Terrain":
                __terrainTile = this.addGameObjectAsChild (TerrainTile, 0, 10.0, true) as TerrainTile;
                break;
            
            case "TerrainMisc":
                __terrainTile = this.addGameObjectAsChild (TerrainMisc, 0, 10.0, true) as TerrainTile;
                break;
        }

        __terrainTile.afterSetup ([
            __x, __y,
            __size,
            __terrain,
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
    public deserialize (__xml:XSimpleXMLNode) {
        var __tilesXMLList:Array<XSimpleXMLNode> = __xml.child ("tiles");
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
                "0" + __tileXML.getAttributeString ("terrain"),
                __tileXML.getAttributeInt ("frame")
            );
        }
    }

//------------------------------------------------------------------------------------------
    public serialize ():XSimpleXMLNode {
        var __root:XSimpleXMLDocument = new XSimpleXMLDocument ();
        __root.setupWithParams ("terrain", "", []);

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
                        "x", __terrainTile.x,
                        "y", __terrainTile.y,
                        "name", __terrainTile.getName (),
                        "size", __terrainTile.getSize (),
                        "terrain", __terrainTile.getTerrain (),
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