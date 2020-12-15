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
import { GolfGame} from './GolfGame';
import { XPoint } from '../../engine/geom/XPoint';
import { G } from '../../engine/app/G';
import { InteractiveLayer } from '../terrain/InteractiveLayer';

//------------------------------------------------------------------------------------------
export class GameInteractiveLayer extends InteractiveLayer {
	public m_mouseDownHandler:any;

	public static RES_DIVISOR:number = 2.0;

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
		
        this.addStageEventListenerX ("pointermove", this.m_mouseDownHandler = (e:PIXI.InteractionEvent) => {
            var __mousePos:PIXI.Point = e.data.getLocalPosition (this.world.getLayer (GolfGame.FOREGROUND_LAYER));

            this.m_mousePoint.x = __mousePos.x;
			this.m_mousePoint.y = __mousePos.y;
		});
		
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
	}

//------------------------------------------------------------------------------------------
	public getMousePos ():XPoint {
		return this.m_mousePoint;
	}
        
//------------------------------------------------------------------------------------------
}