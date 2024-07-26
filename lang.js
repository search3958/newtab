(()=>{
    let tag_sid=0;
    let mltags=[];
    let lang_text=navigator.language.toLowerCase().replace('_','-');
    console.log(lang_text);

    //繝�く繧ｹ繝域枚蟄怜�
    class MLText extends HTMLElement
    {
        constructor() {
            super();
            mltags.push(this);
        }
        _update(){
            //迺ｰ蠅�､画焚縺九ｉ險隱槭ｒ蜿門ｾ� {lang,locale}
            let lang = lang_text;
            //螳夂ｾｩ險隱槭�荳隕ｧ
            let langs=[];
            for(let i of this.attributes){
                langs.push(i.name);
            }
            if(langs.length==0){
                this.innerText="";
            }else{
                //險隱槭�豎ｺ螳�
                let lidx=langs.indexOf(lang);
                if(lidx<0){
                    lidx=langs.indexOf(lang.split('-')[0]);
                    if(lidx<0){
                        lidx=0;
                    }
                }
                //蜿肴丐
                this.innerText=this.attributes[lidx].value;
            }
        }	
        connectedCallback()
        {
            this._update();
        }
    }
    customElements.define('ml-text', MLText);
    /**
     * ml-block縺ｮ荳ｭ霄ｫ縺ｯ謫堺ｽ懊＠縺ｪ縺�〒縺上□縺輔＞蜑ｯ菴懃畑縺悟�縺ｾ縺吶�
     */
    class MLBlock extends HTMLElement{
        constructor() {
            super();
            mltags.push(this);
            let _t=this;
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length)
                    {
                        _t._update();
						//observer.disconnect();
                        break;
                    }
                }
            });
            observer.observe(this, { childList: true });
            this._cache=[];
            this._display=[];
            this._langs=[];
        }
        _update(){
            console.log("MachML update!");
            //繧ｿ繧ｰ繝ｪ繧ｹ繝医ｒ蜿門ｾ�
            let current=[];
            for (let i = 0; i < this.children.length; i++) {
                if (this.children[i].hasAttribute("data-lang")) {
                    current.push(this.children[i]);
                }
            }
            let cache=this._cache;
            let display=this._display;
            let langs=this._langs;
            //繧ｿ繧ｰ繝ｪ繧ｹ繝医↓縺ｪ縺�ｂ縺ｮ繧偵く繝｣繝�す繝･縺九ｉ蜑企勁
            for (let i = cache.length-1; i>=0; i--) {
                let has=false;
                for(let j=0;j<current.length;j++){
                    if(Object.is(current[j],cache[i])){
                        has=true;
                    }
                }
                if (!has) {
                    cache.splice(i,1);
                    display.splice(i,1);
                    langs.splice(i,1);
                }
            }
            //繧ｿ繧ｰ繝ｪ繧ｹ繝医↓縺ゅ▲縺ｦ繧ｭ繝｣繝�す繝･縺ｫ縺ｪ縺�ｂ縺ｮ繧定ｿｽ蜉�
            for (let i = 0; i < current.length; i++) {
                let has=false;
                for(let j=0;j<cache.length;j++){
                    if(cache[j]===current[i]){
                        has=true;
                    }
                }
                if (!has) {
                    cache.push(current[i]);
                    display.push('');//蛻晄悄蛟､縺悟叙繧後↑縺�％縺ｨ縺後≠繧九�縺ｧ''縺ｨ縺吶ｋ縲�
                    langs.push(current[i].attributes["data-lang"].value);
                }
            }
            //險隱槭ｒ蜿門ｾ�
            let lang = lang_text;
            if(cache.length<=1){//1蛟九↑繧峨↑繧薙ｂ縺励↑縺�
                return;
            }
            //陦ｨ遉ｺ縺吶ｋ鬆�岼縺ｮ豎ｺ螳�
            let lidx=langs.indexOf(lang);//螳悟�繝槭ャ繝�
            if(lidx<0){
                lidx=langs.indexOf(lang.split('-')[0]);//險隱槭�繝�メ
                if(lidx<0){//繝槭ャ繝√＠縺ｪ縺�
                    lidx=0;
                }
            }
            for(let i=0;i<cache.length;i++){
                cache[i].style.display = i==lidx?display[i]:"none";
            }

        }
    }
    customElements.define('ml-block', MLBlock);

    class MLSelector extends HTMLElement{
        connectedCallback()
        {
            let id=`_MLSelector-${tag_sid++}`;
            let langs=this.attributes["langs"].value.split(" ");
            let s=`<select id="${id}">`;
            for (let i = 0; i < langs.length; i++) {
                s+=`<option value="${langs[i]}">${langs[i]}</option>`;
            }
            s+="</select>";
            this.innerHTML=s;
            let tag=document.getElementById(id);
            tag.selectedIndex=langs.indexOf(lang_text);
            tag.addEventListener('change', () => {
                MachML.setLocale(tag.options[tag.selectedIndex].text);
            });
        }
    }
    customElements.define('ml-select', MLSelector);
    //globalAPI
    MachML={
        version:"MachML/0.1.0",
        setLocale:(locale)=>{
            lang_text=locale;
            for(let o of mltags){
                o._update();
            }
        }
    }
})();
