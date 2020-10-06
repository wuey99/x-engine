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
import { XGameObject} from '../gameobject/XGameObject';
import { XState } from '../state/XState';
import { OctopusBug } from './OctopusBug';
import { GUID } from '../utils/GUID';
import { FlockLeader } from './FlockLeader';
import { G } from '../app/G';

import * as Matter from 'matter-js';
import { World, Body, Engine } from 'matter-js';

import { Class } from '../type/XType';

//------------------------------------------------------------------------------------------
export class TestMatter extends XState {
	
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

		var __octopusBug:OctopusBug = this.addGameObjectAsChild (OctopusBug, 0, 0.0, false) as OctopusBug;
        __octopusBug.afterSetup ().attachMatterBody (Matter.Bodies.circle (G.SCREEN_WIDTH / 2, -50, 10));
        
        var __ground = Matter.Bodies.rectangle (G.SCREEN_WIDTH / 2, G.SCREEN_HEIGHT + 60/2, G.SCREEN_WIDTH, 60, { isStatic: true });
        Matter.World.add (this.world.getMatterEngine ().world, [__ground]);

        this.m_XApp.getStage ().on ("mousedown", (e:PIXI.InteractionEvent) => {
            console.log (": mouseDown: ", e.data.global);

            var __x:number = e.data.global.x;
            var __y:number = e.data.global.y;

            var __octopusBug:OctopusBug = this.addGameObjectAsChild (OctopusBug, 0, 0.0, false) as OctopusBug;
            __octopusBug.afterSetup ().attachMatterBody (Matter.Bodies.circle (__x, __y, 5, {restitution: 0.80}));
        });

        this.m_XApp.getStage ().on ("touchstart", (e:PIXI.InteractionEvent) => {
            console.log (": mouseDown: ", e.data.global);

            var __x:number = e.data.global.x;
            var __y:number = e.data.global.y;

            var __octopusBug:OctopusBug = this.addGameObjectAsChild (OctopusBug, 0, 0.0, false) as OctopusBug;
            __octopusBug.afterSetup ().attachMatterBody (Matter.Bodies.circle (__x, __y, 5, {restitution: 0.80}));    
        });

        var __vertices:Array<any> = [
            {x: -G.SCREEN_WIDTH/4, y: G.SCREEN_HEIGHT/4},
            {x: 0, y: -G.SCREEN_HEIGHT/4},
            {x: G.SCREEN_WIDTH/4, y: G.SCREEN_HEIGHT/4},
        ];
        
        var graphics = new PIXI.Graphics ();
        graphics.beginFill (0x0000ff);
        graphics.drawPolygon (
            this.convertVerticesToPoints (G.SCREEN_WIDTH/2, G.SCREEN_HEIGHT*.75, __vertices)
        );
        graphics.endFill ();
        this.addChild (graphics);

        var __terrain = Matter.Bodies.fromVertices (G.SCREEN_WIDTH/2, G.SCREEN_HEIGHT*.75, __vertices, { isStatic: true })
        Matter.World.add (this.world.getMatterEngine ().world, __terrain);

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public convertVerticesToPoints (__regX:number, __regY:number, __vertices:Array<any>):Array<PIXI.Point> {
        var __points:Array<PIXI.Point> = new Array<PIXI.Point> ();

        var __vertex:any;
        for (__vertex of __vertices) {
            __points.push (new PIXI.Point (__vertex.x + __regX, __vertex.y + __regY));
        }

        return __points;
    }
    
//------------------------------------------------------------------------------------------
}