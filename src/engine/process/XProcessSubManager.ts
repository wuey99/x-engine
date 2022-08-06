//------------------------------------------------------------------------------------------
    import { XProcess } from './XProcess';
    import { XProcessManager} from './XProcessManager';
    import { XObjectPoolManager } from '../pool/XObjectPoolManager';
    
//------------------------------------------------------------------------------------------	
	export class XProcessSubManager {
		public m_manager:XProcessManager;
		
		private m_XProcesses:Map<XProcess, number>; 
		
//------------------------------------------------------------------------------------------
		constructor (__manager:XProcessManager) {
			this.m_manager = __manager;
			
			this.m_XProcesses = new Map<XProcess, number> (); 
		}

//------------------------------------------------------------------------------------------
		public setup ():void {
		}	
		
//------------------------------------------------------------------------------------------
		public cleanup ():void {
			this.removeAllProcesses ();
		}

//------------------------------------------------------------------------------------------
		public getManager ():XProcessManager {
			return this.m_manager;
		}
				
//------------------------------------------------------------------------------------------
		public setManager (__manager:XProcessManager):void {
			this.m_manager = __manager;
		}
		
//------------------------------------------------------------------------------------------
		public addProcess (
			__generatorFunc:any
			):XProcess {
				
			var __process:XProcess = this.m_manager.addProcess (__generatorFunc);
			
			if (!(this.m_XProcesses.has (__process))) {
				this.m_XProcesses.set (__process, 0);
			}
			
			return __process;
		}
		
//------------------------------------------------------------------------------------------
		public addXProcess (__process:XProcess):XProcess {
			var __process:XProcess = this.m_manager.addXProcess (__process);
			
			if (!this.m_XProcesses.has (__process)) {
				this.m_XProcesses.set (__process, 0);
			}
			
			return __process;			
		}
		
//------------------------------------------------------------------------------------------
		public changeProcess (
			__oldProcess:XProcess,
			__generatorFunc:any
			):XProcess {
				
			if (!(__oldProcess == null)) {
				this.removeProcess (__oldProcess);
			}
					
			return this.addProcess (__generatorFunc);
		}

//------------------------------------------------------------------------------------------
		public changeXProcess (
			__oldProcess:XProcess,
			__newProcess:XProcess
			):XProcess {
				
			if (!(__oldProcess == null)) {
				this.removeProcess (__oldProcess);
			}
					
			return this.addXProcess (__newProcess);
		}
		
//------------------------------------------------------------------------------------------
		public isProcess (__process:XProcess):boolean {
			return this.m_XProcesses.has (__process);
		}		

//------------------------------------------------------------------------------------------
		public removeProcess (__process:XProcess):void {	
			if (this.m_XProcesses.has (__process)) {
				this.m_XProcesses.delete (__process);
					
				this.m_manager.removeProcess (__process);
			}
		}

//------------------------------------------------------------------------------------------
		public removeAllProcesses ():void {	
            var __process:XProcess;

            for (__process of this.m_XProcesses.keys ()) {
				this.removeProcess (__process);
			}
		}

//------------------------------------------------------------------------------------------
		public addEmptyProcess ():XProcess {
			return this.addProcess (
				function* () {
					while (true) {
						yield [XProcess.WAIT, 0x0100];
					}
				}
			);
		}
			
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
