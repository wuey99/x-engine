//------------------------------------------------------------------------------------------
import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js-legacy';
import { XGameObject } from '../../engine/gameobject/XGameObject';
import { XWorld } from '../../engine/sprite/XWorld';
import { XType } from '../../engine/type/XType';
import { XSimpleXMLDocument } from '../../engine/xml/XSimpleXMLDocument';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { GolfBall } from '../game/GolfBall';
import { GolfGame } from '../game/GolfGame';
import { HoleArrow } from '../game/HoleArrow';
import { HoleHighlight } from '../game/HoleHighlight';
import { HoleMarker } from '../game/HoleMarker';
import { HorizontalBorder } from '../game/HorizontalBorder';
import { RangeBorder } from '../game/RangeBorder';
import { TopBorder } from '../game/TopBorder';
import { SidePanel } from '../sidepanel/SidePanel';
import { InteractiveLayer } from './InteractiveLayer';
import { TerrainMisc } from './TerrainMisc';
import { TerrainTile } from './TerrainTile';
import { XTask } from '../../engine/task/XTask';
import { PolygonUtils} from '../utils/PolygonUtils';
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class TerrainContainer extends InteractiveLayer {
    public m_terrainTiles:Map<TerrainTile, number>;
    public graphics:PIXI.Graphics;

    public m_worldName:string;
    public m_levelName:string;

    public m_golfBall:GolfBall;
    public m_holeArrow:HoleArrow;
    public m_holeHighlight:HoleHighlight;
    public m_holeMarker:HoleMarker;
    public m_leftRangeBorder:RangeBorder;
    public m_rightRangeBorder:RangeBorder;
    public m_topRangeBorder:TopBorder;
    public m_bottomRangeBorder:HorizontalBorder;

    public m_ballStartX:number;
    public m_ballStartY:number;

    public m_tileContainer:XGameObject;

    public m_tileTexture:PIXI.RenderTexture;

    public m_editFlag:boolean;

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
        this.m_editFlag = __params[1];

        this.m_levelName = "";

        this.m_terrainTiles = new Map<TerrainTile, number> ();

        this.m_tileContainer = this.addGameObjectAsChild (XGameObject, GolfGame.TERRAIN_LAYER, GolfGame.TERRAIN_DEPTH, false) as XGameObject;
        this.m_tileContainer.afterSetup ([]);

        console.log (": editFlag: ", this.m_editFlag);

        if (!this.m_editFlag) {
            this.m_tileContainer.m_propagateCount = 2;

            this.addTask ([
                XTask.WAIT, 0x0100,

                () => {
                    var __renderTexture:PIXI.RenderTexture = this.m_tileTexture = PIXI.RenderTexture.create ({width: this.m_XApp.getScreenWidth () / G.scaleRatio, height: this.m_XApp.getScreenHeight () / G.scaleRatio});
                     this.m_tileContainer.scale.x = this.m_tileContainer.scale.y = 1 / G.scaleRatio;
                    this.m_XApp.getRenderer ().render (this.m_tileContainer, __renderTexture);

                    var __sprite:PIXI.Sprite = new PIXI.Sprite (__renderTexture);
                    this.addSortableChild (__sprite, GolfGame.TERRAIN_LAYER, GolfGame.TERRAIN_DEPTH, true);
                    __sprite.scale.x = __sprite.scale.y = G.scaleRatio;

                    this.m_tileContainer.hide ();

                   // console.log (": vertices: ", this.combineAllTerrainTileVertices ());

                   /*
                   var __vertices:Array<any> = this.combineAllTerrainTileVertices ();

                   this.attachMatterBodyVertices (
                        Matter.Bodies.fromVertices (this.x, this.y, __vertices, { isStatic: true, angle: 0 }),
                        __vertices,
                        true
                    );
                    */
                },

                XTask.RETN,
            ]);
        } else {
            this.m_tileContainer.m_propagateCount = -1;
        }

        this.m_golfBall = null;
        this.m_holeArrow = null;
        
		return this;
	}
    
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();

        if (this.m_tileTexture != null) {
            this.m_tileTexture.destroy ();
        }
    }

