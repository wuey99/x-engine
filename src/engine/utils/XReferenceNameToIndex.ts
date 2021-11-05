//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "X-Engine"
//
// Copyright (c) 2014 Jimmy Huey (wuey99@gmail.com)
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
    import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
    import { XType } from '../type/XType';

	//------------------------------------------------------------------------------------------
	// this class maps a list of ReferenceNames to unique indexes
	//------------------------------------------------------------------------------------------
	export class XReferenceNameToIndex  {
		private m_referenceNamesStrings:Array<string>;
		private m_referenceNamesCounts:Array<number>;
		private m_freeReferenceNameIndexes:Array<number>;
		
		//------------------------------------------------------------------------------------------	
		public constructor () {
			this.m_referenceNamesStrings = new Array<string> ();
			this.m_referenceNamesCounts = new Array<number> ();
			this.m_freeReferenceNameIndexes = new Array<number> ();
		}	
		
		//------------------------------------------------------------------------------------------
		public setup ():void {
		}
		
		//------------------------------------------------------------------------------------------
		public cleanup ():void {
		}

		//------------------------------------------------------------------------------------------
		public setReferenceNamesStrings (__value:Array<string>):void {
			this.m_referenceNamesStrings = __value;
		}
		
		//------------------------------------------------------------------------------------------
		public setReferenceNamesCounts (__value:Array<number>):void {
			this.m_referenceNamesCounts = __value;
		}
		
		//------------------------------------------------------------------------------------------
		public setFreeReferenceNameIndexes (__value:Array<number>):void {
			this.m_freeReferenceNameIndexes = __value;
		}
		
		//------------------------------------------------------------------------------------------
		public clone ():XReferenceNameToIndex {
			var __dst:XReferenceNameToIndex = new XReferenceNameToIndex ();
			
			__dst.setReferenceNamesStrings (XType.copyArray (this.m_referenceNamesStrings as Array<string>));
			__dst.setReferenceNamesCounts (XType.copyArray (this.m_referenceNamesCounts as Array<number>));
			__dst.setFreeReferenceNameIndexes (XType.copyArray (this.m_freeReferenceNameIndexes) as Array<number>);
			
			return __dst;
		}
		
		//------------------------------------------------------------------------------------------
		// given an index, find its ReferenceName.
		//------------------------------------------------------------------------------------------
		public getReferenceNameFromIndex (__index:number):string {
			return this.m_referenceNamesStrings[__index];
		}
		
		//------------------------------------------------------------------------------------------
		// given a reference assign a unique index to it.
		//------------------------------------------------------------------------------------------
		public getIndexFromReferenceName (__referenceName:string):number {
			var index:number;
			
			// look up the index associated with the ReferenceName
			index = this.m_referenceNamesStrings.indexOf (__referenceName);
			
			// if no index can be found, create a new index
			if (index == -1) {
				
				// create a new ReferenceName if there are no previously deleted ones
				if (this.m_freeReferenceNameIndexes.length == 0) {		
					this.m_referenceNamesStrings.push (__referenceName);
					this.m_referenceNamesCounts.push (1);
					index = this.m_referenceNamesStrings.indexOf (__referenceName);
				}
					// reclaim a previously deleted ReferenceName's index
				else
				{	
					index = this.m_freeReferenceNameIndexes.pop ();
					this.m_referenceNamesStrings[index] = __referenceName;	
					this.m_referenceNamesCounts[index]++;	
				}		
			}
				// increment the ReferenceName's ref count
			else
			{		
				this.m_referenceNamesCounts[index]++;
			}
			
			return index;
		}
		
		//------------------------------------------------------------------------------------------
		// remove a ReferenceName from the list
		//
		// ReferenceNames aren't physically removed from the list: the entry is cleared out and the index
		// in the Array is made available for reuse.
		//------------------------------------------------------------------------------------------
		public removeIndexFromReferenceNames (__index:number):void {
			if (this.m_referenceNamesCounts[__index] > 0) {
				this.m_referenceNamesCounts[__index]--;
			}
			
			/*
			if (m_referenceNamesCounts[__index] == 0) {
				m_referenceNamesStrings[__index] = "";
				
				m_freeReferenceNameIndexes.push (__index);
			}
			*/
		}
		
		//------------------------------------------------------------------------------------------
		public getAllReferenceNames ():Array<string> {
			var __referenceNames:Array<string> = new Array<string> ();
			var i:number;
			
			for (i = 0; i < this.m_referenceNamesStrings.length; i++) {
				if (this.m_referenceNamesStrings[i] != "") {
					__referenceNames.push (this.m_referenceNamesStrings[i]);
				}
			}
			
			return __referenceNames;
		}
		
		//------------------------------------------------------------------------------------------
		public getReferenceNameCount (__index:number):number {
			return this.m_referenceNamesCounts[__index];
		}
		
		//------------------------------------------------------------------------------------------
		public setReferenceNameCount (__index:number, __value:number):void {
			this.m_referenceNamesCounts[__index] = __value;
		}

		//------------------------------------------------------------------------------------------
		public clearReferenceNamesCounts ():void {
			var i:number;
			
			for (i = 0; i < this.m_referenceNamesCounts.length; i++) {
				this.m_referenceNamesCounts[i] = 0;
			}
		}
		
		//------------------------------------------------------------------------------------------
		public serialize ():XSimpleXMLNode {
			var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
			
			__xml.setupWithParams ("classNames", "", []);
			
			var i:number;
			var __name:String;
			var __count:number;
			
			for (i = 0; i < this.m_referenceNamesStrings.length; i++) {
				__name = this.m_referenceNamesStrings[i];
				__count = this.m_referenceNamesCounts[i];
				
				if (__count == 0) {
					__name = "";
				}
				
				var __attribs:Array<any> = [
					"index",		i,
					"name",			__name,
					"count",		__count					
				];
				
				var __referenceName:XSimpleXMLNode = new XSimpleXMLNode ();
				
				__referenceName.setupWithParams ("className", "", __attribs);
				
				__xml.addChildWithXMLNode (__referenceName);
			}
			
			return __xml;
		}
		
		//------------------------------------------------------------------------------------------
		public deserialize (__xml:XSimpleXMLNode):void {
			this.m_referenceNamesStrings = new Array<string> ();
			this.m_referenceNamesCounts = new Array<number> ();
			this.m_freeReferenceNameIndexes = new Array<number> (); 
			
			console.log (": XReferenceNameIndex: deserialize: ");
			
			if (__xml.child ("classNames").length == 0) {
				return;
			}
			
			var __xmlList:Array<XSimpleXMLNode> = __xml.child ("classNames")[0].child ("className") as Array<XSimpleXMLNode>;
			
			var i:number;
			var __name:string;
			var __count:number;
			
			for (i = 0; i < __xmlList.length; i++) {
				__name = __xmlList[i].getAttributeString ("name");
				__count = __xmlList[i].getAttributeInt ("count");
				
				console.log (": XReferenceNameIndex: deserialize: ", __name, __count);
				
				this.m_referenceNamesStrings.push (__name);
				
				// don't use the count because the rest of the deserialization code is going to add
				// the items back to the XMap.
				//				m_referenceNamesCounts.push (__count);
				this.m_referenceNamesCounts.push (0);
			}
			
			for (i = 0; i < this.m_referenceNamesStrings.length; i++) {
				if (this.m_referenceNamesStrings[i] == "") {
					this.m_freeReferenceNameIndexes.push (i);
				}
			}
		}
		
		//------------------------------------------------------------------------------------------	
	}
	
	//------------------------------------------------------------------------------------------	
// }
