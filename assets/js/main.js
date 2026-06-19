(function(){
'use strict';

/* ===== CANVAS BG: ATMOSPHERIC LIGHT ===== */
var canvas,ctx,W,H,animId;
var lights=[],particles=[],scanY=0,scanDir=1;

function initCanvas(){
  canvas=document.getElementById('bgCanvas');
  if(!canvas)return;
  ctx=canvas.getContext('2d');
  resize();
  window.addEventListener('resize',debounce(resize,200));
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){drawStaticBg();return;}
  createLights();
  createParticles();
  animate();
}

function drawStaticBg(){
  var grd=ctx.createRadialGradient(W/2,H*0.3,0,W/2,H*0.3,H);
  grd.addColorStop(0,'#0a0a1a');grd.addColorStop(0.5,'#0a0a10');grd.addColorStop(1,'#050508');
  ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  // Corner brackets
  ctx.strokeStyle='rgba(100,180,255,0.04)';ctx.lineWidth=1;
  var m=24,cs=24;
  ctx.beginPath();ctx.moveTo(m,m+cs);ctx.lineTo(m,m);ctx.lineTo(m+cs,m);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W-m-cs,m);ctx.lineTo(W-m,m);ctx.lineTo(W-m,m+cs);ctx.stroke();
  ctx.beginPath();ctx.moveTo(m,H-m-cs);ctx.lineTo(m,H-m);ctx.lineTo(m+cs,H-m);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W-m-cs,H-m);ctx.lineTo(W-m,H-m);ctx.lineTo(W-m,H-m-cs);ctx.stroke();
  cancelAnimationFrame(animId);
}

function resize(){
  W=canvas.width=window.innerWidth;
  H=canvas.height=window.innerHeight;
  scanY=0;
}

function debounce(fn,ms){var t;return function(){clearTimeout(t);t=setTimeout(fn,ms)}}

function createLights(){
  lights=[];
  var isMobile=W<700;
  var configs=isMobile?[
    {x:0.2,y:0.1,color:[0,212,255],width:0.15,angle:0.6},
    {x:0.8,y:0.15,color:[124,58,237],width:0.12,angle:-0.5},
    {x:0.5,y:-0.05,color:[245,158,11],width:0.08,angle:0.1}
  ]:[
    {x:0.2,y:0.1,color:[0,212,255],width:0.15,angle:0.6},
    {x:0.8,y:0.15,color:[124,58,237],width:0.12,angle:-0.5},
    {x:0.5,y:-0.05,color:[245,158,11],width:0.08,angle:0.1},
    {x:0.1,y:0.3,color:[16,185,129],width:0.1,angle:0.8},
    {x:0.9,y:0.25,color:[239,68,68],width:0.07,angle:-0.7},
    {x:0.3,y:0.05,color:[0,212,255],width:0.06,angle:0.3}
  ];
  for(var i=0;i<configs.length;i++){
    var c=configs[i];
    lights.push({
      x:W*c.x,y:H*c.y,
      tx:W*c.x,ty:H*c.y,
      color:c.color,
      width:c.width*Math.min(W,H),
      angle:c.angle,
      speed:0.002+Math.random()*0.003,
      phase:Math.random()*Math.PI*2,
      intensity:0.5+Math.random()*0.5
    });
  }
}

function createParticles(){
  particles=[];
  var isMobile=W<700;
  var count=isMobile?15:80;
  for(var i=0;i<count;i++){
    particles.push({
      x:Math.random()*W*1.2-W*0.1,
      y:Math.random()*H*1.2-H*0.1,
      size:0.5+Math.random()*1.5,
      speedX:(Math.random()-0.5)*0.15,
      speedY:-0.05-Math.random()*0.1,
      phase:Math.random()*Math.PI*2,
      alpha:0.1+Math.random()*0.4
    });
  }
}

