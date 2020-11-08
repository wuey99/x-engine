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
import { TerrainTile } from './TerrainTile';
import { TerrainMisc } from './TerrainMisc';
import { G } from '../../engine/app/G';
import { XSimpleXMLDocument } from '../../engine/xml/XSimpleXMLDocument';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { GameLayer } from './GameLayer';
import { GolfBall } from '../game/GolfBall';
import { HoleArrow } from '../game/HoleArrow';
import * as Matter from 'matter-js';
import { HoleHighlight } from '../game/HoleHighlight';
import { HoleMarker } from '../game/HoleMarker';
import { GolfGame } from '../game/GolfGame';

//------------------------------------------------------------------------------------------
export class TerrainContainer extends XGameObject {
    public m_terrainTiles:Map<TerrainTile, number>;
    public graphics:PIXI.Graphics;

    public m_worldName:string;
    public m_levelName:string;

    public m_golfBall:GolfBall;
    public m_holeArrow:HoleArrow;
    public m_holeHighlight:HoleHighlight;
    public m_holeMarker:HoleMarker;

    public m_ballStartX:number;
    public m_ballStartY:number;

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

        this.m_worldName = __params[0];

        var __sprite:PIXI.Sprite = new PIXI.Sprite ();
        this.graphics = new PIXI.Graphics ();
        __sprite.addChild (this.graphics);
        this.addSortableChild (__sprite, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true);

        this.m_levelName = "";

        this.m_terrainTiles = new Map<TerrainTile, number> ();

