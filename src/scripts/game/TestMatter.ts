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

import { XRect } from '../geom/XRect';

import { TerrainTile } from './TerrainTile';
import { TerrainTilePalette } from '../editor/TerrainTilePalette';

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
        __octopusBug.afterSetup (); // .attachMatterBodyCircle (Matter.Bodies.circle (G.SCREEN_WIDTH / 2, -50, 8), 8);
        __octopusBug.x = 64;
        __octopusBug.y = 64;

        var __ground = Matter.Bodies.rectangle (G.SCREEN_WIDTH / 2, G.SCREEN_HEIGHT + 60/2, G.SCREEN_WIDTH, 60, { isStatic: true });
        Matter.World.add (this.world.getMatterEngine ().world, [__ground]);

        this.m_XApp.getStage ().on ("mousedown", (e:PIXI.InteractionEvent) => {
            console.log (": mouseDown: ", e.data.global);

            var __x:number = e.data.global.x;
            var __y:number = e.data.global.y;

            var __octopusBug:OctopusBug = this.addGameObjectAsChild (OctopusBug, 0, 0.0, false) as OctopusBug;
            __octopusBug.afterSetup ().attachMatterBodyCircle (Matter.Bodies.circle (__x, __y, 8, {restitution: 0.80}), 8);
        });

        this.m_XApp.getStage ().on ("touchstart", (e:PIXI.InteractionEvent) => {
            console.log (": mouseDown: ", e.data.global);

            var __x:number = e.data.global.x;
            var __y:number = e.data.global.y;

            var __octopusBug:OctopusBug = this.addGameObjectAsChild (OctopusBug, 0, 0.0, false) as OctopusBug;
            __octopusBug.afterSetup ().attachMatterBodyCircle (Matter.Bodies.circle (__x, __y, 8, {restitution: 0.80}), 8);    
        });

        var __rectangle:XRect = new XRect (0, 0, 256, 256);
        var __rectangleBody = Matter.Bodies.rectangle (512, 256, __rectangle.width, __rectangle.height, { isStatic: false, angle: Math.PI / 4 });
        var __rectangleObject:XGameObject = this.addGameObjectAsChild (XGameObject, 0, 0.0, true);
        __rectangleObject.afterSetup ().attachMatterBodyRectangle (__rectangleBody, __rectangle);

        var __terrainTile:TerrainTile = this.addGameObjectAsChild (TerrainTile, 0, 10.0, true) as TerrainTile;
        __terrainTile.afterSetup ([G.SCREEN_WIDTH/2, 96, 1]);
        
		var __terrainTilePalette64:TerrainTilePalette = this.addGameObjectAsChild (TerrainTilePalette, 0, 0.0) as TerrainTilePalette;
		__terrainTilePalette64.afterSetup ([64, "01"]);

		__terrainTilePalette64.x = 16;
        __terrainTilePalette64.y = 32;
        
		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}

//------------------------------------------------------------------------------------------
}