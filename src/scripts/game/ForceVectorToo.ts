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
import { ForceVectorArrowToo } from './ForceVectorArrowToo';
import { TerrainContainer } from '../terrain/TerrainContainer';
import { XPoint } from '../../engine/geom/XPoint';
import { G } from '../../engine/app/G';
import { InteractiveLayer } from '../terrain/InteractiveLayer';
import { GameInteractiveLayer } from './GameInteractiveLayer';

//------------------------------------------------------------------------------------------
export class ForceVectorToo extends XGameObject {
    public m_topArrow:ForceVectorArrowToo;
    public m_bottomArrow:ForceVectorArrowToo;

    public m_interactiveLayer:InteractiveLayer;

    public script:XTask;

    public m_updateSignal:XSignal;
    public m_firedSignal:XSignal;

    public m_mouseMoveHandle:any;
    public m_mouseUpHandle:any;
    public m_mouseOutHandle:any;

    public m_touchMoveHandle:any;
    public m_touchEndHandle:any;
    
    public m_currentPoint:XPoint;

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

        this.m_interactiveLayer = __params[0];

        this.script = this.addEmptyTask ();

        this.Idle_Script ();

        this.m_topArrow = this.addGameObjectAsChild (ForceVectorArrowToo, this.getLayer (), this.getDepth ()) as ForceVectorArrowToo;
        this.m_topArrow.afterSetup (["TopArrow"]);

        this.m_bottomArrow = this.addGameObjectAsChild (ForceVectorArrowToo, this.getLayer (), this.getDepth ()) as ForceVectorArrowToo;
        this.m_bottomArrow.afterSetup (["BottomArrow"]);

        this.m_currentPoint = new XPoint ();

        this.m_mouseMoveHandle = this.addStageEventListenerX ("pointermove", this.onMouseMove.bind (this));
        this.m_mouseUpHandle = this.addStageEventListenerX ("pointerup", this.onMouseUp.bind (this));
        this.m_mouseOutHandle = this.addStageEventListenerX ("pointerout", this.onMouseOut.bind (this));

        // this.m_touchMoveHandle = this.addStageEventListenerX ("touchmove", this.onTouchMove.bind (this));
        // this.m_touchEndHandle = this.addStageEventListenerX ("touchend", this.onTouchUp.bind (this));

