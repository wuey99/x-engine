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

//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSignal } from '../../engine/signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine/task/XTaskSubManager';
import { XWorld} from '../../engine/sprite/XWorld';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { GUID } from '../../engine/utils/GUID';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { XButton } from '../../engine/ui/XButton';
import { XSpriteButton } from '../../engine/ui/XSpriteButton';
import { XTextButton } from '../../engine/ui/XTextButton';
import { XTextSpriteButton } from '../../engine/ui/XTextSpriteButton';
import { XTextGameObject } from '../../engine/ui/XTextGameObject';
import { XTextSprite } from '../../engine/sprite/XTextSprite';
import { Box } from '../ui/Box';
import { HBox } from '../ui/HBox';
import { VBox } from '../../engine/ui/VBox';
import { XJustify } from '../ui/XJustify';
import { Spacer } from '../ui/Spacer';
import { XType } from '../../engine/type/XType';
import { G } from '../../engine/app/G';
import { XMLAnimatedSprite } from './XMLAnimatedSprite';
import { XMLSprite } from './XMLSprite';
import { XImageButton } from './XImageButton';

//------------------------------------------------------------------------------------------
export class XMLBox extends Box {
	public script:XTask;

	public m_xml:XSimpleXMLNode;

	public static VBox:string = "VBox";
	public static SortedVBox:string = "SortedVBox";
	public static HBox:string = "HBox";
	public static SpriteButton:string = "SpriteButton";
	public static TextSpriteButton:string = "TextSpriteButton";
	public static TextButton:string = "TextButton";
	public static Spacer:string = "Spacer";
	public static AnimatedSprite:string = "AnimatedSprite";
	public static Sprite:string = "Sprite";
	public static Text:string = "Text";
	public static ImageButton:string = "ImageButton";

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

		this.m_xml = new XSimpleXMLNode ();
		this.m_xml.setupWithXMLString (__params[this.m_paramIndex++]);

		this.parseXML (0, this, this.m_xml);