function animate(){
  var t=Date.now()/1000;
  ctx.clearRect(0,0,W,H);

  // 1. Deep background gradient
  var bg=ctx.createRadialGradient(W/2,H*0.3,0,W/2,H*0.3,H);
  bg.addColorStop(0,'#0a0a1a');
  bg.addColorStop(0.5,'#0a0a10');
  bg.addColorStop(1,'#050508');
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,W,H);

  // 2. Volumetric light beams
  drawLights(t);

  // 3. Floating haze particles
  drawParticles(t);

  // 4. Scan line
  drawScanLine(t);

  animId=requestAnimationFrame(animate);
}

/* ===== 1. VOLUMETRIC LIGHT BEAMS ===== */
function drawLights(t){
  lights.forEach(function(l,i){
    // Soft drift
    l.x+=Math.sin(t*0.1+l.phase)*(W*0.001);
    l.y+=Math.cos(t*0.08+l.phase)*(H*0.0008);
    l.x+=(l.tx-l.x)*0.001;
    l.y+=(l.ty-l.y)*0.001;
    l.angle+=Math.sin(t*0.05+l.phase)*0.002;

    var intensity=l.intensity*(0.7+0.3*Math.sin(t*0.2+i*1.5));
    var baseAlpha=0.03*intensity;
    var r=l.color[0],g=l.color[1],b=l.color[2];

    // Wide volumetric cone
    var endX=l.x+Math.cos(l.angle)*W*0.8;
    var endY=l.y+Math.sin(l.angle)*W*0.8;

    var grad=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.width*3);
    grad.addColorStop(0,'rgba('+r+','+g+','+b+','+baseAlpha+')');
    grad.addColorStop(0.3,'rgba('+r+','+g+','+b+','+(baseAlpha*0.5)+')');
    grad.addColorStop(0.6,'rgba('+r+','+g+','+b+','+(baseAlpha*0.2)+')');
    grad.addColorStop(1,'rgba('+r+','+g+','+b+',0)');
    ctx.fillStyle=grad;
    ctx.beginPath();ctx.moveTo(l.x,l.y);
    var spread=0.15*intensity;
    ctx.lineTo(endX+Math.cos(l.angle+Math.PI/2)*l.width*spread,endY+Math.sin(l.angle+Math.PI/2)*l.width*spread);
    ctx.lineTo(endX-Math.cos(l.angle+Math.PI/2)*l.width*spread,endY-Math.sin(l.angle+Math.PI/2)*l.width*spread);
    ctx.closePath();ctx.fill();

    // Soft core glow
    var coreGrad=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.width*0.5);
    coreGrad.addColorStop(0,'rgba('+r+','+g+','+b+','+(baseAlpha*2)+')');
    coreGrad.addColorStop(0.5,'rgba('+r+','+g+','+b+','+(baseAlpha*0.8)+')');
    coreGrad.addColorStop(1,'rgba('+r+','+g+','+b+',0)');
    ctx.fillStyle=coreGrad;
    ctx.beginPath();ctx.arc(l.x,l.y,l.width*0.5,0,Math.PI*2);ctx.fill();
  });
}

/* ===== 2. FLOATING PARTICLES (HAZE) ===== */
function drawParticles(t){
  particles.forEach(function(p){
    p.x+=p.speedX;
    p.y+=p.speedY;
    if(p.x<0)p.x+=W*1.2;
    if(p.x>W*1.1)p.x-=W*1.2;
    if(p.y<-H*0.1)p.y+=H*1.2;
    if(p.y>H*1.1)p.y-=H*1.2;

    var flicker=0.5+0.5*Math.sin(t*0.5+p.phase);
    var alpha=p.alpha*flicker*0.6;
    ctx.fillStyle='rgba(200,215,255,'+alpha+')';
    ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();

    // Glow
    var grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*3);
    grd.addColorStop(0,'rgba(200,215,255,'+(alpha*0.3)+')');
    grd.addColorStop(1,'rgba(200,215,255,0)');
    ctx.fillStyle=grd;
    ctx.beginPath();ctx.arc(p.x,p.y,p.size*3,0,Math.PI*2);ctx.fill();
  });
}

