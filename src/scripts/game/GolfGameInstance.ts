//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
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

//------------------------------------------------------------------------------------------
export class GolfGameInstance extends XGameInstance {
    private m_holeCollisionList:XBulletCollisionList;
    private m_topCollisionList:XBulletCollisionList;
    private m_borderCollisionList:XBulletCollisionList;

    private m_onStateChange:any;

//------------------------------------------------------------------------------------------	
	constructor () {
        super ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld):void {
        super.setup (__world);

        this.m_holeCollisionList = world.getXBulletCollisionManager ().addCollisionList ();
        this.m_topCollisionList = world.getXBulletCollisionManager ().addCollisionList ();
        this.m_borderCollisionList = world.getXBulletCollisionManager ().addCollisionList ();
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
    }
    
//------------------------------------------------------------------------------------------
    public setOnStateChange (__onStateChange:any):void {
        this.m_onStateChange = __onStateChange;
    }

//------------------------------------------------------------------------------------------
    public getOnStateChange ():any {
        return this.m_onStateChange;
    }
    
//------------------------------------------------------------------------------------------
    public getHoleCollisionList ():XBulletCollisionList {
        return this.m_holeCollisionList;
    }
    
//------------------------------------------------------------------------------------------
    public getTopCollisionList ():XBulletCollisionList {
        return this.m_topCollisionList;
    }

//------------------------------------------------------------------------------------------
    public getBorderCollisionList ():XBulletCollisionList {
        return this.m_borderCollisionList;
    }

//------------------------------------------------------------------------------------------
}