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
import * as Matter from 'matter-js';
import { World, Body, Engine } from 'matter-js';
import { G } from '../../engine/app/G';
import { XPoint } from '../../engine/geom/XPoint';

//------------------------------------------------------------------------------------------
export class TerrainTile extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;

	public m_size:number;
	public m_world:string;
	public m_frame:number;

    public m_editFlag:boolean;

    public m_vertices:Array<any>;

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

        this.x = __params[0];
        this.y = __params[1];
		this.m_size = __params[2] as number;
		this.m_world = __params[3] as string;
        this.m_frame = __params[4] as number;
        this.m_editFlag = __params[5] as boolean;

        this.createSprites ();

        this.createBody ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createAnimatedSprite (this.m_world + "_" + this.getName () + this.m_size + "x" + this.m_size);
        if (this.m_editFlag) {
            this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth (), true);
        } else {
            this.addSpriteToSelf (this.m_sprite, 0, 0);
        }
        this.m_sprite.scale.x = 1 + 1 / this.m_size;
        this.m_sprite.scale.y = 1 + 1 / this.m_size;

        this.m_sprite.gotoAndStop (this.m_frame);

        this.m_sprite.visible = true;

        this.show ();
    }

//------------------------------------------------------------------------------------------
    public getName ():string {
        return "Terrain";
    }

//------------------------------------------------------------------------------------------
    public getSize ():number {
        return this.m_size;
    }

//------------------------------------------------------------------------------------------
    public getWorld ():string {
        return this.m_world;
    }

//------------------------------------------------------------------------------------------
    public getFrame ():number {
        return this.m_frame;
    }

//------------------------------------------------------------------------------------------
    public setPivot (__dx:number, __dy:number):void {
        this.m_sprite.pivot.x = __dx;
        this.m_sprite.pivot.y = __dy;
    }

//------------------------------------------------------------------------------------------
    public calculateCenter (__frame:number, __size:number):XPoint {   
        var __shape2Vertices:Array<Array<any>> =
        [
            // frame 1, UL45
            [
                {x: 1, y: 0},
                {x: 0, y: 1},
                {x: 1, y: 1},
            ],
            // frame 2, UR45
            [
                {x: 0, y: 0},
                {x: 1, y: 1},
                {x: 0, y: 1},
            ],
            // frame 3, UL BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 4, UL BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 5, LL45
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
            ],
            // frame 6, LR45
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 0, y: 1}, 
            ],
            // frame 7 LL BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 8 LR BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 9 LF BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 10 RT BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 11 TOP BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 12 BOT BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 13 EMPTY BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 14 UL22.5
            [
                {x: 0, y: 1},
                {x: 1, y: 1},
                {x: 1, y: 0.5},
            ],
            // frame 15 UR22.5
            [
                {x: 0, y: 0.5},
                {x: 1, y: 1},
                {x: 0, y: 1},
            ],
            // frame 16 UL67.5
            [
                {x: 1, y: 0},
                {x: 1, y: 1},
                {x: 0.5, y: 1},
            ],
            // frame 17 UR67.5
            [
                {x: 0, y: 0},
                {x: 0.5, y: 1},
                {x: 0, y: 1},
            ],
            // frame 18 LL22.5
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 0.5},
            ],
            // frame 19 LE22.5
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 0, y: 0.5},
            ],
            // frame 20 LL67.5
            [
                {x: 0.5, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1},
            ],
            // frame 21 LR67.5
            [
                {x: 0, y: 0},
                {x: 0.5, y: 0},
                {x: 0, y: 1},
            ],
            // frame 22, UL45
            [
                {x: 1, y: 0},
                {x: 0, y: 1},
                {x: 1, y: 1},
            ],
            // frame 23, UR45
            [
                {x: 0, y: 0},
                {x: 1, y: 1},
                {x: 0, y: 1},
            ],
            // frame 24 UL67.5
            [
                {x: 1, y: 0},
                {x: 1, y: 1},
                {x: 0.5, y: 1},
            ],
            // frame 25 UR67.5
            [
                {x: 0, y: 0},
                {x: 0.5, y: 1},
                {x: 0, y: 1},
            ],
            // frame 26 UL22.5
            [
                {x: 0, y: 1},
                {x: 1, y: 1},
                {x: 1, y: 0.5},
            ],
            // frame 27 UR22.5
            [
                {x: 0, y: 0.5},
                {x: 1, y: 1},
                {x: 0, y: 1},
            ],
        ];

        var __vertices:Array<any> = __shape2Vertices[__frame];

        var __vertex:any;

        for (__vertex of __vertices) {
            __vertex.x *= __size;
            __vertex.y *= __size;
        }

        var __vector = Matter.Vertices.centre (__vertices);

        return new XPoint (__vector.x, __vector.y);
    }

