//------------------------------------------------------------------------------------------
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';
import { XProcessManager } from './XProcessManager';
import { XProcessSubManager } from './XProcessSubManager';
import { XObjectPoolManager } from '../pool/XObjectPoolManager';

//------------------------------------------------------------------------------------------
export class XProcess {
    private m_parent:any;
    private m_manager:XProcessManager;
	private m_ticks:number;
    private m_generator:any;
    private m_isDead:boolean;

    private m_XProcessSubManager:XProcessSubManager;
   
    public static readonly WAIT:number = 1;
    public static readonly WAIT1000:number = 2;

    public static g_XApp:XApp;

    //------------------------------------------------------------------------------------------
    constructor () { 
        this.m_XProcessSubManager = this.createXProcessSubManager ();
    }

	//------------------------------------------------------------------------------------------
	public setup (__generatorFunc:any):void {
        this.__reset (__generatorFunc);
	}

	//------------------------------------------------------------------------------------------
	private __reset (__generatorFunc:any):void {
        this.m_generator = __generatorFunc ();
		this.m_ticks = 0x0100 + 0x0080;
		this.m_isDead = false;
		this.m_parent = null;
	}

	//------------------------------------------------------------------------------------------
	public createXProcessSubManager ():XProcessSubManager {
		return new XProcessSubManager (null);
	}

    //------------------------------------------------------------------------------------------
	public setParent (__parent:any):void {
		this.m_parent = __parent;
	}

	//------------------------------------------------------------------------------------------
	public getManager ():XProcessManager {
		return this.m_manager;
	}
		
	//------------------------------------------------------------------------------------------
	public setManager (__manager:XProcessManager):void {
		this.m_manager = __manager;
			
		this.m_XProcessSubManager.setManager (__manager);
	}

	//------------------------------------------------------------------------------------------
	public static setXApp (__XApp:XApp):void {
		XProcess.g_XApp = __XApp;
	}
		
	//------------------------------------------------------------------------------------------
	public getXApp ():XApp {
	    return XProcess.g_XApp;
	}

	//------------------------------------------------------------------------------------------
	public kill ():void {
        this.m_generator.return ();

		this.removeAllProcesses ();
			
		this.m_isDead = true;
	}	

	//------------------------------------------------------------------------------------------
	// execute the XProcess
    //------------------------------------------------------------------------------------------
	public run ():void {
        if (this.m_isDead) {
            return;
        }

		// suspended?
		this.m_ticks -= 0x0100;

        while (this.m_ticks <= 0x0080) {
            var cont = this.m_generator.next ();

            if (!cont.done) {
                var value:Array<number> = cont.value as Array<number>;

                switch (value[0]) {
                    case XProcess.WAIT:
                        this.m_ticks += value[1] / this.getXApp ().getFrameRateScale ();

                        break;

                    case XProcess.WAIT1000:
                        this.m_ticks += Math.floor (value[1] / 16.67 / this.getXApp ().getFrameRateScale ()) << 8;

                        break;
                }            
            } else {
                this.m_isDead = true;

                return;
            }
        }
    }

	//------------------------------------------------------------------------------------------
	public gotoProcess (__generatorFunc:any):void {
		this.kill ();
			
		this.__reset (__generatorFunc);
			
		this.setManager (this.m_manager);
	}
		
	//------------------------------------------------------------------------------------------
	public addProcess (
        __generatorFunc:any
	):XProcess {
			
		return this.m_XProcessSubManager.addProcess (__generatorFunc);
	}
		
	//------------------------------------------------------------------------------------------
	public changeProcess (
		__process:XProcess,
        __generatorFunc:any
	):XProcess {

		return this.m_XProcessSubManager.changeProcess (__process, __generatorFunc);
	}
		
	//------------------------------------------------------------------------------------------
	public isProcess (__process:XProcess):boolean {
		return this.m_XProcessSubManager.isProcess (__process);
	}		
		
	//------------------------------------------------------------------------------------------
	public removeProcess (__process:XProcess):void {
		this.m_XProcessSubManager.removeProcess (__process);	
	}
		
	//------------------------------------------------------------------------------------------
	public removeAllProcesses ():void {
		this.m_XProcessSubManager.removeAllProcesses ();
	}
		
	//------------------------------------------------------------------------------------------
	public addEmptyProcess ():XProcess {
		return this.m_XProcessSubManager.addEmptyProcess ();
	}
}