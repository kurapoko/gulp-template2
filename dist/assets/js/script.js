"use strict";for(var scrollTrigger=document.querySelectorAll('a[href^="#"]'),_loop=function(o){scrollTrigger[o].addEventListener("click",function(e){e.preventDefault();var r=scrollTrigger[o].getAttribute("href"),t=+(document.getElementById(r.replace("#","")).getBoundingClientRect().top+window.pageYOffset);window.scrollTo({top:t,behavior:"smooth"})})},i=0;i<scrollTrigger.length;i++)_loop(i);