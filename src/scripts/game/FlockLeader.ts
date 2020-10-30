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
import { XType } from '../type/XType';
import { XGameObject} from '../gameobject/XGameObject';
import { EnemyX } from '../objects/EnemyX';
import { G } from '../app/G';
import { GUID } from '../utils/GUID';
import { FlockFollower } from './FlockFollower';

	//------------------------------------------------------------------------------------------
	export class FlockLeader extends EnemyX {
		public m_killedCount:number;
		public m_triggerID:number;
		public m_buggedOut:boolean;
		public m_flockID:string;
		
		// params
		public m_followerCount:number;
				
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
            
            this.createSprites ();

			// setCX ( -20, 20, -20, 20);
			
			this.angle = 0.0;
            
            this.m_followerCount = 256;

			// __setupItemParamsXML ();
			
			this.gravity = this.addEmptyTask ();
			this.script = this.addEmptyTask ();
			
			this.gravity.gotoTask (this.getPhysicsTaskX (0.25));

			this.m_flockID = GUID.create ();
			
			this.m_buggedOut = false;
			
            this.createObjects ();
				
            this.m_triggerID = G.appX.addTriggerXListener (this.onTriggerSignal);
            
            this.x = this.getScreenX (0.50);
            this.y = this.getScreenY (0.50);

            this.createFollowers ();
				
            this.Idle_Script ();

            return this;
		}
		
		//------------------------------------------------------------------------------------------
		public cleanup():void {
			 super.cleanup();
			 
			 G.appX.removeTriggerXListener (this.m_triggerID);
		}
		
		//------------------------------------------------------------------------------------------
		public onTriggerSignal (__trigger:string):void {
			this.m_buggedOut = true;
		}
		
		//------------------------------------------------------------------------------------------
		// create sprites
		//------------------------------------------------------------------------------------------
		public createSprites ():void {
            this.m_sprite = this.createAnimatedSprite ("OctopusBug");
            this.addSortableChild (this.m_sprite, 0, 0.0, false);
    
            this.hide ();    
		}

		//------------------------------------------------------------------------------------------
		public createObjects ():void {
		}
		
		//------------------------------------------------------------------------------------------
		public createFollowers ():void {
			this.m_killedCount = 0;
            
            var i:number;

			for (i = 0; i < this.m_followerCount; i++) {
				var __dx:number = Math.random () * 128 - 64;
				var __dy:number = Math.random () * 128 - 64;
				
				this.createFollower (__dx, __dy);
			}
		}
		
        //------------------------------------------------------------------------------------------
		public createFollower (__dx:number, __dy:number):void {
            var __followerObject:FlockFollower = world.addGameObject (FlockFollower, 0, 0.0, false) as FlockFollower;
            __followerObject.afterSetup ([this, 3, this.m_flockID]);

            __followerObject.x = this.x + __dx;
            __followerObject.y = this.y + __dy;

			__followerObject.addKillListener (():void => {
				this.m_killedCount++;
				
				if (this.m_killedCount == this.m_followerCount) {
					this.nuke ();
				}
			});
		}

		//------------------------------------------------------------------------------------------
		public followerClass ():any {
			return null;
		}
        
		//------------------------------------------------------------------------------------------
		public getPhysicsTaskX (DECCEL:number):Array<any> {
			return [
				XTask.LABEL, "loop",
                    XTask.WAIT, 0x0100,
                    
                    () => this.updatePhysics (),
                    	
					XTask.GOTO, "loop",
				
				XTask.RETN,
			];
        }
        
		//------------------------------------------------------------------------------------------
		public updatePhysics ():void {			
		}
		
		//------------------------------------------------------------------------------------------
		public Idle_Script ():void {
			var __targetX:number = this.getScreenX (Math.random ());
			var __targetY:number = this.getScreenY (Math.random ());
            
           this.startSplineMovement (this.x, this.y, __targetX, __targetY, this.getScreenX (Math.random ()), this.getScreenY (Math.random ()), 0x8000);
			
           this.script.gotoTask ([
				
				//------------------------------------------------------------------------------------------
				// control
				//------------------------------------------------------------------------------------------
				() => {
					this.script.addTask ([				
						XTask.WAIT, 0x8000,
						
						() => {
							if (this.m_buggedOut) {
								this.BuggedOut_Script ();
							} else {
								this.Idle_Script ();
							}
						},
						
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
		public BuggedOut_Script ():void {
			this.x = this.getScreenX (0.50);
			this.y = this.getScreenY (1.50);
			
			this.script.gotoTask ([
				
				//------------------------------------------------------------------------------------------
				// control
				//------------------------------------------------------------------------------------------
				() => {
					this.script.addTask ([		
							XTask.WAIT1000, 4 * 1000,
							
							() => {
								G.appX.fireTriggerXSignal (this.m_flockID);				
							},
						
						XTask.LABEL, "loop",
							XTask.WAIT, 0x0100,
							
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
	
//------------------------------------------------------------------------------------------
// }