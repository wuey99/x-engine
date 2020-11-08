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
import { TerrainContainer } from '../terrain/TerrainContainer';
import { XState } from '../../engine/state/XState';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { ForceVector } from '../game/ForceVector';
import { GolfBall } from '../game/GolfBall';
import * as Matter from 'matter-js';
import {Howl, Howler} from 'howler';
import { SidePanel } from '../sidepanel/SidePanel';
import { GameLayersContainer } from '../terrain/GameLayersContainer';
import { GolfGame } from '../game/GolfGame';
import { WorldLevel } from '../game/WorldLevel';

//------------------------------------------------------------------------------------------
export class SquidLevel extends WorldLevel {

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
}