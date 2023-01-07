//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine//sprite/XSprite';
import { XSpriteLayer } from '../../engine//sprite/XSpriteLayer';
import { XSignal } from '../../engine//signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { world } from '../../scripts/app';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine//task/XTaskSubManager';
import { XWorld} from '../../engine//sprite/XWorld';
import { XType } from '../../engine//type/XType';
import { XGameObject} from '../../engine//gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { XSoundManager } from '../../engine//sound/XSoundManager';
import { XSoundSubManager } from '../../engine//sound/XSoundSubManager';
import { XGameInstance } from '../../engine/state/XGameInstance';
import { XBulletCollisionList } from '../../engine/bullet/XBulletCollisionList';
import { OctopusBugX } from './OctopusBugX';

//------------------------------------------------------------------------------------------
export class TestGameInstance extends XGameInstance {

//------------------------------------------------------------------------------------------	
	constructor () {
        super ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld):void {
        super.setup (__world);

        this.__initLogicClassNames ();
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
    }

//------------------------------------------------------------------------------------------
    public __initLogicClassNames ():void {
        this.initLogicClassNames ([
            "__OctopusBug", OctopusBugX,
        ]);
    }

//------------------------------------------------------------------------------------------
}