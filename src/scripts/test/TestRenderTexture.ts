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
        
        var __renderTexture:PIXI.RenderTexture = PIXI.RenderTexture.create ({width: 4096, height: 4096});
        console.log (": renderTexture: ", __renderTexture);
        console.log (": baseRenderTexture: ", __renderTexture.baseTexture);

        var sheet:PIXI.Spritesheet = this.m_XApp.getResourceByName ("OctopusBug");

        var __renderContainer:PIXI.Sprite = new PIXI.Sprite ();

        var __animatedSprite1:PIXI.AnimatedSprite = new PIXI.AnimatedSprite (sheet.animations["root"]);
        __animatedSprite1.gotoAndStop (0);
        __animatedSprite1.x = 0;
        __animatedSprite1.y = 0;

        var __animatedSprite2:PIXI.AnimatedSprite = new PIXI.AnimatedSprite (sheet.animations["root"]);
        __animatedSprite2.gotoAndStop (8);
        __animatedSprite2.x = 256;
        __animatedSprite2.y = 0;

        __renderContainer.addChild (__animatedSprite1);
        __renderContainer.addChild (__animatedSprite2);

        this.m_XApp.getRenderer ().render (__renderContainer, __renderTexture);

        //------------------------------------------------------------------------------------------
        var __renderTextureToo1:PIXI.RenderTexture = new PIXI.RenderTexture (
            __renderTexture.baseTexture as PIXI.BaseRenderTexture,
            new PIXI.Rectangle (0, 0, 128, 128)
        );

        /*
        var __sprite1:PIXI.AnimatedSprite = new PIXI.AnimatedSprite ([__renderTextureToo1]);
        this.addSortableChild (__sprite1, 0, 0.0, true);
        __sprite1.x = G.SCREEN_WIDTH/2;
        __sprite1.y = G.SCREEN_HEIGHT/2;
        */

        var __renderTextureToo2:PIXI.RenderTexture = new PIXI.RenderTexture (
            __renderTexture.baseTexture as PIXI.BaseRenderTexture,
            new PIXI.Rectangle (256, 0, 128, 128)
        );

        var __sprite2:PIXI.AnimatedSprite = new PIXI.AnimatedSprite ([__renderTextureToo1, __renderTextureToo2]);
        this.addSortableChild (__sprite2, 0, 0.0, true);
        __sprite2.x = G.SCREEN_WIDTH/2 + 256;
        __sprite2.y = G.SCREEN_HEIGHT/2;
        __sprite2.gotoAndStop(0);

        console.log (": renderTextureToo: ", __renderTextureToo1);

        //------------------------------------------------------------------------------------------
        var __subManager:XSubTextureManager = this.m_XApp.getTextureManager ().createSubManager ("__global__");
        __subManager.start ();
        __subManager.addFromSpritesheet ("OctopusBug");
        __subManager.finish ();

        var __sprite3:PIXI.AnimatedSprite = __subManager.createAnimatedSprite ("OctopusBug");
        this.addSortableChild (__sprite3, 0, 0.0, true);
        __sprite3.x = 0;
        __sprite3.y = 0;

        console.log (": OctopusBug: ", __sprite3);

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

        console.log (": OctopusBug: ", sheet);
        
        //------------------------------------------------------------------------------------------
		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}