		return this;
	}

	//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
    }

	//------------------------------------------------------------------------------------------
	public getPercent (__value:string):number {
		if (__value.endsWith ("%")) {
			return XType.parseFloat (__value) / 100.0;
		}

		return -1;
	}

	//------------------------------------------------------------------------------------------
	public getXMLWidth (__box:Box, __xml:XSimpleXMLNode):number {
		if (__xml.hasAttribute ("width")) {
			var __value:string = __xml.getAttributeString ("width");
			if (__value.endsWith ("%")) {
				return __box.width * XType.parseFloat (__value) / 100.0;
			} else {
				return XType.parseFloat (__value);
			}
		} else {
			return 300;
		}
	}

	//------------------------------------------------------------------------------------------
	public getXMLHeight (__box:Box, __xml:XSimpleXMLNode):number {
		if (__xml.hasAttribute ("height")) {
			var __value:string = __xml.getAttributeString ("height");
			if (__value.endsWith ("%")) {
				return __box.height * XType.parseFloat (__value) / 100.0;
			} else {
				return XType.parseFloat (__value);
			}
		} else {
			return 150;
		}
	}

	//------------------------------------------------------------------------------------------
	public addItemToBox (__box:Box, __xml:XSimpleXMLNode, __gameObject:XGameObject):void {
		__box.addItem (
			__gameObject,
			__xml.hasAttribute ("id") ? __xml.getAttributeString ("id") : "",
			__xml.hasAttribute ("group") ? __xml.getAttributeString ("group") : ""
		);

		if (__xml.hasAttribute ("x")) {
			var __x:number = this.getPercent (__xml.getAttributeString ("x"));

			if (__x < 0) {
				__gameObject.x = __xml.getAttributeFloat ("x");
			} else {
				__box.horizontalPercent (__gameObject, __x, __gameObject.getPivotX ());
			}	
		}

		if (__xml.hasAttribute ("y")) {
			var __y:number = this.getPercent (__xml.getAttributeString ("y"));

			if (__y < 0) {
				__gameObject.y = __xml.getAttributeFloat ("y");
			} else {
				__box.verticalPercent (__gameObject, __y, __gameObject.getPivotY ());
			}
		}
	}

	//------------------------------------------------------------------------------------------
	public addHBoxFromXML (__box:Box, __xml:XSimpleXMLNode):Box {
		var __hbox:HBox = __box.addGameObjectAsChild (HBox, __box.getBoxLayer (__xml), __box.getBoxDepth (__xml), false) as HBox;
		__hbox.afterSetup ([
			this.getXMLWidth (__box, __xml),
			this.getXMLHeight (__box, __xml),
			__xml.hasAttribute ("justify") ? __xml.getAttributeString ("justify") : XJustify.SPACE_BETWEEN,
			__xml.hasAttribute ("fill") ? __xml.getAttributeFloat ("fill") : -1
		]);

		this.addItemToBox (__box, __xml, __hbox);

		return __hbox;
	}

	//------------------------------------------------------------------------------------------
	public addVBoxFromXML (__box:Box, __xml:XSimpleXMLNode):Box {
		var __vbox:VBox = __box.addGameObjectAsChild (VBox, __box.getBoxLayer (__xml), __box.getBoxDepth (__xml), false) as VBox;
		__vbox.afterSetup ([
			this.getXMLWidth (__box, __xml),
			this.getXMLHeight (__box, __xml),
			__xml.hasAttribute ("justify") ? __xml.getAttributeString ("justify") : XJustify.SPACE_BETWEEN,
			__xml.hasAttribute ("fill") ? __xml.getAttributeFloat ("fill") : -1
		]);

		this.addItemToBox (__box, __xml, __vbox);

		return __vbox;
	}

	//------------------------------------------------------------------------------------------
	public addSpriteButtonFromXML (__box:Box, __xml:XSimpleXMLNode):void {
		var __button:XSpriteButton = __box.addGameObjectAsChild (
			XSpriteButton, __box.getBoxLayer (__xml), __box.getBoxDepth (__xml), false
		) as XSpriteButton;

		console.log (": addSpriteButtonFromXML: ", __xml.attributes ());

		__button.afterSetup ([
			__xml.hasAttribute ("buttonClassName") ? __xml.getAttributeString ("buttonClassName") : "StandardButton",
			__xml.hasAttribute ("9slice") ? __xml.getAttributeBoolean ("9slice") : false,
			__xml.hasAttribute ("9size") ? __xml.getAttributeFloat ("9size") : 0,
			__xml.hasAttribute ("9width") ? __xml.getAttributeFloat ("9width") : 0,
			__xml.hasAttribute ("9height") ? __xml.getAttributeFloat ("9height") : 0,
			__xml.hasAttribute ("pivotX") ? __xml.getAttributeFloat ("pivotX") : 0,
			__xml.hasAttribute ("pivotY") ? __xml.getAttributeFloat ("pivotY") : 0,
		]);

		__button.setTrigger (__xml.hasAttribute ("trigger") ? __xml.getAttributeString ("trigger") : "");
		
		this.addItemToBox (__box, __xml, __button);
	}

	//------------------------------------------------------------------------------------------
	public addImageButtonFromXML (__box:Box, __xml:XSimpleXMLNode):void {
		var __button:XImageButton = __box.addGameObjectAsChild (
			XImageButton, __box.getBoxLayer (__xml), __box.getBoxDepth (__xml), false
		) as XImageButton;

		console.log (": addImageButtonFromXML: ", __xml.attributes ());

		__button.afterSetup ([
			__xml.hasAttribute ("normalButtonName") ? __xml.getAttributeString ("normalButtonName") : "StandardButton",
			__xml.hasAttribute ("overButtonName") ? __xml.getAttributeString ("overButtonName") : "StandardButton",
			__xml.hasAttribute ("downButtonName") ? __xml.getAttributeString ("downButtonName") : "StandardButton",
			__xml.hasAttribute ("selectedButtonName") ? __xml.getAttributeString ("selectedButtonName") : "StandardButton",
			__xml.hasAttribute ("disabledButtonName") ? __xml.getAttributeString ("disabledButtonName") : "StandardButton",
			__xml.hasAttribute ("9slice") ? __xml.getAttributeBoolean ("9slice") : false,
			__xml.hasAttribute ("9size") ? __xml.getAttributeFloat ("9size") : 0,
			__xml.hasAttribute ("9width") ? __xml.getAttributeFloat ("9width") : 0,
			__xml.hasAttribute ("9height") ? __xml.getAttributeFloat ("9height") : 0,
			__xml.hasAttribute ("pivotX") ? __xml.getAttributeFloat ("pivotX") : 0,
			__xml.hasAttribute ("pivotY") ? __xml.getAttributeFloat ("pivotY") : 0,
		]);

		__button.setTrigger (__xml.hasAttribute ("trigger") ? __xml.getAttributeString ("trigger") : "");

		this.addItemToBox (__box, __xml, __button);
	}

	//------------------------------------------------------------------------------------------
	public addTextSpriteButtonFromXML (__box:Box, __xml:XSimpleXMLNode):void {
		var __button:XTextSpriteButton = __box.addGameObjectAsChild (
			XTextSpriteButton, __box.getBoxLayer (__xml), __box.getBoxDepth (__xml), false
		) as XTextSpriteButton;

		__button.afterSetup ([
			__xml.hasAttribute ("buttonClassName") ? __xml.getAttributeString ("buttonClassName") : "StandardButton",
			__xml.hasAttribute ("9slice") ? __xml.getAttributeBoolean ("9slice") : false,
			__xml.hasAttribute ("9size") ? __xml.getAttributeFloat ("9size") : 0,
			__xml.hasAttribute ("9width") ? __xml.getAttributeFloat ("9width") : 0,
			__xml.hasAttribute ("9height") ? __xml.getAttributeFloat ("9height") : 0,
			__xml.hasAttribute ("text") ? __xml.getAttribute ("text") : "",
			__xml.hasAttribute ("fontName") ? __xml.getAttribute ("fontName") : "Arial",
			__xml.hasAttribute ("fontSize") ? __xml.getAttributeFloat ("fontSize") : 20,
			__xml.hasAttribute ("colorNormal") ? __xml.getAttributeInt ("colorNormal") : 0x000000,
			__xml.hasAttribute ("colorOver") ? __xml.getAttributeInt ("colorOver") : 0x00ff00,
			__xml.hasAttribute ("colorDown") ? __xml.getAttributeInt ("colorDown") : 0x0000ff,
			__xml.hasAttribute ("colorSelected") ? __xml.getAttributeInt ("colorSelected") : 0xff0000,
			__xml.hasAttribute ("colorDisabled") ? __xml.getAttributeInt ("colorDisabled") : 0xc0c0c0,
			__xml.hasAttribute ("bold") ? __xml.getAttributeBoolean ("bold") : false,
			__xml.hasAttribute ("horizontalAlignment") ? __xml.getAttributeString ("horizontalAlignment") : "center",
			__xml.hasAttribute ("verticalAlignment") ? __xml.getAttributeString ("verticalAlignment") : "center",
		]);

		__button.setTrigger (__xml.hasAttribute ("trigger") ? __xml.getAttributeString ("trigger") : "");

		this.addItemToBox (__box, __xml, __button);
	}

	//------------------------------------------------------------------------------------------
	public addTextButtonFromXML (__box:Box, __xml:XSimpleXMLNode):void {
		var __button:XTextButton = __box.addGameObjectAsChild (
			XTextButton, __box.getBoxLayer (__xml), __box.getBoxDepth (__xml), false
		) as XTextButton;

		__button.afterSetup ([
			__xml.hasAttribute ("width") ? __xml.getAttributeFloat ("width") : 250,
			__xml.hasAttribute ("height") ? __xml.getAttributeFloat ("height") : 50,
			__xml.hasAttribute ("text") ? __xml.getAttribute ("text") : "",
			__xml.hasAttribute ("fontName") ? __xml.getAttribute ("fontName") : "Arial",
			__xml.hasAttribute ("fontSize") ? __xml.getAttributeFloat ("fontSize") : 20,
			__xml.hasAttribute ("colorNormal") ? __xml.getAttributeInt ("colorNormal") : 0x000000,
			__xml.hasAttribute ("colorOver") ? __xml.getAttributeInt ("colorOver") : 0x00ff00,
			__xml.hasAttribute ("colorDown") ? __xml.getAttributeInt ("colorDown") : 0x0000ff,
			__xml.hasAttribute ("colorSelected") ? __xml.getAttributeInt ("colorSelected") : 0xff0000,
			__xml.hasAttribute ("colorDisabled") ? __xml.getAttributeInt ("colorDisabled") : 0xc0c0c0,
			__xml.hasAttribute ("bold") ? __xml.getAttributeBoolean ("bold") : false,
			__xml.hasAttribute ("horizontalAlignment") ? __xml.getAttributeString ("horizontalAlignment") : "center",
			__xml.hasAttribute ("verticalAlignment") ? __xml.getAttributeString ("verticalAlignment") : "center",
		]);

		__button.setTrigger (__xml.hasAttribute ("trigger") ? __xml.getAttributeString ("trigger") : "");

		this.addItemToBox (__box, __xml, __button);
	}

	//------------------------------------------------------------------------------------------
	public addSpacerFromXML (__box:Box, __xml:XSimpleXMLNode):void {
	}

	//------------------------------------------------------------------------------------------
	public addAnimatedSpriteFromXML (__box:Box, __xml:XSimpleXMLNode):void {
		var __gameObject:XGameObject = __box.addGameObjectAsChild (
			XMLAnimatedSprite, __box.getBoxLayer (__xml), __box.getBoxDepth (__xml), false
		) as XMLAnimatedSprite;

		__gameObject.afterSetup ([
			__xml.getAttributeString ("className"),
			__xml.hasAttribute ("scaleX") ? __xml.getAttributeFloat ("scaleX") : 1.0,
			__xml.hasAttribute ("scaleY") ? __xml.getAttributeFloat ("scaleY") : 1.0,
		]);

		this.addItemToBox (__box, __xml, __gameObject);
	}

	//------------------------------------------------------------------------------------------
	public addSpriteFromXML (__box:Box, __xml:XSimpleXMLNode):void {
		var __gameObject:XGameObject = __box.addGameObjectAsChild (
			XMLSprite, __box.getBoxLayer (__xml), __box.getBoxDepth (__xml), false
		) as XMLSprite;

		__gameObject.afterSetup ([
			__xml.getAttributeString ("className"),
			__xml.hasAttribute ("scaleX") ? __xml.getAttributeFloat ("scaleX") : 1.0,
			__xml.hasAttribute ("scaleY") ? __xml.getAttributeFloat ("scaleY") : 1.0,
			__xml.hasAttribute ("pivotX") ? __xml.getAttributeFloat ("pivotX") : 0,
			__xml.hasAttribute ("pivotY") ? __xml.getAttributeFloat ("pivotY") : 0,
		]);

		this.addItemToBox (__box, __xml, __gameObject);
	}

	//------------------------------------------------------------------------------------------
	public addTextFromXML (__box:Box, __xml:XSimpleXMLNode):void {
		var __gameObject:XTextGameObject = __box.addGameObjectAsChild (
			XTextGameObject, __box.getBoxLayer (__xml), __box.getBoxDepth (__xml), false
		) as XTextGameObject;

		__gameObject.afterSetup ([
			__xml.hasAttribute ("width") ? __xml.getAttributeFloat ("width") : 250,
			__xml.hasAttribute ("height") ? __xml.getAttributeFloat ("height") : 50,
			__xml.hasAttribute ("text") ? __xml.getAttribute ("text") : "",
			__xml.hasAttribute ("fontName") ? __xml.getAttribute ("fontName") : "Arial",
			__xml.hasAttribute ("fontSize") ? __xml.getAttributeFloat ("fontSize") : 20,
			__xml.hasAttribute ("color") ? __xml.getAttributeInt ("color") : 0x000000,
			__xml.hasAttribute ("bold") ? __xml.getAttributeBoolean ("bold") : false,
			__xml.hasAttribute ("horizontalAlignment") ? __xml.getAttributeString ("horizontalAlignment") : "center",
			__xml.hasAttribute ("verticalAlignment") ? __xml.getAttributeString ("verticalAlignment") : "center"
		]);

		this.addItemToBox (__box, __xml, __gameObject);
	}

    //------------------------------------------------------------------------------------------
    public parseXML (__depth:number, __box:Box, __xml:XSimpleXMLNode, __sortOnAttribute:string = null):void {
        var __tabs:Array<String> = ["", "...", "......", ".........", "............", "...............", "...................."];

        var __children:Array<XSimpleXMLNode> = __xml.child ("*");

		if (__sortOnAttribute != null) {
			__children.sort ((a:XSimpleXMLNode, b:XSimpleXMLNode) => {
				return a.getAttributeInt (__sortOnAttribute) - b.getAttributeInt (__sortOnAttribute);
			});
		}

        var i:number;

        for (i = 0; i < __children.length; i++) {
            var __xml:XSimpleXMLNode = __children[i];

			console.log (": node: ", __tabs[__depth], __xml.localName (), __xml.attribute ("buttonClassName"));
			
			switch (__xml.localName ()) {
				case XMLBox.HBox:
					this.parseXML (__depth + 1, this.addHBoxFromXML (__box, __xml), __xml, __xml.hasAttribute ("sorton") ? __xml.getAttributeString ("sorton") : null);

					break;

				case XMLBox.VBox:
					this.parseXML (__depth + 1, this.addVBoxFromXML (__box, __xml), __xml, __xml.hasAttribute ("sorton") ? __xml.getAttributeString ("sorton") : null);	

					break;

				case XMLBox.SortedVBox:
					this.parseXML (__depth + 1, this.addVBoxFromXML (__box, __xml), __xml, __xml.hasAttribute ("sorton") ? __xml.getAttributeString ("sorton") : null);	
	
					break;

				case XMLBox.SpriteButton:
					this.addSpriteButtonFromXML (__box, __xml);

					break;
		
				case XMLBox.ImageButton:
					this.addImageButtonFromXML (__box, __xml);
	
					break;

				case XMLBox.TextSpriteButton:
					this.addTextSpriteButtonFromXML (__box, __xml);

					break;

				case XMLBox.TextButton:
					this.addTextButtonFromXML (__box, __xml);

					break;

				case XMLBox.Spacer:
					this.addSpacerFromXML (__box, __xml);

					break;

				case XMLBox.AnimatedSprite:
					this.addAnimatedSpriteFromXML (__box, __xml);

					break;

				case XMLBox.Sprite:
					this.addSpriteFromXML (__box, __xml);

					break;

				default:
					this.addCustomNode (__depth + 1, __box, __xml);

					break;
			}
        }
	}
	
    //------------------------------------------------------------------------------------------
    public addCustomNode (__depth:number, __box:Box, __xml:XSimpleXMLNode):void {
	}

//------------------------------------------------------------------------------------------
}