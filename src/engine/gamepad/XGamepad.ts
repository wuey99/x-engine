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
import { XSignal } from "../signals/XSignal";
import { XGamepadController } from "./XGamepadController";

//------------------------------------------------------------------------------------------
export enum XGamepadButton {
    A,
    B,
    X,
    Y,
    LEFT_SHOULDER,
    RIGHT_SHOULDER,
    LEFT_TRIGGER,
    RIGHT_TRIGGER,
    SELECT,
    START,
    LEFT_STICK,
    RIGHT_STICK,
    DPAD_UP,
    DPAD_DOWN,
    DPAD_LEFT,
    DPAD_RIGHT,
    GUIDE
}

export enum XGamepadAxis {
    LEFT_X,
    LEFT_Y,
    RIGHT_X,
    RIGHT_Y
}

export interface XGamepadChanges {
    buttonsUp: Array<XGamepadButton>
    buttonsDown: Array<XGamepadButton>
    axisValuesChanged: Array<XGamepadAxis>
};

//------------------------------------------------------------------------------------------
export class XGamepad {
    m_gamepad: Gamepad;
    m_controller: XGamepadController;

    m_isTwinShock: boolean;
    m_isXInput: boolean;

    m_nativeButtonMap: {};
    m_nativeAxisMap: {};

    m_buttonsPressed:Map<string, boolean>;
    m_axisValues:Map<string, number>;

//------------------------------------------------------------------------------------------	
	constructor () {
	}

//------------------------------------------------------------------------------------------	
    public setup (__gamepad:any): void {
        this.m_gamepad = __gamepad;

        this.m_isTwinShock = false
        this.m_isXInput = false

        if (__gamepad.id.search ('0079') >= 0 && __gamepad.id.search ('0006')) {
            this.m_isTwinShock = true
        }

        if (__gamepad.id.search ('XInput') >= 0) {
            this.m_isXInput = true
        }

        this.m_nativeButtonMap = {
            0: XGamepadButton.A,
            1: XGamepadButton.B,
            2: XGamepadButton.X,
            3: XGamepadButton.Y,
            4: XGamepadButton.LEFT_SHOULDER,
            5: XGamepadButton.RIGHT_SHOULDER,
            6: XGamepadButton.LEFT_TRIGGER,
            7: XGamepadButton.RIGHT_TRIGGER,
            8: XGamepadButton.SELECT,
            9: XGamepadButton.START,
            10: XGamepadButton.LEFT_STICK,
            11: XGamepadButton.RIGHT_STICK,
            12: XGamepadButton.DPAD_UP,
            13: XGamepadButton.DPAD_DOWN,
            14: XGamepadButton.DPAD_LEFT,
            15: XGamepadButton.DPAD_RIGHT,
            16: XGamepadButton.GUIDE
        };

        const mapping_XInput = {
            0: XGamepadAxis.LEFT_X,
            1: XGamepadAxis.LEFT_Y,
            2: XGamepadAxis.RIGHT_X,
            3: XGamepadAxis.RIGHT_Y
        }

        const mapping_twinShock = {
            0: XGamepadAxis.LEFT_X,
            1: XGamepadAxis.LEFT_Y,
            2: XGamepadAxis.RIGHT_X,
            5: XGamepadAxis.RIGHT_Y
        }

        if (this.m_isXInput) {
            this.m_nativeAxisMap = mapping_XInput;
        } else if (this.m_isTwinShock) {
            this.m_nativeAxisMap = mapping_twinShock;
        } else {
            this.m_nativeAxisMap = mapping_XInput;
        }

        this.m_buttonsPressed = new Map<string, boolean> ();
        this.m_axisValues = new Map<string, number> ();

        for (let i = 0; i < this.m_gamepad.buttons.length; i++) {
            const key = this.m_nativeButtonMap[i];
            this.m_buttonsPressed.set (key, this.m_gamepad.buttons[i].pressed);
        }

        for (let i = 0; i < this.m_gamepad.axes.length; i++) {
            if (this.m_nativeAxisMap[i] != undefined) {
                 const key = this.m_nativeAxisMap[i];
                this.m_axisValues.set (key, this.m_gamepad.axes[i]);
            }
        }
    }

//------------------------------------------------------------------------------------------	
    public cleanup ():void {
    }

//------------------------------------------------------------------------------------------	
    public process ():XGamepadChanges {
        let __changes:XGamepadChanges = {
            buttonsUp: [],
            buttonsDown: [],
            axisValuesChanged: []

        };

        for (let i = 0; i < this.m_gamepad.buttons.length; i++) {
            const key = this.m_nativeButtonMap[i];

            let prevPressed = this.m_buttonsPressed.get (key);

            if (prevPressed != this.m_gamepad.buttons[i].pressed) {
                this.m_buttonsPressed.set (key, this.m_gamepad.buttons[i].pressed);

                if (!prevPressed) {
                    __changes.buttonsDown.push (key);
                } else {
                    __changes.buttonsUp.push (key);
                }
            }
        }

        for (let i = 0; i < this.m_gamepad.axes.length; i++) {
            if (this.m_nativeAxisMap[i] != undefined) {
                 const key = this.m_nativeAxisMap[i];

                 let prevValue = this.m_axisValues.get (key);

                 if (prevValue != this.m_gamepad.axes[i]) {
                    this.m_axisValues.set (key, this.m_gamepad.axes[i]);

                    __changes.axisValuesChanged.push (key)
                 }
            }
        }

        return __changes;
    }

//------------------------------------------------------------------------------------------	
    public get gamepad ():any {
        return this.m_gamepad;
    }

//------------------------------------------------------------------------------------------	
    public set gamepad (__gamepad: Gamepad) {
        this.m_gamepad = __gamepad;
    }

//------------------------------------------------------------------------------------------	
    public get controller ():XGamepadController {
        return this.m_controller;
    }

//------------------------------------------------------------------------------------------	
    public set controller (__controller) {
        this.m_controller = __controller;
    }
}