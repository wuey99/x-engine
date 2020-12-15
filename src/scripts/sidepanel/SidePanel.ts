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
	public m_realWorldName:string;
	public m_worldGravity:number;
	public m_worldMass:number;
	public m_score:number;

	public static WIDTH:number = 180.0 * 2;
	public static HEIGHT:number = 545.0 * 2;

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
		this.m_realWorldName = __params[1];
		this.m_worldGravity = __params[2];
		this.m_worldMass = __params[3];
		this.m_score = __params[4];

		SidePanel.WIDTH = this.m_XApp.getScreenWidth () * 360 / this.m_XApp.getScreenWidth ();
		SidePanel.HEIGHT = this.m_XApp.getScreenHeight ();
		
		this.createObjects ();

		this.propagateCount = 4;

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,
				
				() => {
					this.m_forceGauge.update ();
				},

			XTask.GOTO, "loop",

			XTask.RETN,
		]);

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
	public setScore (__score:number):void {
		this.m_scoreBox.setScore (__score);
	}

//------------------------------------------------------------------------------------------
	public updateLabels ():void {
		this.m_forceGauge.updateLabel ();
		this.m_mass.updateLabel ();
		this.m_scoreBox.updateLabel ();
		this.m_planet.updateLabel ();
	}

//------------------------------------------------------------------------------------------
	public createObjects ():void {
		var __graphics:PIXI.Graphics = new PIXI.Graphics ();
		__graphics.beginFill (0x000000);
		__graphics.drawRect (0, 0, SidePanel.WIDTH, SidePanel.HEIGHT);
		__graphics.endFill ();
		this.addSortableChild (__graphics, this.getLayer (),this.getDepth ());

		var __x:number = 165;
		var __y:number = 150;

		this.m_scoreBox = this.addGameObjectAsChild (SidePanel_ScoreBox, this.getLayer (), this.getDepth () + 1.0, false) as SidePanel_ScoreBox;
		this.m_scoreBox.afterSetup ([this.m_worldName, this.m_score]);
		this.m_scoreBox.x = __x;
		this.m_scoreBox.y = __y;

		__y += 180;

		this.m_mass = this.addGameObjectAsChild (SidePanel_Mass, this.getLayer (), this.getDepth () + 1.0, false) as SidePanel_Mass;
		this.m_mass.afterSetup ([this.m_worldName, this.m_worldMass]);
		this.m_mass.x = __x;
		this.m_mass.y = __y;

		__y += 260;	

		this.m_planet = this.addGameObjectAsChild (SidePanel_Planet, this.getLayer (), this.getDepth () + 1.0, false) as SidePanel_Planet;
		this.m_planet.afterSetup ([this.m_worldName, this.m_realWorldName, this.m_worldGravity]);
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