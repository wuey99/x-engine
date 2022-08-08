//------------------------------------------------------------------------------------------
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';
import { XProcessManager } from './XProcessManager';
import { XProcessSubManager } from './XProcessSubManager';
import { XObjectPoolManager } from '../pool/XObjectPoolManager';

//------------------------------------------------------------------------------------------
export class XProcess {
    private m_id:string;
    private m_parent:any;
    private m_manager:XProcessManager;
	private m_ticks:number;
    private m_generator:any;
    private m_isDead:boolean;
    private m_subProcess:XProcess;

    private m_XProcessSubManager:XProcessSubManager;
   
    public static readonly WAIT:number = 1;
    public static readonly WAIT1000:number = 2;
    public static readonly EXEC:number = 3;

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
        this.m_subProcess = null;
        this.m_id = "";
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
    public setID (__id:string):void {
        this.m_id = __id;
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

        if (this.m_subProcess != null) {
            if (this.m_XProcessSubManager.isProcess (this.m_subProcess)) {
                return;
            } else {
                this.m_subProcess = null;
            }
        }

    	this.m_ticks -= 0x0100;

        while (this.m_ticks <= 0x0080) {
            var cont = this.m_generator.next ();

            if (!cont.done) {
                var value:Array<any> = cont.value as Array<any>;

                switch (value[0]) {
                    case XProcess.WAIT:
                        this.m_ticks += (value[1] as number) / this.getXApp ().getFrameRateScale ();

                        break;

                    case XProcess.WAIT1000:
                        this.m_ticks += Math.floor ((value[1] as number) / 16.67 / this.getXApp ().getFrameRateScale ()) << 8;

                        break;

                    case XProcess.EXEC:
                        this.m_subProcess = this.addProcess (value[1]);
                        this.m_subProcess.setManager (this.m_manager);
                        this.m_subProcess.setParent (this);
                        this.m_subProcess.run ();
                        
                        if (this.m_XProcessSubManager.isProcess (this.m_subProcess)) {
                            return;
                        }

                        break;
                }            
            } else {
                if (this.m_parent != null && this.m_parent != this.m_manager) {
                    this.m_parent.removeProcess (this);
                } else {
                    this.m_manager.removeProcess (this);
                }

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