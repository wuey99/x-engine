//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XDepthSprite} from '../sprite/XDepthSprite';
import { XType } from '../type/Xtype';
import { XGameObject} from '../gameobject/XGameObject';
import { ForceVectorArrow } from './ForceVectorArrow';
import { TerrainContainer } from '../terrain/TerrainContainer';
import { XPoint } from '../geom/XPoint';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class ForceVector extends XGameObject {
    public m_topArrow:ForceVectorArrow;
    public m_bottomArrow:ForceVectorArrow;

    public m_terrainContainer:TerrainContainer;

    public script:XTask;

    public m_firedSignal:XSignal;

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

        this.m_terrainContainer = __params[0];

        this.script = this.addEmptyTask ();

        this.Idle_Script ();

        this.m_topArrow = this.addGameObjectToWorld (ForceVectorArrow, 0, 0.0) as ForceVectorArrow;
        this.m_topArrow.afterSetup (["TopArrow"]);

        this.m_bottomArrow = this.addGameObjectToWorld (ForceVectorArrow, 0, 0.0) as ForceVectorArrow;
        this.m_bottomArrow.afterSetup (["BottomArrow"]);

        this.m_XApp.getStage ().on ("mouseup", this.onMouseUp.bind (this));
        this.m_XApp.getStage ().on ("mouseout", this.onMouseOut.bind (this));

        this.m_firedSignal = this.createXSignal ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public onMouseUp (e:PIXI.InteractionEvent) {
        this.m_XApp.getStage ().off ("mouseup", this.onMouseUp);
        this.m_XApp.getStage ().off ("mouseout", this.onMouseUp);

        console.log (": ForceVector: mouseUp: ");

        var __point:XPoint = this.m_terrainContainer.getMousePos ();

        var __dx:number = (this.x - __point.x) / 2048;
        var __dy:number = (this.y - __point.y) / 2048;

        this.m_firedSignal.fireSignal (__dx, __dy);

        this.nuke ();

        this.m_XApp.getXTaskManager ().addTask ([
            XTask.WAIT, 0x0100,
            
            () => {
                this.m_terrainContainer.clearGraphics ();
            },

            XTask.RETN,
        ]);
    }

//------------------------------------------------------------------------------------------
    public onMouseOut (e:PIXI.InteractionEvent) {
        this.m_XApp.getStage ().off ("mouseup", this.onMouseUp);
        this.m_XApp.getStage ().off ("mouseout", this.onMouseUp);

        console.log (": ForceVector: mouseOut: ");

        this.nuke ();

        this.m_XApp.getXTaskManager ().addTask ([
            XTask.WAIT, 0x0100,
            
            () => {
                this.m_terrainContainer.clearGraphics ();
            },

            XTask.RETN,
        ]);
    }

//------------------------------------------------------------------------------------------
    public addFiredListener (__listener:any):number {
        return this.m_firedSignal.addListener (__listener);
    }

	//------------------------------------------------------------------------------------------
	public Idle_Script ():void {

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
                        
                        () => {   
                            var __point:XPoint = this.m_terrainContainer.getMousePos ();

                            var __dx:number = (this.x - __point.x);
                            var __dy:number = (this.y - __point.y);

                            this.m_topArrow.x = this.x + __dx;
                            this.m_topArrow.y = this.y + __dy;
                            this.m_topArrow.angle = Math.atan2 (__dy, __dx) * 180/Math.PI + 90.0;

                            this.m_bottomArrow.x = this.x;
                            this.m_bottomArrow.y = this.y;
                            this.m_bottomArrow.angle = Math.atan2 (__dy, __dx) * 180/Math.PI + 90.0;

                            this.m_terrainContainer.clearGraphics ();
                            this.m_terrainContainer.drawForceVector (0x16AFFF, this.x, this.y, __point.x, __point.y);
                            this.m_terrainContainer.drawForceVector (0xFC1614, this.x, this.y, this.x + __dx, this.y + __dy);
                        },

					XTask.GOTO, "loop",
						
					XTask.RETN,
				]);	
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
    }

//------------------------------------------------------------------------------------------
}