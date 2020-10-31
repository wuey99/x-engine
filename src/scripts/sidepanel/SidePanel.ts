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
import { SidePanel_ScoreBox } from './SidePanel_ScoreBox';
import { SidePanel_Mass } from './SidePanel_Mass';
import { SidePanel_Planet } from './SidePanel_Planet';
import { SidePanel_ForceGauge } from './SidePanel_ForceGauge';

//------------------------------------------------------------------------------------------
export class SidePanel extends XGameObject {
	public m_scoreBox:SidePanel_ScoreBox;
	public m_mass:SidePanel_Mass;
	public m_planet:SidePanel_Planet;
	public m_forceGauge:SidePanel_ForceGauge;

	public m_worldName:string;

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

		this.m_worldName = __params[0];

		this.createObjects ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}

//------------------------------------------------------------------------------------------
	public setForce (__value:number):void {
		this.m_forceGauge.setForce (__value);
	}

//------------------------------------------------------------------------------------------
	public createObjects ():void {
		var __graphics:PIXI.Graphics = new PIXI.Graphics ();
		__graphics.beginFill (0x000000);
		__graphics.drawRect (0, 0, 180*2, 545*2 + 25);
		__graphics.endFill ();
		this.addSortableChild (__graphics, this.getLayer (),this.getDepth ());

		var __x:number = 165;
		var __y:number = 150;

		this.m_scoreBox = this.addGameObjectAsChild (SidePanel_ScoreBox, this.getLayer (), this.getDepth () + 1.0, false) as SidePanel_ScoreBox;
		this.m_scoreBox.afterSetup ([this.m_worldName]);
		this.m_scoreBox.x = __x;
		this.m_scoreBox.y = __y;

		__y += 180;

		this.m_mass = this.addGameObjectAsChild (SidePanel_Mass, this.getLayer (), this.getDepth () + 1.0, false) as SidePanel_Mass;
		this.m_mass.afterSetup ([this.m_worldName]);
		this.m_mass.x = __x;
		this.m_mass.y = __y;

		__y += 260;	

		this.m_planet = this.addGameObjectAsChild (SidePanel_Planet, this.getLayer (), this.getDepth () + 1.0, false) as SidePanel_Planet;
		this.m_planet.afterSetup ([this.m_worldName]);
		this.m_planet.x = __x;
		this.m_planet.y = __y;

		__y += 300;

		this.m_forceGauge = this.addGameObjectAsChild (SidePanel_ForceGauge, this.getLayer (), this.getDepth () + 1.0, false) as SidePanel_ForceGauge;
		this.m_forceGauge.afterSetup ([this.m_worldName]);
		this.m_forceGauge.x = __x;
		this.m_forceGauge.y = __y;
		this.m_forceGauge.setForce (0.0);
	}

//------------------------------------------------------------------------------------------
}