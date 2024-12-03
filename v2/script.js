const specialWords = ["天安門事件", "六四", "熊婦産", "8964", "豚恩", "南北統一", "남북 통일", "남북통일", "検閲", "プー", "ぷー", "小熊", "维尼"];const historyContainer=document.querySelectorAll('.history');document.addEventListener("DOMContentLoaded",function(){document.getElementById("clearHistory").addEventListener("click",function(){localStorage.removeItem('searchHistory');renderHistory()})});const updateHistory=(query)=>{const history=JSON.parse(localStorage.getItem('searchHistory'))||[];history.unshift(query);if(history.length>5)history.pop();localStorage.setItem('searchHistory',JSON.stringify(history));renderHistory()};const renderHistory=()=>{const history=JSON.parse(localStorage.getItem('searchHistory'))||[];historyContainer.forEach((container,index)=>{container.innerHTML=history[index]?`${history[index]}<md-ripple></md-ripple>`:'';container.onclick=()=>{const clickedQuery=history[index];if(clickedQuery){if(clickedQuery.startsWith('http://')||clickedQuery.startsWith('https://')){window.location.href=clickedQuery}else{searchWithQuery(clickedQuery)}}}})};const searchWithQuery=(query)=>{if(specialWords.some(word=>query.includes(word))){document.getElementById('errorMessage').innerText='その検索内容には機密情報が含まれている可能性があります。';errorDialog.show();return} updateHistory(query);window.location.href=`https://www.google.com/search?q=${encodeURIComponent(query)}`};const checkEnter=(e)=>{if(e.key==='Enter'){searchGoogle()}};const searchGoogle=()=>{const query=document.getElementById("searchBox").value.trim();if(query.startsWith('http://')||query.startsWith('https://')){window.location.href=query}else{searchWithQuery(query)}};class LinkBox extends HTMLElement{static get observedAttributes(){return['href','img']} constructor(){super();this.render()} attributeChangedCallback(){this.render()} render(){const href=this.getAttribute('href')||'#';const img=this.getAttribute('img')||'';this.innerHTML=` <div class="container"> <div class="box"> <a href="https://${href}"> <img src="https://search3958.github.io/newtab/img/${img}" alt="${this.textContent}"> <md-ripple></md-ripple> </a> </div> <div>${this.textContent}</div> </div>`;this.addMouseEvents(this.querySelector('.container'))} addMouseEvents(container){const box=container.querySelector('.box');container.onmousemove=(e)=>{const{left,top,width,height}=box.getBoundingClientRect();box.style.transform=`rotateX(${-((e.clientY - top) - height / 2) / 6}deg) rotateY(${((e.clientX - left) - width / 2) / 6}deg)`};container.onmouseleave=()=>box.style.transform='rotateX(0) rotateY(0)'}} customElements.define('link-box',LinkBox);window.onload=()=>{document.querySelector('.content').style.display='block';document.getElementById('searchBox').focus();renderHistory()};document.querySelectorAll('.container').forEach(container=>{container.onmousemove=(e)=>{const box=container.querySelector('.box');const{left,top,width,height}=box.getBoundingClientRect();box.style.transform=`rotateX(${-((e.clientY - top) - height / 2) / 6}deg) rotateY(${((e.clientX - left) - width / 2) / 6}deg)`;container.onmouseleave=()=>box.style.transform='rotateX(0) rotateY(0)'}});const adjustColor=(color,amount,isLighten)=>{let[r,g,b]=[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16)];[r,g,b]=isLighten?[Math.min(255,Math.floor(r+(255-r)*amount)),Math.min(255,Math.floor(g+(255-g)*amount)),Math.min(255,Math.floor(b+(255-b)*amount))]:[Math.max(0,Math.floor(r*(1-amount))),Math.max(0,Math.floor(g*(1-amount))),Math.max(0,Math.floor(b*(1-amount)))];return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`};const isDarkMode=()=>window.matchMedia('(prefers-color-scheme: dark)').matches;const updateColors=()=>{const baseColor=document.getElementById('base-color').value;const colors={'--background-light':adjustColor(baseColor,0.9,!0),'--element-light':adjustColor(baseColor,0.1,!1),'--search-light':adjustColor(baseColor,0.8,!0),'--background-dark':adjustColor(baseColor,0.9,!1),'--element-dark':adjustColor(baseColor,0.4,!0),'--search-dark':adjustColor(baseColor,0.75,!1),'--link-light':document.getElementById('switch-on').checked?adjustColor(baseColor,0.8,!0):'#ffffff','--link-dark':document.getElementById('switch-on').checked?adjustColor(baseColor,0.3,!1):'#000000',};Object.entries(colors).forEach(([key,value])=>document.documentElement.style.setProperty(key,value));updateImageBrightness(document.getElementById('switch-on').checked);localStorage.setItem('baseColor',baseColor)};const updateImageBrightness=(isSvgChecked)=>{document.querySelectorAll('img').forEach(img=>{img.style.filter=!isDarkMode()&&isSvgChecked&&img.src.endsWith('.svg')?'brightness(0%)':''})};const applyDefaultColors=()=>{const defaultColors={'--background-light':'#f0f0f0','--element-light':'#185af2','--background-dark':'#000000','--element-dark':'#185af2','--text-light':'#ffffff','--text-dark':'#1c1c1c','--link-light':'#ffffff','--link-dark':'#111111','--search-light':'#ffffff','--search-dark':'#1c1c1c'};Object.entries(defaultColors).forEach(([key,value])=>document.documentElement.style.setProperty(key,value));localStorage.setItem('themeDisabled','true')};const loadColors=()=>{const savedColor=localStorage.getItem('baseColor');const themeDisabled=localStorage.getItem('themeDisabled');restoreSwitchState();document.getElementById('disable-material3').checked=themeDisabled==='true';themeDisabled==='true'?applyDefaultColors():savedColor?(document.getElementById('base-color').value=savedColor,updateColors()):applyDefaultColors()};const saveSwitchState=(isChecked)=>localStorage.setItem('switchState',isChecked?'on':'off');const toggleImages=()=>{const switchOn=document.getElementById('switch-on');const isSvgChecked=switchOn.checked;document.querySelectorAll('img').forEach(img=>{img.src=img.src.replace(isSvgChecked?'.webp':'.svg',isSvgChecked?'.svg':'.webp');img.classList.toggle('background-on',isSvgChecked)});saveSwitchState(isSvgChecked);updateColors();document.getElementById('label-on').classList.toggle('highlight',isSvgChecked);document.getElementById('label-off').classList.toggle('highlight',!isSvgChecked)};const restoreSwitchState=()=>{document.getElementById(localStorage.getItem('switchState')==='on'?'switch-on':'switch-off').checked=!0;toggleImages()};const changeLanguage=(select)=>MachML.setLocale(select.value);document.getElementById('base-color').addEventListener('input',updateColors);document.getElementById('disable-material3').addEventListener('change',function(){this.checked?applyDefaultColors():updateColors();localStorage.setItem('themeDisabled',this.checked)});document.querySelectorAll('input[name="icon-toggle"]').forEach(radio=>radio.addEventListener('change',toggleImages));window.addEventListener('load',loadColors);const userLang=navigator.language||navigator.userLanguage;document.querySelectorAll('lang-elm').forEach(el=>{const text=el.getAttribute(userLang)||el.getAttribute('en');el.style.display='inline';el.innerText=text});function openModal(modalId){const modal=document.getElementById(modalId);modal.style.display='flex';requestAnimationFrame(()=>{modal.classList.add('active')})} function closeModal(modalId){const modal=document.getElementById(modalId);const modalContent=modal.querySelector('.modal-content');modalContent.style.animation='slideOut 0.5s cubic-bezier(0.160, 0.730, 0.320, 1.000) forwards';modalContent.addEventListener('animationend',function(){modal.classList.remove('active');modal.style.display='none';modalContent.style.animation=''},{once:!0})} document.getElementById('open-modal1').addEventListener('click',()=>openModal('modal1'));document.getElementById('open-modal2').addEventListener('click',()=>openModal('modal2'));document.getElementById('open-modal3').addEventListener('click',()=>openModal('modal3'));document.getElementById('close-modal1').addEventListener('click',()=>closeModal('modal1'));document.getElementById('close-modal2').addEventListener('click',()=>closeModal('modal2'));document.getElementById('close-modal3').addEventListener('click',()=>closeModal('modal3'));const modals=document.querySelectorAll('.modal');modals.forEach(modal=>{modal.addEventListener('click',()=>closeModal(modal.id));const modalContent=modal.querySelector('.modal-content');modalContent.addEventListener('click',(event)=>event.stopPropagation())});const updateClock=()=>{const now=new Date();const hours=String(now.getHours()).padStart(2,'0');const minutes=String(now.getMinutes()).padStart(2,'0');const seconds=String(now.getSeconds()).padStart(2,'0');document.getElementById("clock").innerText=`${hours}:${minutes}:${seconds}`};window.onload=()=>{document.querySelector('.content').style.display='block';document.getElementById('searchBox').focus();renderHistory();updateClock();setInterval(updateClock,1000)};const applyCustomColor=()=>{const isDisabled=document.getElementById('disable-material3').checked;if(isDisabled){applyDefaultColors()}else{updateColors()} localStorage.setItem('themeDisabled',isDisabled)};document.getElementById('base-color').addEventListener('input',()=>{document.getElementById('disable-material3').checked=!1;updateColors();applyCustomColor()});document.getElementById('disable-material3').addEventListener('change',applyCustomColor);document.querySelectorAll('input[name="icon-toggle"]').forEach(radio=>{radio.addEventListener('change',()=>{toggleImages();applyCustomColor()})})
