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
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { OctopusBug } from './OctopusBug';
import { GUID } from '../../engine/utils/GUID';
import { FlockLeader } from './FlockLeader';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { G } from '../../engine/app/G';

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
        var __animatedSprite:PIXI.AnimatedSprite = new PIXI.AnimatedSprite (sheet.animations["root"]);
        __animatedSprite.gotoAndStop (0);
        __animatedSprite.x = 0;
        __animatedSprite.y = 0;
        
        this.m_XApp.getRenderer ().render (__animatedSprite, __renderTexture);

        var __renderTextureToo:PIXI.RenderTexture = new PIXI.RenderTexture (
            __renderTexture.baseTexture as PIXI.BaseRenderTexture,
            new PIXI.Rectangle (0, 0, 128, 128)
        );

        var __sprite:PIXI.AnimatedSprite = new PIXI.AnimatedSprite ([__renderTextureToo]);
        this.addSortableChild (__sprite, 0, 0.0, true);
        __sprite.x = G.SCREEN_WIDTH/2;
        __sprite.y = G.SCREEN_HEIGHT/2;

        console.log (": renderTextureToo: ", __renderTextureToo);
        
		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}