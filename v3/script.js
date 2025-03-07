document.getElementById('js-ver').textContent='JavaScriptバージョン:3-bgimg';const form=document.getElementById('searchForm');const searchInput=document.getElementById('searchInput');const historyDiv=document.getElementById('history');form.addEventListener('submit',function(event){event.preventDefault();const query=searchInput.value;if(!query)return;const engine=document.querySelector('input[name="engine"]:checked').value;const url=`${engine}?q=${encodeURIComponent(query)}`;saveSearchHistory(query,url);window.location.href=url});function saveSearchHistory(query,url){let history=JSON.parse(localStorage.getItem('searchHistory'))||[];history.unshift({query,url});if(history.length>5)history=history.slice(0,5);localStorage.setItem('searchHistory',JSON.stringify(history));displayHistory()};function displayHistory(){const history=JSON.parse(localStorage.getItem('searchHistory'))||[];historyDiv.innerHTML='<button class="clear-button" id="clearHistory"><span class="material-symbols-rounded deletehistory">delete_history</span></button>';history.forEach(item=>{const link=document.createElement('a');link.href=item.url;link.textContent=item.query;link.target='_blank';historyDiv.appendChild(link)});document.getElementById('clearHistory').addEventListener('click',function(){localStorage.removeItem('searchHistory');displayHistory()})};displayHistory();window.addEventListener('scroll',function(){var fullScreenEl=document.getElementById('bg');var fullShr=document.getElementById('shortcuts');if(window.scrollY>0){fullScreenEl.classList.add('active');fullShr.classList.add('active')}else{fullScreenEl.classList.remove('active');fullShr.classList.remove('active')}});function updateClock(){var now=new Date();var hours=now.getHours();var minutes=now.getMinutes();var ampm=hours>=12?'PM':'AM';hours=hours%12;hours=hours?hours:12;minutes=minutes<10?'0'+minutes:minutes;var timeString=hours+':'+minutes+' '+ampm;document.getElementById('clock').innerText=timeString};setInterval(updateClock,1000);document.addEventListener("DOMContentLoaded",function(){const buttons=document.querySelectorAll(".btn");const menus=document.querySelectorAll(".menu");const bar=document.querySelector(".bar");buttons.forEach((button,index)=>{button.addEventListener("click",function(event){const menu=menus[index];menus.forEach((m,i)=>{if(m!==menu){m.classList.remove("active");buttons[i].classList.remove("active")}});menu.classList.toggle("active");button.classList.toggle("active");if(menu.classList.contains("active")){bar.classList.add("transparent")}else{bar.classList.remove("transparent")};document.addEventListener("click",function closeMenu(e){if(!bar.contains(e.target)&&!menu.contains(e.target)){menu.classList.remove("active");button.classList.remove("active");bar.classList.remove("transparent");document.removeEventListener("click",closeMenu)}})})})});class LinkBox extends HTMLElement{constructor(){super();const href=this.getAttribute('href')||'#';const bgColor=this.getAttribute('bg-color')||'white';const imgBase=this.getAttribute('img')||'';const content=this.textContent;this.innerHTML=`<a href="${href}"><div class="box"><div class="container" style="background-color:${bgColor}"><img src="" id="img1"><img src="" id="img2"><img src="" id="img3"></div>${content}</div></a>`;const container=this.querySelector('.container');container.addEventListener('mousemove',(event)=>{const rect=container.getBoundingClientRect();const centerX=rect.left+rect.width/2;const centerY=rect.top+rect.height/2;const x=((event.clientX-centerX)/(rect.width/2))*15;const y=((event.clientY-centerY)/(rect.height/2))*15;container.style.setProperty('--x',`${x}deg`);container.style.setProperty('--y',`${y}deg`);container.style.setProperty('--x1',`${x * 0.5}px`);container.style.setProperty('--y1',`${y * 0.5}px`);container.style.setProperty('--x2',`${x * 0.65}px`);container.style.setProperty('--y2',`${y * 0.65}px`);container.style.setProperty('--x3',`${x * 0.8}px`);container.style.setProperty('--y3',`${y * 0.8}px`)});container.addEventListener('mouseleave',()=>{container.style.setProperty('--x','0deg');container.style.setProperty('--y','0deg');container.style.setProperty('--x1','0px');container.style.setProperty('--y1','0px');container.style.setProperty('--x2','0px');container.style.setProperty('--y2','0px');container.style.setProperty('--x3','0px');container.style.setProperty('--y3','0px')})}};customElements.define('link-box',LinkBox);class ImageLoader{constructor(){this.imageCache=new Map();this.zipCache=new Map()};async loadZipFile(mode){if(this.zipCache.has(mode)){return this.zipCache.get(mode)};const zipUrl=`https://search3958.github.io/newtab/lsr/${mode}.zip`;try{const response=await fetch(zipUrl);if(!response.ok)throw new Error('ZIP download failed');const arrayBuffer=await response.arrayBuffer();const zip=await new JSZip().loadAsync(arrayBuffer);const files={};for(const[filename,file]of Object.entries(zip.files)){if(!file.dir){const blob=await file.async('blob');const dataUrl=await this.blobToDataUrl(blob);files[filename]=dataUrl}};this.zipCache.set(mode,files);return files}catch(e){console.error('Error loading ZIP:',e);throw e}};async blobToDataUrl(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onloadend=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)})};async getImage(mode,imgBase,index){const cacheKey=`${mode}_${imgBase}${index}`;if(this.imageCache.has(cacheKey)){return this.imageCache.get(cacheKey)};try{const zipContents=await this.loadZipFile(mode);const expectedFileName=`${imgBase}${index}.webp`;const key=Object.keys(zipContents).find(fileName=>fileName.endsWith(expectedFileName));if(key){const imageData=zipContents[key];this.imageCache.set(cacheKey,imageData);return imageData};throw new Error('Image not found in ZIP')}catch(e){console.error('Error getting image:',e);throw e}}};const imageLoader=new ImageLoader();const colorModeCheckbox=document.getElementById('colorMode');const hueRotationSlider=document.getElementById('hueRotation');const hueValue=document.getElementById('hueValue');async function updateAppearance(){const containers=document.querySelectorAll('link-box .container');const isDarkMode=window.matchMedia('(prefers-color-scheme: dark)').matches;let mode;if(colorModeCheckbox.checked){mode='color';containers.forEach(container=>{container.style.background='linear-gradient(#222, #111)'})}else{if(isDarkMode){mode='dark';containers.forEach(container=>{container.style.background='linear-gradient(#222, #111)'})}else{mode='light';containers.forEach(container=>{const parentLinkBox=container.closest('link-box');const bgColor=parentLinkBox?parentLinkBox.getAttribute('bg-color'):'white';container.style.background=bgColor})}};await updateImageSources(mode);const hueRotation=colorModeCheckbox.checked?hueRotationSlider.value:0;updateHueRotation(hueRotation);hueValue.textContent=hueRotation};async function updateImageSources(mode){const linkBoxes=document.querySelectorAll('link-box');for(const linkBox of linkBoxes){const imgBase=linkBox.getAttribute('img');const images=linkBox.querySelectorAll('img');for(let i=0;i<images.length;i++){const img=images[i];try{const dataUrl=await imageLoader.getImage(mode,imgBase,i+1);img.src=dataUrl;img.classList.remove('hidden')}catch(e){if(mode==='dark'){try{const dataUrl=await imageLoader.getImage('light',imgBase,i+1);img.src=dataUrl;img.classList.remove('hidden')}catch(e2){img.classList.add('hidden')}}else{img.classList.add('hidden')}}}}};function updateHueRotation(hueVal){const images=document.querySelectorAll('link-box .container img');images.forEach(img=>{img.style.filter=`hue-rotate(${hueVal}deg)`})};function loadSettings(){const colorMode=localStorage.getItem('colorMode');const hueRotation=localStorage.getItem('hueRotation');if(colorMode==='true'){colorModeCheckbox.checked=!0}else{colorModeCheckbox.checked=!1};if(hueRotation){hueRotationSlider.value=hueRotation}};function saveSettings(){localStorage.setItem('colorMode',colorModeCheckbox.checked);localStorage.setItem('hueRotation',hueRotationSlider.value)};loadSettings();colorModeCheckbox.addEventListener('change',()=>{updateAppearance();saveSettings()});hueRotationSlider.addEventListener('input',()=>{updateAppearance();saveSettings()});window.matchMedia('(prefers-color-scheme: dark)').addListener(updateAppearance);updateAppearance();const defaultImageUrl="https://search3958.github.io/newtab/bgimg/bg1.webp";window.onload=function(){const storedImageUrl=localStorage.getItem('backgroundImageUrl');if(storedImageUrl){document.body.style.backgroundImage=`url(${storedImageUrl})`;document.getElementById('imageUrl').value=storedImageUrl}else{document.body.style.backgroundImage=`url(${defaultImageUrl})`;document.getElementById('imageUrl').value=defaultImageUrl}};function updateBackground(){const imageUrl=document.getElementById('imageUrl').value;document.body.style.backgroundImage=`url(${imageUrl})`;localStorage.setItem('backgroundImageUrl',imageUrl)};function resetBackground(){document.body.style.backgroundImage=`url(${defaultImageUrl})`;document.getElementById('imageUrl').value=defaultImageUrl;localStorage.removeItem('backgroundImageUrl')};navigator.getBattery().then(function(battery){if(battery.level<=0.2){const batteryStatusElement=document.getElementById('batteryStatus');batteryStatusElement.innerHTML='<span class="material-symbols-rounded batteryicon">battery_1_bar</span>残量低下 '+Math.round(battery.level*100)+'%';batteryStatusElement.style.display='block'}})