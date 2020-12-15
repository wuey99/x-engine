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
import { TerrainTile } from './TerrainTile';
import { XPoint } from '../../engine/geom/XPoint';

//------------------------------------------------------------------------------------------
export class TerrainMisc extends TerrainTile {

//------------------------------------------------------------------------------------------
    public getName ():string {
        return "TerrainMisc";
    }

//------------------------------------------------------------------------------------------
    public calculateCenter (__frame:number, __size:number):XPoint {   
        var __shape2Vertices:Array<Array<any>> =
        [
            // frame 1, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 2, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 3, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 4, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 5, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 6, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 7, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 8, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 9, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 10, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 11, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 12, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 13, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 14, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 15, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 16, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 17, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 18, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 19, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 20, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
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
            // frame 1, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 2, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 3, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 4, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 5, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 6, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 7, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 8, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 9, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 10, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 11, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 12, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 13, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 14, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 15, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 16, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 17, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 18, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 19, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1}, 
                {x: 0, y: 1}, 
            ],
            // frame 20, BOX
            [
                {x: 0, y: 0},
                {x: 1, y: 0},
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
}