        this.m_golfBall = null;
        this.m_holeArrow = null;
        
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
    public getGraphics ():PIXI.Graphics {
        return this.graphics;
    }
    
//------------------------------------------------------------------------------------------
    public drawForceVector (__color:number, __x1:number, __y1:number, __x2:number, __y2:number):void {
        this.graphics.lineStyle (6.0, __color);
        this.graphics.moveTo (__x1, __y1);
        this.graphics.lineTo (__x2, __y2);
    }

//------------------------------------------------------------------------------------------
    public createGolfBall (__selfShooting:boolean = false):GolfBall {
        return this.createGolfBallAt (this.m_ballStartX, this.m_ballStartY, __selfShooting);
    }

//------------------------------------------------------------------------------------------
    public createGolfBallAt (__x:number, __y:number, __selfShooting:boolean = false):GolfBall {
        if (this.m_golfBall != null) {
            this.m_golfBall.nukeLater ();
        }

        this.m_golfBall = this.addGameObjectAsChild (GolfBall, this.getLayer (), GolfGame.PLAYFIELD_FRONT_DEPTH, false) as GolfBall;
        this.m_golfBall.afterSetup ([this, this.getWorldName (), __selfShooting, __x, __y])
            .attachMatterBodyCircle (Matter.Bodies.circle (__x, __y, 20, {restitution: 0.80, label: "__ball__"}), 20)
            .setMatterRotate (false);

        return this.m_golfBall;
    }

//------------------------------------------------------------------------------------------
    public getGolfBall ():GolfBall {
        return this.m_golfBall;
    }

//------------------------------------------------------------------------------------------
    public createHoleArrow (__x:number, __y:number,):void {
        if (this.m_holeArrow != null) {
            this.m_holeArrow.nukeLater ();
        }

        this.m_holeArrow = this.addGameObjectAsChild (HoleArrow, 0, GolfGame.PLAYFIELD_BEHIND_DEPTH, true) as HoleArrow;
        this.m_holeArrow.afterSetup ([this, this.getWorldName ()]);
        this.m_holeArrow.x = __x;
        this.m_holeArrow.y = __y;
    }

//------------------------------------------------------------------------------------------
    public getHoleArrow ():HoleArrow {
        return this.m_holeArrow;
    }

//------------------------------------------------------------------------------------------
    public createHoleHighlight (__x:number, __y:number):void {
        if (this.m_holeHighlight != null) {
            this.m_holeHighlight.nukeLater ();
        }

        this.m_holeHighlight = this.addGameObjectAsChild (HoleHighlight, 0, GolfGame.PLAYFIELD_BEHIND_DEPTH, true) as HoleHighlight;
        this.m_holeHighlight.afterSetup ([this, this.getWorldName ()]);
        this.m_holeHighlight.x = __x;
        this.m_holeHighlight.y = __y;
    }

//------------------------------------------------------------------------------------------
    public getHoleMarker ():HoleMarker {
        return this.m_holeMarker;
    }

//------------------------------------------------------------------------------------------
    public createHoleMarker (__x:number, __y:number):void {
        if (this.m_holeMarker != null) {
            this.m_holeMarker.nukeLater ();
        }

        this.m_holeMarker = this.addGameObjectAsChild (HoleMarker, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as HoleMarker;
        this.m_holeMarker.afterSetup ([this, this.getWorldName ()]);
        this.m_holeMarker.x = __x;
        this.m_holeMarker.y = __y;
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
                __terrainTile = this.addGameObjectAsChild (TerrainTile, 0, GolfGame.TERRAIN_DEPTH, true) as TerrainTile;
                break;
            
            case "TerrainMisc":
                __terrainTile = this.addGameObjectAsChild (TerrainMisc, 0, GolfGame.TERRAIN_DEPTH, true) as TerrainTile;
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
    public changeWorldName (__worldName:string):void {
        var __xml:XSimpleXMLNode = this.serialize ();

        XType.forEach (this.m_terrainTiles,
            (x:any) => {
                var __terrainTile:TerrainTile = x as TerrainTile;
                __terrainTile.nukeLater ();
            }
        );

        this.m_terrainTiles.clear ();

        this.m_worldName = __worldName;

        this.deserialize (__xml);
    }

//------------------------------------------------------------------------------------------
    public deserialize (__root:XSimpleXMLNode) {
        console.log (": TerrainContainer: deserialize: 1: ");

        this.m_levelName = __root.getAttributeString ("name");

        console.log (": TerrainContainer: deserialize: 2: ");

        var __ballXML:XSimpleXMLNode = __root.child ("ball")[0];
        var __arrowXML:XSimpleXMLNode = __root.child ("arrow")[0];
        var __markerXML:XSimpleXMLNode = __root.child ("marker")[0];
        var __highlightXML:XSimpleXMLNode = __root.child ("highlight")[0];

        this.m_ballStartX = __ballXML.getAttributeFloat ("x");
        this.m_ballStartY = __ballXML.getAttributeFloat ("y");

        this.createGolfBallAt (__ballXML.getAttributeFloat ("x"), __ballXML.getAttributeFloat ("y"));
        this.createHoleArrow (__arrowXML.getAttributeFloat ("x"), __arrowXML.getAttributeFloat ("y"));
        this.createHoleMarker (__markerXML.getAttributeFloat ("x"), __markerXML.getAttributeFloat ("y"));
        this.createHoleHighlight (__highlightXML.getAttributeFloat ("x"), __highlightXML.getAttributeFloat ("y"));

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
                this.m_worldName,
                __tileXML.getAttributeInt ("frame")
            );
        }
    }

//------------------------------------------------------------------------------------------
    public serialize ():XSimpleXMLNode {
        var __root:XSimpleXMLDocument = new XSimpleXMLDocument ();
        __root.setupWithParams ("terrain", "", ["name", this.m_levelName]);
       
        var __ballXML:XSimpleXMLNode = new XSimpleXMLNode ();
        __ballXML.setupWithParams ("ball", "", ["x", this.m_golfBall.x, "y", this.m_golfBall.y]);

        var __arrowXML:XSimpleXMLNode = new XSimpleXMLNode ();
        __arrowXML.setupWithParams ("arrow", "", ["x", this.m_holeArrow.x, "y", this.m_holeArrow.y]);

        var __markerXML:XSimpleXMLNode = new XSimpleXMLNode ();
        __markerXML.setupWithParams ("marker", "", ["x", this.m_holeMarker.x, "y", this.m_holeMarker.y]);

        var __highlightXML:XSimpleXMLNode = new XSimpleXMLNode ();
        __highlightXML.setupWithParams ("highlight", "", ["x", this.m_holeHighlight.x, "y", this.m_holeHighlight.y]);

        __root.addChildWithXMLNode (__ballXML);
        __root.addChildWithXMLNode (__arrowXML);
        __root.addChildWithXMLNode (__markerXML);
        __root.addChildWithXMLNode (__highlightXML);

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