//------------------------------------------------------------------------------------------
    public setPropagateCount (__count:number):void {
        this.m_tileContainer.m_propagateCount = __count;
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
    public createGolfBall (__selfShooting:boolean = false):GolfBall {
        return this.createGolfBallAt (this.m_ballStartX, this.m_ballStartY, __selfShooting);
    }

//------------------------------------------------------------------------------------------
    public createLeftRangeBorder (__x:number, __y:number):void {
        if (this.m_leftRangeBorder != null) {
            this.m_leftRangeBorder.nukeLater ();
        }

        this.addTask ([
            XTask.WAIT, 0x0100,

            () => {
                __x = -this.x + SidePanel.WIDTH + 4;

                this.m_leftRangeBorder = this.addGameObjectAsChild (RangeBorder, GolfGame.PLAYFIELD_FRONT_LAYER, 999999.0, false) as RangeBorder;
                this.m_leftRangeBorder.afterSetup ([this, -256, +16]);
                this.m_leftRangeBorder.x = __x;
                this.m_leftRangeBorder.y = __y;
            },

            XTask.RETN,
        ]);
    }

//------------------------------------------------------------------------------------------
    public getLeftRangeBorder ():RangeBorder {
        return this.m_leftRangeBorder;
    }

//------------------------------------------------------------------------------------------
    public createRightRangeBorder (__x:number, __y:number):void {
        if (this.m_rightRangeBorder != null) {
            this.m_rightRangeBorder.nukeLater ();
        }

        this.addTask ([
            XTask.WAIT, 0x0100,

            () => {
                __x = -this.x + this.m_XApp.getScreenWidth () - 4;

                this.m_rightRangeBorder = this.addGameObjectAsChild (RangeBorder, GolfGame.PLAYFIELD_FRONT_LAYER, 999999.0, false) as RangeBorder;
                this.m_rightRangeBorder.afterSetup ([this,  -16, +256]);
                this.m_rightRangeBorder.x = __x;
                this.m_rightRangeBorder.y = __y;
            },

            XTask.RETN,
        ]);
    }

//------------------------------------------------------------------------------------------
    public getRightRangeBorder ():RangeBorder {
        return this.m_rightRangeBorder;
    }

//------------------------------------------------------------------------------------------
    public createTopRangeBorder (__x:number, __y:number):void {
        if (this.m_topRangeBorder != null) {
            this.m_topRangeBorder.nukeLater ();
        }

        this.addTask ([
            XTask.WAIT, 0x0100,

            () => {
                __y = -this.y;

                this.m_topRangeBorder = this.addGameObjectAsChild (TopBorder, GolfGame.PLAYFIELD_FRONT_LAYER, 999999.0, false) as TopBorder;
                this.m_topRangeBorder.afterSetup ([this,  -32768, +16]);
                this.m_topRangeBorder.x = __x;
                this.m_topRangeBorder.y = __y;
                this.m_topRangeBorder.visible = false;
            },

            XTask.RETN,
        ]);
    }

//------------------------------------------------------------------------------------------
    public createBottomRangeBorder (__x:number, __y:number):void {
        if (this.m_bottomRangeBorder != null) {
            this.m_rightRangeBorder.nukeLater ();
        }

        this.addTask ([
            XTask.WAIT, 0x0100,

            () => {
                __y = -this.y + this.m_XApp.getScreenHeight () - 4;

                this.m_bottomRangeBorder = this.addGameObjectAsChild (HorizontalBorder, GolfGame.PLAYFIELD_FRONT_LAYER, 999999.0, false) as HorizontalBorder;
                this.m_bottomRangeBorder.afterSetup ([this,  -16, +256]);
                this.m_bottomRangeBorder.x = __x;
                this.m_bottomRangeBorder.y = __y;
            },

            XTask.RETN,
        ]);
    }

//------------------------------------------------------------------------------------------
    public getBottomRangeBorder ():RangeBorder {
        return this.m_bottomRangeBorder;
    }

//------------------------------------------------------------------------------------------
    public createGolfBallAt (__x:number, __y:number, __selfShooting:boolean = false):GolfBall {
        if (this.m_golfBall != null) {
            this.m_golfBall.nukeLater ();
        }

        this.m_golfBall = this.addGameObjectAsChild (GolfBall, GolfGame.PLAYFIELD_FRONT_LAYER, GolfGame.PLAYFIELD_FRONT_DEPTH, false) as GolfBall;
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

        this.m_holeArrow = this.addGameObjectAsChild (HoleArrow, GolfGame.PLAYFIELD_BEHIND_LAYER, GolfGame.PLAYFIELD_BEHIND_DEPTH, true) as HoleArrow;
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

        this.m_holeHighlight = this.addGameObjectAsChild (HoleHighlight, GolfGame.PLAYFIELD_BEHIND_LAYER, GolfGame.PLAYFIELD_BEHIND_DEPTH, true) as HoleHighlight;
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

        this.m_holeMarker = this.addGameObjectAsChild (HoleMarker, GolfGame.PLAYFIELD_FRONT_LAYER, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as HoleMarker;
        this.m_holeMarker.afterSetup ([this, this.getWorldName ()]);
        this.m_holeMarker.x = __x;
        this.m_holeMarker.y = __y;
    }

//------------------------------------------------------------------------------------------
    public getTerrainTiles ():Map<TerrainTile, number> {
        return this.m_terrainTiles;
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
    public pointInTerrainTile (__x:number, __y:number):boolean {
        var __collision:boolean = false;

        XType.forEach (this.m_terrainTiles,
            (__key:any) => {
                var __terrainTile:TerrainTile = __key as TerrainTile;

                var __dx:number = __terrainTile.getMatterDX ();
                var __dy:number = __terrainTile.getMatterDY ();

                if (__terrainTile.pointInPoly (__x + __dx, __y + __dy)) {
                    __collision = true;
                }
            }
        );

        return __collision;
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

        if (this.m_editFlag) {
            switch (__name) {
                case "Terrain":
                    __terrainTile = this.addGameObjectAsChild (TerrainTile, GolfGame.TERRAIN_LAYER, GolfGame.TERRAIN_DEPTH, true) as TerrainTile;
                    break;
                
                case "TerrainMisc":
                    __terrainTile = this.addGameObjectAsChild (TerrainMisc, GolfGame.TERRAIN_LAYER, GolfGame.TERRAIN_DEPTH, true) as TerrainMisc;
                    break;
            }
        } else {
            switch (__name) {
                case "Terrain":
                    __terrainTile = this.m_tileContainer.addGameObjectToSelf (TerrainTile) as TerrainTile;
                    break;
                
                case "TerrainMisc":
                    __terrainTile = this.m_tileContainer.addGameObjectToSelf (TerrainMisc) as TerrainMisc;
                    break;
            }
        }

        var __dx:number = __terrainTile.calculateCenter (__frame, __size).x;
        var __dy:number = __terrainTile.calculateCenter (__frame, __size).y;

        __terrainTile.afterSetup ([
            __x + __dx, __y + __dy,
            __size,
            __world,
            __frame,
            this.m_editFlag
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
    public combineAllTerrainTileVertices ():Array<any> {
        var __vertices:Array<any> = new Array<any> ();

        XType.forEach (this.m_terrainTiles,
            (__terrainTile:TerrainTile) => {
                __vertices = __vertices.concat (__terrainTile.getVerticesAsArray ());
            }
        );

        console.log (": vertices0: ", __vertices);

        var __polygons:Array<any> = PolygonUtils.instance ().union ([__vertices]);

        console.log (": vertices1: ", __polygons);

        var __matterPolygons:Array<any> = this.convertPolygonArrayToMattter (__polygons);

        console.log (": vertices2: ", __matterPolygons);
        
        return __matterPolygons;
    }

//------------------------------------------------------------------------------------------
    public convertPolygonArrayToMattter (__polygons:any):Array<any> {
        var i:number;

        var __element:any;

        for (i = 0; i < __polygons.length; i++) {
            __element = __polygons[i];

            if (Array.isArray (__element)) {
                console.log (": convert: ", __element, Array.isArray (__element[0]));

                if (Array.isArray (__element[0])) {
                    this.convertPolygonArrayToMattter (__element);
                } else {
                    __polygons[i] = {
                        x: __element[0],
                        y: __element[1]
                    };
                }
            }
        }

        return __polygons;
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
        var __leftRangeBorderXMLList:Array<XSimpleXMLNode> = __root.child ("leftRangeBorder");
        var __rightRangeBorderXMLList:Array<XSimpleXMLNode> = __root.child ("rightRangeBorder");
        var __leftRangeBorderXML = null;
        var __rightRangeBorderXML = null;
        if (__leftRangeBorderXMLList.length > 0) {
            __leftRangeBorderXML = __leftRangeBorderXMLList[0];
        }
        if (__rightRangeBorderXMLList.length > 0) {
            __rightRangeBorderXML = __rightRangeBorderXMLList[0];
        }
        this.m_ballStartX = __ballXML.getAttributeFloat ("x");
        this.m_ballStartY = __ballXML.getAttributeFloat ("y");

        this.createGolfBallAt (__ballXML.getAttributeFloat ("x"), __ballXML.getAttributeFloat ("y"));
        this.createHoleArrow (__arrowXML.getAttributeFloat ("x"), __arrowXML.getAttributeFloat ("y"));
        this.createHoleMarker (__markerXML.getAttributeFloat ("x"), __markerXML.getAttributeFloat ("y"));
        this.createHoleHighlight (__highlightXML.getAttributeFloat ("x"), __highlightXML.getAttributeFloat ("y"));
        if (__leftRangeBorderXML != null) {
            this.createLeftRangeBorder (__leftRangeBorderXML.getAttributeFloat ("x"), __leftRangeBorderXML.getAttributeFloat ("y"));
        }
        if (__rightRangeBorderXML != null) {
            this.createRightRangeBorder (__rightRangeBorderXML.getAttributeFloat ("x"), __rightRangeBorderXML.getAttributeFloat ("y"));   
        }

        this.createBottomRangeBorder (this.m_XApp.getScreenWidth () / 2, this.m_XApp.getScreenHeight () / 2);
        this.createTopRangeBorder (this.m_XApp.getScreenWidth () / 2, this.m_XApp.getScreenHeight () / 2);

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

        // this.m_propagateCount = 4;
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

        if (this.m_leftRangeBorder != null) {
            var __leftRangeBorderXML:XSimpleXMLNode = new XSimpleXMLNode ();
            __leftRangeBorderXML.setupWithParams ("leftRangeBorder", "", ["x", this.m_leftRangeBorder.x, "y", this.m_leftRangeBorder.y]);
        }

        if (this.m_rightRangeBorder != null) {
            var __rightRangeBorderXML:XSimpleXMLNode = new XSimpleXMLNode ();
            __rightRangeBorderXML.setupWithParams ("rightRangeBorder", "", ["x", this.m_rightRangeBorder.x, "y", this.m_rightRangeBorder.y]);
        }

        __root.addChildWithXMLNode (__ballXML);
        __root.addChildWithXMLNode (__arrowXML);
        __root.addChildWithXMLNode (__markerXML);
        __root.addChildWithXMLNode (__highlightXML);
        __root.addChildWithXMLNode (__leftRangeBorderXML);
        __root.addChildWithXMLNode (__rightRangeBorderXML);

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