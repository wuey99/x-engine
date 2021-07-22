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
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { OctopusBug } from './OctopusBug';
import { GUID } from '../../engine/utils/GUID';
import { FlockLeader } from './FlockLeader';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { G } from '../../engine/app/G';
import { XTextureManager } from '../../engine/texture/XTextureManager';
import { XSubTextureManager } from '../../engine/texture/XSubTextureManager';

//------------------------------------------------------------------------------------------
export class TestRenderTexture extends XState {

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

        console.log (": guid: ", GUID.create ());
        
        //------------------------------------------------------------------------------------------
        var __subManager:XSubTextureManager = this.m_XApp.getTextureManager ().createSubManager ("__global__");
        __subManager.start ();
        __subManager.addFromSpritesheet ("OctopusBug");
        __subManager.addFromImageList ("bg", ["bg"], new PIXI.Point (0, 0));
        __subManager.finish ();

        var __sprite3:PIXI.AnimatedSprite = __subManager.createAnimatedSprite ("OctopusBug");
        this.addSortableChild (__sprite3, 0, 0.0, true);
        __sprite3.x = 128;
        __sprite3.y = 128;

        console.log (": OctopusBug: ", __sprite3);

        var __octopusBug2:PIXI.AnimatedSprite = this.createAnimatedSprite ("OctopusBug");
        this.addSortableChild (__octopusBug2, 0, 0.0, false);
        __octopusBug2.x = 256;
        __octopusBug2.y = 256;

        // var __bg:PIXI.Sprite = this.createSprite ("bg");
        var __bg:PIXI.AnimatedSprite = __subManager.createAnimatedSprite ("bg");
        this.addSortableChild (__bg, 0, 0.0, false);
        __bg.x = 256;
        __bg.y = 256;

        this.addTask ([
            XTask.LABEL, "loop",
                () => { __sprite3.gotoAndStop (0); }, XTask.WAIT, 0x0200,
                () => { __sprite3.gotoAndStop (1); }, XTask.WAIT, 0x0200,
                () => { __sprite3.gotoAndStop (2); }, XTask.WAIT, 0x0200,
                () => { __sprite3.gotoAndStop (3); }, XTask.WAIT, 0x0200,
                () => { __sprite3.gotoAndStop (4); }, XTask.WAIT, 0x0200,
                () => { __sprite3.gotoAndStop (5); }, XTask.WAIT, 0x0200,
                () => { __sprite3.gotoAndStop (6); }, XTask.WAIT, 0x0200,
                () => { __sprite3.gotoAndStop (7); }, XTask.WAIT, 0x0200,
                
            XTask.GOTO, "loop",
        ]);
        
        //------------------------------------------------------------------------------------------
		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}