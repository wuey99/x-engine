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
import { XState } from '../../engine/state/XState';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { GolfBall } from '../game/GolfBall';
import * as Matter from 'matter-js';
import {Howl, Howler} from 'howler';
import { SidePanel } from '../sidepanel/SidePanel';
import { GameLayersContainer } from '../terrain/GameLayersContainer';
import { GolfGame } from '../game/GolfGame';
import { WorldLevel } from '../game/WorldLevel';
import { XNumber } from '../../engine/task/XNumber';
import { EarthSpaceShip } from './EarthSpaceShip';
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class EarthLevel extends WorldLevel {

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

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
    }
	
//------------------------------------------------------------------------------------------
	public createWorldSprites ():void {
		var __delayForeground:XNumber = new XNumber (9);
		__delayForeground.value = 0.25 * 1000;

		var __delayBackground:XNumber = new XNumber (9);
		__delayBackground.value = 0.25 * 1000;

		var i:number;

		for (i=0; i<8; i++) {
			this.spawnEarthSpaceShipForeground (true);
		}

		for (i=0; i<4; i++) {
			this.spawnEarthSpaceShipBackground (true);
		}

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT1000, __delayForeground,

				() => {
					this.spawnEarthSpaceShipForeground ();

					__delayForeground.value = Math.random () * 3.0 * 1000 + 0.50 * 1000;
				},

				XTask.GOTO, "loop",
			
			XTask.RETN,
		]);

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT1000, __delayBackground,

				() => {
					this.spawnEarthSpaceShipBackground ();

					__delayBackground.value = Math.random () * 6.0 * 1000 + 2.0 * 1000;
				},

				XTask.GOTO, "loop",
			
			XTask.RETN,
		]);
	}

//------------------------------------------------------------------------------------------
	public spawnEarthSpaceShipForeground (__onScreen:boolean = false):void {
		// console.log (": spawnEarthSpaceShip: ");

		var __layer:number;
		var __depth:number;
		var __scale:number;
		var __speed:number;
		var __x:number;
		var __y:number;
		var __dx:number;
		var __dy:number;
		var __flipX:number;

		var __startingY:number;
		__startingY = 900;

		{
			if (Math.random () > 0.75) {
				__layer = GolfGame.PLAYFIELD_FRONT_LAYER;
				__depth = GolfGame.PLAYFIELD_FRONT_DEPTH + 1;
				__scale = 1.5;
				__speed = 16.0;
				__y = __startingY + (G.SCREEN_HEIGHT - __startingY) / 2;
			} else if (Math.random () > 0.50) {
				__layer = GolfGame.PLAYFIELD_BEHIND_LAYER;
				__depth = GolfGame.PLAYFIELD_BEHIND_DEPTH;
				__scale = 0.66;
				__speed = 2.0;
				__y = __startingY + Math.random () * (G.SCREEN_HEIGHT - __startingY);
			} else {
				__layer = GolfGame.PLAYFIELD_FRONT_LAYER;
				__depth = GolfGame.PLAYFIELD_FRONT_DEPTH;
				__scale = 1.0;
				__speed = 4.0;
				__y = __startingY + Math.random () * (G.SCREEN_HEIGHT - __startingY);
			}
			if (Math.random () > 0.50) {
				if (__onScreen) {
					__x = Math.random () * G.SCREEN_WIDTH;
				} else {
					__x = -256;
				}
				__dx = __speed;
				__flipX = +1.0;
			} else {
				if (__onScreen) {
					__x = Math.random () * G.SCREEN_HEIGHT;
				} else {
					__x = G.SCREEN_WIDTH + 256;
				}
				__dx = -__speed;
				__flipX = -1.0;
			}

			__dy = 0;
		}

		var __spaceShip:EarthSpaceShip = this.addPooledGameObjectToWorld (
			EarthSpaceShip,
			__layer, __depth
			) as EarthSpaceShip;
		__spaceShip.afterSetup ([]);

		this.addAdjustableGameObject (__spaceShip, () => {
			__spaceShip.adjustScale (this.m_playfieldAdjustmentScaleX, this.m_playfieldAdjustmentScaleY);
		});

		__spaceShip.setFlipX (__flipX);
		__spaceShip.m_vel.x = __dx * 2;
		__spaceShip.m_vel.y = __dy;
		__spaceShip.setBaseScale (__scale);
		__spaceShip.x = __x;
        __spaceShip.y = __y;
	}

//------------------------------------------------------------------------------------------
	public spawnEarthSpaceShipBackground (__onScreen:boolean = false):void {
		// console.log (": spawnEarthSpaceShip: ");

		var __depth:number;
		var __scale:number;
		var __speed:number;
		var __x:number;
		var __y:number;
		var __dx:number;
		var __dy:number;
		var __flipX:number;

		var __startingY:number;
		__startingY = 0;

		{
			if (Math.random () > 0.50) {
				__depth = GolfGame.PLAYFIELD_BEHIND_DEPTH;
				__scale = 0.1875;
				__speed = 1.0;
				__y = __startingY + Math.random () * (700 - __startingY);
			} else {
				__depth = GolfGame.PLAYFIELD_BEHIND_DEPTH;
				__scale = 0.33;
				__speed = 2.0;
				__y = __startingY + Math.random () * (700 - __startingY);
			}
			if (Math.random () > 0.50) {
				if (__onScreen) {
					__x = Math.random () * G.SCREEN_WIDTH;
				} else {
					__x = -256;
				}
				__dx = __speed;
				__flipX = +1.0;
			} else {
				if (__onScreen) {
					__x = Math.random () * G.SCREEN_HEIGHT;
				} else {
					__x = G.SCREEN_WIDTH + 256;
				}
				__dx = -__speed;
				__flipX = -1.0;
			}

			__dy = 0;
		}

		var __spaceShip:EarthSpaceShip = this.addPooledGameObjectToWorld (
			EarthSpaceShip,
			this.getLayer (), __depth
			) as EarthSpaceShip;
		__spaceShip.afterSetup ([]);
		__spaceShip.alpha = 0.66;

		this.addAdjustableGameObject (__spaceShip, () => {
			__spaceShip.adjustScale (this.m_playfieldAdjustmentScaleX, this.m_playfieldAdjustmentScaleY);
		});
		
		__spaceShip.setFlipX (__flipX);
		__spaceShip.m_vel.x = __dx;
		__spaceShip.m_vel.y = __dy;
		__spaceShip.setBaseScale (__scale);
		__spaceShip.x = __x;
		__spaceShip.y = __y;
	}

//------------------------------------------------------------------------------------------
}