//------------------------------------------------------------------------------------------
    import { XApp } from '../app/XApp';
    import { XProcess } from './XProcess';
    import { XObjectPoolManager } from '../pool/XObjectPoolManager';

//------------------------------------------------------------------------------------------	
	export class XProcessManager {
		private m_XProcesses:Map<XProcess, number>;
		private m_paused:number;
		private m_XApp:XApp;
		private m_poolManager:XObjectPoolManager;
		
//------------------------------------------------------------------------------------------
		constructor (__XApp:XApp) {
			this.m_XApp = __XApp;
			
			this.m_XProcesses = new Map<XProcess, number> ();
			
			this.m_paused = 0;
			
			this.m_poolManager = this.createPoolManager ();
		}
		
//------------------------------------------------------------------------------------------	
		public cleanup ():void {
			this.m_poolManager.returnAllObjects ();
			
			this.m_poolManager = null;
		}
		
//------------------------------------------------------------------------------------------	
		public createPoolManager ():XObjectPoolManager {
			return new XObjectPoolManager (
				():any => {
					return new XProcess ();
				},
					
				(__src:any, __dst:any):any => {
					return null;
				},
					
				8192, 256,
					
				(x:any):void => {
				}
			);
        }

//------------------------------------------------------------------------------------------
		public getXApp ():XApp {
			return this.m_XApp;
		}
		
//------------------------------------------------------------------------------------------
		public pause ():void {
			this.m_paused++;
		}
		
//------------------------------------------------------------------------------------------
		public unpause ():void {
			this.m_paused--;
		}

//------------------------------------------------------------------------------------------
		public isProcess (__process:XProcess):boolean {
			return this.m_XProcesses.has (__process);
		}	

//------------------------------------------------------------------------------------------
		public getProcesses ():Map<XProcess, number> {
			return this.m_XProcesses;
		}

//------------------------------------------------------------------------------------------
		public removeAllProcesses ():void {
            var __process:XProcess;

            for (__process of this.m_XProcesses.keys ()) {
                this.removeProcess (__process);
			}
		}		
		
//------------------------------------------------------------------------------------------
		public addProcess (__generatorFunc:any):XProcess {
            var __process:XProcess = this.m_poolManager.borrowObject () as XProcess;
			__process.setup (__generatorFunc);
			
			__process.setManager (this);
			__process.setParent (this);
			
			this.m_XProcesses.set (__process, 0);
			
			return __process;
		}

//------------------------------------------------------------------------------------------
		public addXProcess (__process:XProcess):XProcess {
			__process.setManager (this);
			__process.setParent (this);
			
			this.m_XProcesses.set (__process, 0);
			
			return __process;
		}
		
//------------------------------------------------------------------------------------------
		public removeProcess (__process:XProcess):void {
			if (this.m_XProcesses.has (__process)) {
				__process.kill ();
				
				this.m_poolManager.returnObject (__process);
				
				this.m_XProcesses.delete (__process);
			}
		}
		
//------------------------------------------------------------------------------------------
		public updateProcesses ():void {	
			if (this.m_paused > 0) {
				return;
			}

            var __process:XProcess;

            for (__process of this.m_XProcesses.keys ()) {
				__process.run ();
			}
		}

//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