        this.m_updateSignal = this.createXSignal ();
        this.m_firedSignal = this.createXSignal ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
  
//------------------------------------------------------------------------------------------
    public onMouseMove (e:PIXI.InteractionEvent) {
        var __point:XPoint = this.m_interactiveLayer.getMousePos ();

        var __dx:number = (this.x - __point.x) / 2;
        var __dy:number = (this.y - __point.y) / 2;

        this.m_currentPoint.x = __point.x;
        this.m_currentPoint.y = __point.y;

        this.m_updateSignal.fireSignal (Math.sqrt (__dx * __dx + __dy * __dy));
    }

//------------------------------------------------------------------------------------------
    public onTouchMove (e:PIXI.InteractionEvent) {
        // var __point:XPoint = this.m_interactiveLayer.getTouchPos ();

        var __interactionData:PIXI.InteractionData = e.data;
        var __originalEvent:any = __interactionData.originalEvent;
        var __touches:any = __originalEvent.touches;
        var pt = new PIXI.Point(__touches[0].clientX, __touches[0].clientY);
        var __point:PIXI.Point = e.data.getLocalPosition (this.m_XApp.getStage (), pt);

        var __dx:number = (this.x - __point.x) / 2;
        var __dy:number = (this.y - __point.y) / 2;

        this.m_currentPoint.x = __point.x;
        this.m_currentPoint.y = __point.y;

        this.m_updateSignal.fireSignal (Math.sqrt (__dx * __dx + __dy * __dy));
    }

//------------------------------------------------------------------------------------------
    public onMouseUp (e:PIXI.InteractionEvent) {
        this.removeStageEventListenerX (this.m_mouseMoveHandle);
        this.removeStageEventListenerX (this.m_mouseUpHandle);
        this.removeStageEventListenerX (this.m_mouseOutHandle);

        console.log (": ForceVector: mouseUp: ");

        var __point:XPoint = this.m_interactiveLayer.getMousePos ();

        var __dx:number = (this.x - __point.x);
        var __dy:number = (this.y - __point.y);

        this.m_firedSignal.fireSignal (__dx, __dy);

        this.nuke ();

        this.m_XApp.getXTaskManager ().addTask ([
            XTask.WAIT, 0x0100,
            
            () => {
                this.m_interactiveLayer.clearGraphics ();
            },

            XTask.RETN,
        ]);
    }

//------------------------------------------------------------------------------------------
    public onTouchUp (e:PIXI.InteractionEvent) {
        this.removeStageEventListenerX (this.m_touchMoveHandle);
        this.removeStageEventListenerX (this.m_touchEndHandle);

        console.log (": ForceVector: mouseUp: ");

        var __point:XPoint = this.m_interactiveLayer.getTouchPos ();

        var __dx:number = (this.x - __point.x);
        var __dy:number = (this.y - __point.y);

        this.m_firedSignal.fireSignal (__dx, __dy);

        this.nuke ();

        this.m_XApp.getXTaskManager ().addTask ([
            XTask.WAIT, 0x0100,
            
            () => {
                this.m_interactiveLayer.clearGraphics ();
            },

            XTask.RETN,
        ]);
    }

//------------------------------------------------------------------------------------------
    public onMouseOut (e:PIXI.InteractionEvent) {
        this.removeStageEventListenerX (this.m_mouseMoveHandle);
        this.removeStageEventListenerX (this.m_mouseUpHandle);
        this.removeStageEventListenerX (this.m_mouseOutHandle);

        console.log (": ForceVector: mouseOut: ");

        this.nuke ();

        this.m_XApp.getXTaskManager ().addTask ([
            XTask.WAIT, 0x0100,
            
            () => {
                this.m_interactiveLayer.clearGraphics ();
            },

            XTask.RETN,
        ]);
    }

//------------------------------------------------------------------------------------------
    public addUpdateListener (__listener:any):number {
        return this.m_updateSignal.addListener (__listener);
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
                           var __point:XPoint = this.m_currentPoint; //this.m_interactiveLayer.getMousePos ();
                            
                           if (__point.x == 0 && __point.y == 0) {
                                return;
                           }

                           var __dx:number = (this.x - __point.x);
                           var __dy:number = (this.y - __point.y);

                           this.m_topArrow.x = __dx;
                           this.m_topArrow.y = __dy;
                           this.m_topArrow.angle = Math.atan2 (__dy, __dx) * 180/Math.PI + 90.0;

                           this.m_bottomArrow.x = 0;
                           this.m_bottomArrow.y = 0;
                           this.m_bottomArrow.angle = Math.atan2 (__dy, __dx) * 180/Math.PI + 90.0;

                           this.m_interactiveLayer.clearGraphics ();
                           this.m_interactiveLayer.drawForceVectorDashed (
                               0x16AFFF, 0x16AFFF,
                               __point.x, __point.y, this.x, this.y,
                               24 / GameInteractiveLayer.RES_DIVISOR, 24 / GameInteractiveLayer.RES_DIVISOR,
                               6.0 / GameInteractiveLayer.RES_DIVISOR
                            );
                           this.m_interactiveLayer.drawForceVectorDashed (
                               0xFFFF00, 0xFC1614,
                               this.x, this.y, this.x + __dx, this.y + __dy,
                               24 / GameInteractiveLayer.RES_DIVISOR, 12 / GameInteractiveLayer.RES_DIVISOR,
                               6.0 / GameInteractiveLayer.RES_DIVISOR
                            );
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