/* ===== 3. SCAN LINE + CORNERS ===== */
function drawScanLine(t){
  scanY+=0.4*scanDir;
  if(scanY>H||scanY<0)scanDir*=-1;

  var alpha=0.02+0.01*Math.sin(t*1.5);
  ctx.strokeStyle='rgba(100,180,255,'+alpha+')';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,scanY);ctx.lineTo(W,scanY);ctx.stroke();

  var grd=ctx.createRadialGradient(W/2,scanY,0,W/2,scanY,50);
  grd.addColorStop(0,'rgba(100,180,255,'+(alpha*0.15)+')');
  grd.addColorStop(1,'rgba(100,180,255,0)');
  ctx.fillStyle=grd;
  ctx.fillRect(0,scanY-50,W,100);

  // Corner brackets
  ctx.strokeStyle='rgba(100,180,255,0.04)';ctx.lineWidth=1;
  var m=24,cs=24;
  ctx.beginPath();ctx.moveTo(m,m+cs);ctx.lineTo(m,m);ctx.lineTo(m+cs,m);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W-m-cs,m);ctx.lineTo(W-m,m);ctx.lineTo(W-m,m+cs);ctx.stroke();
  ctx.beginPath();ctx.moveTo(m,H-m-cs);ctx.lineTo(m,H-m);ctx.lineTo(m+cs,H-m);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W-m-cs,H-m);ctx.lineTo(W-m,H-m);ctx.lineTo(W-m,H-m-cs);ctx.stroke();
}

/* ===== HORIZONTAL CAROUSEL ===== */
var track,viewport,prevBtn,nextBtn,dots=[],cardIndex=0,totalCards=0,isScrolling=false;

function initCarousel(){
  track=document.querySelector('.carousel-track');
  viewport=document.querySelector('.carousel-viewport');
  prevBtn=document.querySelector('.carousel-arrow.prev');
  nextBtn=document.querySelector('.carousel-arrow.next');
  if(!track||!viewport)return;

  var cards=track.querySelectorAll('.tool-card');
  totalCards=cards.length;
  if(totalCards===0)return;

  // Dots
  var dotsContainer=document.querySelector('.carousel-dots');
  if(dotsContainer){
    for(var i=0;i<totalCards;i++){
      var dot=document.createElement('button');
      dot.className='carousel-dot'+(i===0?' active':'');
      dot.setAttribute('aria-label','Go to card '+(i+1));
      (function(idx){dot.addEventListener('click',function(){goTo(idx)})})(i);
      dotsContainer.appendChild(dot);
      dots.push(dot);
    }
  }

  // Counter
  var counter=document.querySelector('.carousel-counter');
  if(counter)counter.textContent=(cardIndex+1)+' / '+totalCards;

  updateButtons();

  if(prevBtn)prevBtn.addEventListener('click',function(){goTo(cardIndex-1)});
  if(nextBtn)nextBtn.addEventListener('click',function(){goTo(cardIndex+1)});

  // Wheel
  viewport.addEventListener('wheel',function(e){
    if(e.deltaX!==0){
      e.preventDefault();
      if(isScrolling)return;
      isScrolling=true;
      setTimeout(function(){isScrolling=false},600);
      if(e.deltaX>0)goTo(cardIndex+1);
      else goTo(cardIndex-1);
    }
  },{passive:false});

  // Keyboard
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight')goTo(cardIndex+1);
    if(e.key==='ArrowLeft')goTo(cardIndex-1);
  });

  // Reposition on resize
  var resizeTimer;
  window.addEventListener('resize',function(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(function(){
      if(cardIndex>0){
        var c=track.querySelectorAll('.tool-card');
        var off=0;
        for(var i=0;i<cardIndex;i++)off+=c[i].offsetWidth+24;
        track.style.transform='translateX(-'+off+'px)';
      }
    },200);
  });

  // Drag scroll
  var isDragging=false,startX=0,scrollStart=0;
  viewport.addEventListener('mousedown',function(e){
    if(e.target.closest('.tool-card-action'))return;
    isDragging=true;
    startX=e.clientX;
    scrollStart=cardIndex;
    viewport.style.cursor='grabbing';
  });
  document.addEventListener('mousemove',function(e){
    if(!isDragging)return;
    var diff=(startX-e.clientX)/viewport.offsetWidth;
    if(Math.abs(diff)>0.12){
      isDragging=false;
      viewport.style.cursor='';
      if(diff>0)goTo(scrollStart+1);
      else goTo(scrollStart-1);
    }
  });
  document.addEventListener('mouseup',function(){if(isDragging){isDragging=false;viewport.style.cursor=''}});

  // Touch swipe
  var touchStartX=0,touchStartIdx=0;
  viewport.addEventListener('touchstart',function(e){
    if(e.target.closest('.tool-card-action'))return;
    touchStartX=e.touches[0].clientX;
    touchStartIdx=cardIndex;
  },{passive:true});
  viewport.addEventListener('touchmove',function(e){
    var diff=(touchStartX-e.touches[0].clientX)/viewport.offsetWidth;
    if(Math.abs(diff)>0.15){
      if(diff>0)goTo(touchStartIdx+1);
      else goTo(touchStartIdx-1);
    }
  },{passive:true});
}