//------------------------------------------------------------------------------------------
    public createBody ():void {   
        var __shape2Vertices:Array<Array<any>> =
        [
            // frame 1, UL45
            [
                {x: 1, y: 0},
                {x: 0, y: 1},
                {x: 1, y: 1},
            ],
            // frame 2, UR45
            [
                {x: 0, y: 0},
                {x: 1, y: 1},
                {x: 0, y: 1},
            ],
            // frame 3, UL BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 4, UL BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 5, LL45
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
            ],
            // frame 6, LR45
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 0, y: 1}, 
            ],
            // frame 7 LL BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 8 LR BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 9 LF BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 10 RT BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 11 TOP BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 12 BOT BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 13 EMPTY BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 14 UL22.5
            [
                {x: 0, y: 1},
                {x: 1, y: 1},
                {x: 1, y: 0.5},
            ],
            // frame 15 UR22.5
            [
                {x: 0, y: 0.5},
                {x: 1, y: 1},
                {x: 0, y: 1},
            ],
            // frame 16 UL67.5
            [
                {x: 1, y: 0},
                {x: 1, y: 1},
                {x: 0.5, y: 1},
            ],
            // frame 17 UR67.5
            [
                {x: 0, y: 0},
                {x: 0.5, y: 1},
                {x: 0, y: 1},
            ],
            // frame 18 LL22.5
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 0.5},
            ],
            // frame 19 LE22.5
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 0, y: 0.5},
            ],
            // frame 20 LL67.5
            [
                {x: 0.5, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1},
            ],
            // frame 21 LR67.5
            [
                {x: 0, y: 0},
                {x: 0.5, y: 0},
                {x: 0, y: 1},
            ],
            // frame 22, UL45
            [
                {x: 1, y: 0},
                {x: 0, y: 1},
                {x: 1, y: 1},
            ],
            // frame 23, UR45
            [
                {x: 0, y: 0},
                {x: 1, y: 1},
                {x: 0, y: 1},
            ],
            // frame 24 UL67.5
            [
                {x: 1, y: 0},
                {x: 1, y: 1},
                {x: 0.5, y: 1},
            ],
            // frame 25 UR67.5
            [
                {x: 0, y: 0},
                {x: 0.5, y: 1},
                {x: 0, y: 1},
            ],
            // frame 26 UL22.5
            [
                {x: 0, y: 1},
                {x: 1, y: 1},
                {x: 1, y: 0.5},
            ],
            // frame 27 UR22.5
            [
                {x: 0, y: 0.5},
                {x: 1, y: 1},
                {x: 0, y: 1},
            ],
        ];

        var __vertices:Array<any> = __shape2Vertices[this.m_frame];

        var __vertex:any;

        for (__vertex of __vertices) {
            __vertex.x *= this.getSize ();
            __vertex.y *= this.getSize ();
        }

        this.m_vertices = __vertices;

        this.attachMatterBodyVertices (
            Matter.Bodies.fromVertices (this.x, this.y, __vertices, { isStatic: true, angle: 0 }),
            __vertices,
            true
        );
    }

//------------------------------------------------------------------------------------------
    public getVertices ():Array<any> {
        return this.m_vertices;
    }


//------------------------------------------------------------------------------------------
    public pointInPoly (px:number, py:number):boolean {
        var collision:boolean = false;

        // go through each of the vertices, plus
        // the next vertex in the list
        var next:number = 0;
        var current:number;

        for (current=0; current < this.m_vertices.length; current++) {
      
          // get next vertex in list
          // if we've hit the end, wrap around to 0
          next = current+1;
          if (next == this.m_vertices.length) next = 0;
      
          // get the vectors at our current position
          // this makes our if statement a little cleaner
          var vc:any = this.m_vertices[current];    // c for "current"
          var vn:any = this.m_vertices[next];       // n for "next"
      
          // compare position, flip 'collision' variable
          // back and forth

          var vc_x:number = this.x + vc.x;
          var vc_y:number = this.y + vc.y;
          var vn_x:number = this.x + vn.x;
          var vn_y:number = this.y + vn.y;

          if (((vc_y >= py && vn_y < py) || (vc_y < py && vn_y >= py)) &&
               (px < (vn_x-vc_x)*(py-vc_y) / (vn_y-vc_y)+vc_x)) {
                  collision = !collision;
          }
        }
        return collision;
    }

//------------------------------------------------------------------------------------------
    public getVerticesAsArray ():Array<any> {
        var __vertices:Array<any> = new Array<any> ();

        var i:number;

        for (i = 0; i < this.m_vertices.length; i++) {
            __vertices.push ([
                this.x + this.m_vertices[i].x, this.y + this.m_vertices[i].y
            ]);
        }

        return __vertices;
    }

//------------------------------------------------------------------------------------------
        /*
        [
            [[6,6],[8,8],[25,8],[25,6]]
        ];
        */

//------------------------------------------------------------------------------------------
}