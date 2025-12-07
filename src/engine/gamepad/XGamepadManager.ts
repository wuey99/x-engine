//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "X-Engine"
//
// Copyright (c) 2014-2021 Jimmy Huey (wuey99@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// <$end$/>
//------------------------------------------------------------------------------------------
import { XApp } from "../app/XApp";
import { XProcess } from "../process/XProcess";
import { XType } from "../type/XType";
import { XGamepad } from "./XGamepad";
import { XGamepadButton } from "./XGamepad";
import { XGamepadAxis } from "./XGamepad";
import { XGamepadController } from "./XGamepadController";

//------------------------------------------------------------------------------------------
export class XGamepadManager {
    m_XApp:XApp;m_controlllerToGamepad
    m_connectedGamepads: Map<number, XGamepad>;
    m_scanGamepadsProcess: XProcess;
    m_controllerToGamepad: Map<XGamepadController, XGamepad>;
    m_gamepadToController: Map<XGamepad, XGamepadController>;

//------------------------------------------------------------------------------------------	
	constructor () {
	}

//------------------------------------------------------------------------------------------
    public setup (__XApp:XApp):void {
        this.m_XApp = __XApp;

        window.addEventListener ("gamepadconnected", this.onGamepadConnected.bind (this));
        window.addEventListener ("gamepaddisconnected", this.onGamepadDisconnected.bind (this));

        this.m_connectedGamepads = new Map<number, XGamepad> ();
        this.m_controllerToGamepad = new Map<XGamepadController, XGamepad> ();
        this.m_gamepadToController = new Map<XGamepad, XGamepadController> ();

        this.process ();
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        this.m_XApp.getXProcessManager ().removeProcess (this.m_scanGamepadsProcess);
        
        window.removeEventListener ("gamepadconnected", this.onGamepadConnected);
        window.removeEventListener ("gamepaddisconnected", this.onGamepadDisconnected);
    }

//------------------------------------------------------------------------------------------
    onGamepadConnected (event:GamepadEvent):void {
        this.addGamepad (event.gamepad);
    }

//------------------------------------------------------------------------------------------
    onGamepadDisconnected (event:GamepadEvent):void {
        this.removeGamepad (event.gamepad);
    }

//------------------------------------------------------------------------------------------
    addGamepad (__gamepad:Gamepad):void {
        let __gamepadX:XGamepad

        if (!this.m_connectedGamepads.has (__gamepad.index)) {
             __gamepadX = new XGamepad ();
            __gamepadX.setup (__gamepad);

            this.m_connectedGamepads.set (__gamepad.index, __gamepadX);
            this.m_gamepadToController.set (__gamepadX, null);
        } else {
            __gamepadX = this.m_connectedGamepads.get (__gamepad.index);
            __gamepadX.gamepad = __gamepad;
        }
    }

//------------------------------------------------------------------------------------------
    removeGamepad (__gamepad:Gamepad):void {
        if (this.m_connectedGamepads.has (__gamepad.index)) {
            let __gamepadX:XGamepad = this.m_connectedGamepads.get (__gamepad.index);
            __gamepadX.cleanup ();

            this.m_connectedGamepads.delete (__gamepad.index);
            this.m_gamepadToController.delete (__gamepadX);
        }
    }

//------------------------------------------------------------------------------------------
    processGamepads ():void {
        XType.forEach (this.m_connectedGamepads,
            (__index:number) => {
                let __gamepadX: XGamepad = this.m_connectedGamepads.get (__index);

                let __changes = __gamepadX.process ();

                if (__changes.buttonsDown.length > 0 || __changes.buttonsUp.length > 0 || __changes.axisValuesChanged.length > 0) {
                    console.log (": changes: ", __changes);
                }
            }
        )
    }

//------------------------------------------------------------------------------------------
    addController (__controller:XGamepadController):void {
        this.m_controllerToGamepad.set (__controller, null);
    }

//------------------------------------------------------------------------------------------
    removeController (__controller:XGamepadController):void {
        this.m_controllerToGamepad.delete (__controller);
    }

//------------------------------------------------------------------------------------------
    bindControllers ():void {
        XType.forEach (this.m_controllerToGamepad,
            (__controller:XGamepadController) => {
                let __gamepadX:XGamepad = this.m_controllerToGamepad.get (__controller);
                if (__gamepadX == null) {
                    let __foundGamepadX:XGamepad = null;
                    for (let __gamepadX of this.m_gamepadToController.keys ()) {
                        if (!__foundGamepadX && this.m_gamepadToController.get (__gamepadX) == null) {
                            this.m_gamepadToController.set (__gamepadX, __controller);
                            __foundGamepadX = __gamepadX;
                        }
                    }
                    if (__foundGamepadX) {
                        this.m_controllerToGamepad.set (__controller, __foundGamepadX);
                    }
                }
            }
        )
    }

//------------------------------------------------------------------------------------------
    process ():void {
        let ticks = 0;

        this.m_scanGamepadsProcess = this.m_XApp.getXProcessManager ().addProcess (
            function * (this) {
                while (true) {
                    yield [XProcess.WAIT, 0x0100];

                    ticks++;

                    if ((ticks & 127) == 0) {
                        // console.log (": scanGamepads: ", this.m_connectedGamepads);
                    }
 
                    for (const gamepad of navigator.getGamepads ()) {
                        if (gamepad) {
                            this.addGamepad (gamepad);
                        }
                    }

                    this.processGamepads ();

                    this.bindControllers ();
                }
            }.bind (this)
        );
    }
}