function goTo(idx){
  if(idx<0||idx>=totalCards||isScrolling)return;
  isScrolling=true;
  cardIndex=idx;
  var cards=track.querySelectorAll('.tool-card');
  var offset=0;
  for(var i=0;i<idx;i++)offset+=cards[i].offsetWidth+24;
  track.style.transform='translateX(-'+offset+'px)';

  // Dots
  for(var i=0;i<dots.length;i++)dots[i].classList.toggle('active',i===cardIndex);

  // Counter
  var counter=document.querySelector('.carousel-counter');
  if(counter)counter.textContent=(cardIndex+1)+' / '+totalCards;

  updateButtons();

  setTimeout(function(){isScrolling=false},700);
}

function updateButtons(){
  if(prevBtn)prevBtn.disabled=cardIndex<=0;
  if(nextBtn)nextBtn.disabled=cardIndex>=totalCards-1;
}

/* ===== REVEAL ON SCROLL ===== */
function initReveal(){
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },{threshold:0.1});
    els.forEach(function(el){obs.observe(el)});
  }else{
    els.forEach(function(el){el.classList.add('visible')});
  }
}

/* ===== RIPPLE ===== */
document.querySelectorAll('.btn, .tool-card-action').forEach(function(b){
  b.addEventListener('click',function(e){
    var r=b.getBoundingClientRect();
    var s=Math.max(r.width,r.height);
    var x=e.clientX-r.left-s/2;
    var y=e.clientY-r.top-s/2;
    var sp=document.createElement('span');
    sp.className='ripple';
    sp.style.width=sp.style.height=s+'px';
    sp.style.left=x+'px';
    sp.style.top=y+'px';
    b.style.position='relative';b.style.overflow='hidden';
    b.appendChild(sp);
    sp.addEventListener('animationend',function(){sp.remove()});
  });
});

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded',function(){
  initCanvas();
  initCarousel();
  initReveal();
  document.body.classList.add('loaded');

  // Scroll to tools
  document.querySelectorAll('[data-scroll-to]').forEach(function(el){
    el.addEventListener('click',function(){
      var target=document.getElementById(el.getAttribute('data-scroll-to'));
      if(target)target.scrollIntoView({behavior:'smooth'});
    });
  });

  // Nav toggle
  var navToggle=document.getElementById('navToggle');
  var navLinks=document.querySelector('.nav-links');
  if(navToggle&&navLinks){
    navToggle.addEventListener('click',function(){navLinks.classList.toggle('open')});
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){navLinks.classList.remove('open')});
    });
  }
});

})();
