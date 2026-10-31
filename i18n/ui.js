(() => {
 'use strict';
 const dictionary=window.EasyTranslations||{};
 const fragments=Object.keys(dictionary).filter(key=>key.length>1).sort((a,b)=>b.length-a.length);
 const originalText=new WeakMap(),originalAttributes=new WeakMap();
 const bridge=window.easyLanguage;
 const storageKey='easy.site.language.v1';
 const ignored='script,style,textarea,pre,code,[data-no-i18n],html[data-easy-app="code"] .msg,.msg>div:nth-child(2),.message p,.question p,.record strong,.record details p,.record details li,.record pre,.history-open,.attachment-chip>span,#videoPreviewTitle,.user-bubble-content,.message-content,.bubble-content,.thinking-text,.assistant-content';
 const isPath=value=>/^(?:[A-Za-z]:[\\/]|\\\\)/.test(value.trim());
 const titleSource=document.title;
 let locale='zh-CN';let updating=false;let initialized=false;
 function translate(text){if(locale!=='en')return text;const trimmed=text.trim();if(dictionary[trimmed])return text.replace(trimmed,dictionary[trimmed]);if(!/[\u3400-\u9fff]/.test(text))return text;let result=text;for(const key of fragments)if(result.includes(key))result=result.split(key).join(dictionary[key]);return result.replace(/^([低中高关])(?=\s*[·⌄])/,(value)=>dictionary[value]||value);}
 function visit(root){
  if(!root||root.nodeType!==1||root.closest(ignored))return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){return node.parentElement?.closest(ignored)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
  let node;while((node=walker.nextNode())){
   const current=node.nodeValue;if(isPath(current))continue;let data=originalText.get(node);
   if(!data||current!==data.output){data={source:current,output:current};originalText.set(node,data);}
   const output=locale==='en'&&node.parentElement.matches('option[value="off"]')&&data.source.trim()==='关闭'?data.source.replace('关闭','Off'):translate(data.source);if(current!==output)node.nodeValue=output;data.output=output;
  }
  for(const el of [root,...root.querySelectorAll('[title],[placeholder],[aria-label],[alt]')]){
   if(el.closest(ignored))continue;
   let data=originalAttributes.get(el);if(!data){data={};originalAttributes.set(el,data);}
   for(const key of ['title','placeholder','aria-label','alt']){const current=el.getAttribute(key);if(current===null||isPath(current))continue;if(!data[key]||current!==data[key].output)data[key]={source:current,output:current};const output=translate(data[key].source);if(current!==output)el.setAttribute(key,output);data[key].output=output;}
  }
 }
 let observer;
 function update(){if(updating)return;updating=true;observer?.disconnect();try{visit(document.body);document.documentElement.lang=locale;document.documentElement.dir='ltr';document.querySelectorAll('[data-easy-language],#languageSetting').forEach(el=>{el.value=locale;});document.title=translate(titleSource);}finally{updating=false;observer?.observe(document.body,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['title','placeholder','aria-label','alt']});}}
 function setLocale(value){const next=value==='en'?'en':'zh-CN';if(initialized&&locale===next){update();return;}locale=next;initialized=true;try{if(!bridge)localStorage.setItem(storageKey,next);}catch{}update();document.dispatchEvent(new CustomEvent('easy-language',{detail:{locale}}));}
 window.EasyI18n={translate,setLocale,get locale(){return locale;}};
 async function choose(value){const previous=locale;try{const next=bridge?await bridge.set(value):value;setLocale(next);if(!bridge){const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState(null,'',url);}}catch{setLocale(previous);alert(previous==='en'?'Could not save the language setting.':'无法保存语言设置。');}}
 function start(){
  let scheduled=false;observer=new MutationObserver(records=>{if(!updating&&!scheduled&&records.some(record=>!(record.target.parentElement||record.target).closest?.(ignored))){scheduled=true;requestAnimationFrame(()=>{scheduled=false;update();});}});
  document.addEventListener('change',event=>{if(event.target.matches('[data-easy-language],#languageSetting')&&['en','zh-CN'].includes(event.target.value))void choose(event.target.value);});
  if(bridge){bridge.onChange(setLocale);bridge.get().then(setLocale).catch(()=>setLocale(navigator.language.toLowerCase().startsWith('zh')?'zh-CN':'en'));}
  else{let value;try{value=new URL(location.href).searchParams.get('lang')||localStorage.getItem(storageKey);}catch{}setLocale(['en','zh-CN'].includes(value)?value:navigator.language.toLowerCase().startsWith('zh')?'zh-CN':'en');}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
