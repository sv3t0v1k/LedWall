(function(){
'use strict';

/* ===== CANVAS BG: SCI-FI ENTERTAINMENT ===== */
var canvas,ctx,W,H,animId;
var heads=[],trusses=[],waves=[],scanY=0,scanDir=1;

function initCanvas(){
  canvas=document.getElementById('bgCanvas');
  if(!canvas)return;
  ctx=canvas.getContext('2d');
  resize();
  window.addEventListener('resize',debounce(resize,200));
  createHeads();
  createTrusses();
  createWaves();
  animate();
}

function resize(){
  W=canvas.width=window.innerWidth;
  H=canvas.height=window.innerHeight;
  scanY=0;
}

function debounce(fn,ms){var t;return function(){clearTimeout(t);t=setTimeout(fn,ms)}}

/* --- Moving heads (light beams) --- */
function createHeads(){
  heads=[];
  var colors=['rgba(0,212,255','rgba(124,58,237','rgba(245,158,11','rgba(16,185,129'];
  for(var i=0;i<5;i++){
    heads.push({
      x:Math.random()*W*0.6+W*0.2,
      y:Math.random()*H*0.15,
      angle:Math.random()*Math.PI*2,
      targetAngle:Math.random()*Math.PI*2,
      speed:0.005+Math.random()*0.01,
      turnTimer:0,
      color:colors[i%4],
      beamLen:0.5+Math.random()*0.6,
      beamWidth:0.02+Math.random()*0.04,
      intensity:0.5+Math.random()*0.5
    });
  }
}

/* --- Truss segments --- */
function createTrusses(){
  trusses=[];
  for(var i=0;i<12;i++){
    trusses.push({
      x:Math.random()*W*1.2-W*0.1,
      y:Math.random()*H*0.8+H*0.1,
      size:30+Math.random()*60,
      angle:Math.random()*Math.PI*2,
      rotSpeed:(Math.random()-0.5)*0.005,
      driftX:(Math.random()-0.5)*0.2,
      driftY:(Math.random()-0.5)*0.2
    });
  }
}

/* --- Sound wave rings --- */
function createWaves(){
  waves=[];
  for(var i=0;i<3;i++){
    waves.push({
      x:Math.random()*W*0.6+W*0.2,
      y:H*0.7+Math.random()*H*0.25,
      phase:Math.random()*Math.PI*2,
      speed:0.3+Math.random()*0.4,
      interval:3+Math.random()*4
    });
  }
}

function animate(){
  var t=Date.now()/1000;
  ctx.clearRect(0,0,W,H);

  // 1. Perspective grid (stage floor)
  drawPerspectiveGrid(t);

  // 2. Truss segments
  drawTrusses(t);

  // 3. Light beams from moving heads
  drawLightBeams(t);

  // 4. Sound waves
  drawSoundWaves(t);

  // 5. Equalizer bars
  drawEqualizer(t);

  // 6. HUD scan line
  drawScanLine(t);

  animId=requestAnimationFrame(animate);
}

/* ===== 1. PERSPECTIVE GRID ===== */
function drawPerspectiveGrid(t){
  var cx=W/2,cy=H/2;
  var nLines=30;
  ctx.lineWidth=0.5;

  // Radial lines from vanishing point
  for(var i=-nLines;i<=nLines;i++){
    var angle=i*0.04+Math.sin(t*0.02)*0.003;
    var dx=Math.cos(angle+Math.PI/2)*W;
    var dy=Math.sin(angle+Math.PI/2)*W;
    ctx.strokeStyle='rgba(255,255,255,'+(0.01+Math.sin(t*0.1+i*0.5)*0.005)+')';
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+dx,cy+dy);ctx.stroke();
  }

  // Horizontal lines getting closer to VP
  for(var j=1;j<20;j++){
    var f=j/20;
    var yPos=cy+(H-cy)*f*f*0.8;
    ctx.strokeStyle='rgba(255,255,255,'+(0.01+f*0.015)+')';
    ctx.beginPath();ctx.moveTo(0,yPos);ctx.lineTo(W,yPos);ctx.stroke();
  }

  // Subtle pulse at vanishing point
  var pulse=0.5+0.5*Math.sin(t*0.5);
  var grd=ctx.createRadialGradient(cx,cy,0,cx,cy,40+20*pulse);
  grd.addColorStop(0,'rgba(0,212,255,'+(0.08*pulse)+')');
  grd.addColorStop(1,'rgba(0,212,255,0)');
  ctx.fillStyle=grd;
  ctx.beginPath();ctx.arc(cx,cy,40+20*pulse,0,Math.PI*2);ctx.fill();
}

/* ===== 2. TRUSS LATTICE ===== */
function drawTrusses(t){
  trusses.forEach(function(tr){
    tr.angle+=tr.rotSpeed;
    tr.x+=tr.driftX*Math.sin(t*0.1+tr.x)*0.3;
    tr.y+=tr.driftY*Math.cos(t*0.1+tr.y)*0.3;

    var s=tr.size;
    var cx2=tr.x,cy2=tr.y;
    var a=tr.angle;

    // Main truss triangle
    var pts=[
      {x:cx2+Math.cos(a)*s,y:cy2+Math.sin(a)*s},
      {x:cx2+Math.cos(a+2.094)*s,y:cy2+Math.sin(a+2.094)*s},
      {x:cx2+Math.cos(a+4.188)*s,y:cy2+Math.sin(a+4.188)*s}
    ];

    var alpha=0.02+Math.sin(t*0.2+tr.x)*0.02;
    ctx.strokeStyle='rgba(0,212,255,'+alpha+')';ctx.lineWidth=0.5;

    // Triangle edges
    for(var i=0;i<3;i++){
      var j=(i+1)%3;
      ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();
      // Cross-bracing (midpoint to opposite vertex)
      var mx=(pts[i].x+pts[j].x)/2,my=(pts[i].y+pts[j].y)/2;
      ctx.strokeStyle='rgba(124,58,237,'+(alpha*0.5)+')';
      ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(pts[(i+2)%3].x,pts[(i+2)%3].y);ctx.stroke();
    }

    // Node glow at vertices
    for(var vi=0;vi<3;vi++){
      var nodePulse=0.5+0.5*Math.sin(t*0.8+vi+tr.x);
      var grd=ctx.createRadialGradient(pts[vi].x,pts[vi].y,0,pts[vi].x,pts[vi].y,6);
      grd.addColorStop(0,'rgba(0,212,255,'+(0.06*nodePulse)+')');
      grd.addColorStop(1,'rgba(0,212,255,0)');
      ctx.fillStyle=grd;
      ctx.beginPath();ctx.arc(pts[vi].x,pts[vi].y,6,0,Math.PI*2);ctx.fill();
    }
  });
}

/* ===== 3. LIGHT BEAMS ===== */
function drawLightBeams(t){
  heads.forEach(function(h,i){
    // Turn towards target, change target occasionally
    h.turnTimer+=0.005;
    if(h.turnTimer>1){
      h.targetAngle=Math.random()*Math.PI*2;
      h.turnTimer=0;
    }
    var diff=h.targetAngle-h.angle;
    while(diff>Math.PI)diff-=Math.PI*2;
    while(diff<-Math.PI)diff+=Math.PI*2;
    h.angle+=diff*0.02;

    // Intensity wobble
    var intensity=h.intensity*(0.7+0.3*Math.sin(t*0.3+i*1.7));

    var startX=h.x,startY=h.y;
    var endX=startX+Math.cos(h.angle)*W*0.6;
    var endY=startY+Math.sin(h.angle)*W*0.6;

    // Volumetric beam
    var grad=ctx.createRadialGradient(startX,startY,0,startX,startY,W*0.4);
    grad.addColorStop(0,h.color+','+(0.03*intensity)+')');
    grad.addColorStop(0.3,h.color+','+(0.015*intensity)+')');
    grad.addColorStop(0.6,h.color+','+(0.005*intensity)+')');
    grad.addColorStop(1,h.color+',0)');

    // Beam as wide cone
    ctx.fillStyle=grad;
    ctx.beginPath();
    ctx.moveTo(startX,startY);
    var w=h.beamWidth*W*0.2*intensity;
    ctx.lineTo(endX+w*1.5,endY);
    ctx.lineTo(endX-w*1.5,endY);
    ctx.closePath();ctx.fill();

    // Beam core (brighter center line)
    ctx.strokeStyle=h.color+','+(0.04*intensity)+')';ctx.lineWidth=1+w*0.5;
    ctx.beginPath();ctx.moveTo(startX,startY);
    var steps=20;
    for(var si=0;si<=steps;si++){
      var frac=si/steps;
      var px=startX+(endX-startX)*frac,py=startY+(endY-startY)*frac;
      var wobble=Math.sin(frac*Math.PI*3+t*0.8+i)*w*2;
      ctx.lineTo(px+wobble,py+Math.sin(frac*2+t*0.5+i)*w*2);
    }
    ctx.stroke();

    // Light source glow
    var srcGrd=ctx.createRadialGradient(startX,startY,0,startX,startY,30);
    srcGrd.addColorStop(0,'rgba(255,255,255,'+(0.15*intensity)+')');
    srcGrd.addColorStop(0.5,h.color+','+(0.05*intensity)+')');
    srcGrd.addColorStop(1,h.color+',0)');
    ctx.fillStyle=srcGrd;
    ctx.beginPath();ctx.arc(startX,startY,30,0,Math.PI*2);ctx.fill();
  });
}

/* ===== 4. SOUND WAVES ===== */
function drawSoundWaves(t){
  waves.forEach(function(w){
    var age=t*w.speed+w.phase;
    var radius=((age*30)%(Math.min(W,H)*0.5));
    var alpha=0.03*(1-radius/(Math.min(W,H)*0.5));

    ctx.strokeStyle='rgba(0,212,255,'+alpha+')';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(w.x,w.y,radius,0,Math.PI*2);ctx.stroke();

    // Second harmonic
    ctx.strokeStyle='rgba(124,58,237,'+(alpha*0.5)+')';
    ctx.beginPath();ctx.arc(w.x+5,w.y-5,radius*0.7,0,Math.PI*2);ctx.stroke();
  });
}

/* ===== 5. EQUALIZER ===== */
function drawEqualizer(t){
  var barCount=50;
  var barW=Math.min(W/barCount,8);
  var totalW=barCount*barW;
  var startX=(W-totalW)/2;
  var baseY=H-30;

  for(var i=0;i<barCount;i++){
    var freq=(i+1)*0.5;
    var height=Math.max(0,Math.sin(t*2+i*0.3)*Math.sin(t*1.3+i*0.7)*Math.sin(t*0.7+i*1.1));
    height=(height+1)*10+Math.random()*5;
    var alpha=0.02+height*0.002;
    ctx.fillStyle='rgba(0,212,255,'+alpha+')';
    ctx.fillRect(startX+i*barW,baseY-height,barW-1,height);
  }
}

/* ===== 6. HUD SCAN LINE ===== */
function drawScanLine(t){
  scanY+=0.3*scanDir;
  if(scanY>H||scanY<0)scanDir*=-1;

  var alpha=0.015+0.01*Math.sin(t*2);
  ctx.strokeStyle='rgba(0,212,255,'+alpha+')';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,scanY);ctx.lineTo(W,scanY);ctx.stroke();

  // Scan line glow
  var grd=ctx.createRadialGradient(W/2,scanY,0,W/2,scanY,40);
  grd.addColorStop(0,'rgba(0,212,255,'+(alpha*0.3)+')');
  grd.addColorStop(1,'rgba(0,212,255,0)');
  ctx.fillStyle=grd;
  ctx.fillRect(0,scanY-40,W,80);

  // Corner brackets (sci-fi HUD)
  var m=20;
  ctx.strokeStyle='rgba(0,212,255,0.04)';ctx.lineWidth=1;
  var cs=25;
  // TL
  ctx.beginPath();ctx.moveTo(m,m+cs);ctx.lineTo(m,m);ctx.lineTo(m+cs,m);ctx.stroke();
  // TR
  ctx.beginPath();ctx.moveTo(W-m-cs,m);ctx.lineTo(W-m,m);ctx.lineTo(W-m,m+cs);ctx.stroke();
  // BL
  ctx.beginPath();ctx.moveTo(m,H-m-cs);ctx.lineTo(m,H-m);ctx.lineTo(m+cs,H-m);ctx.stroke();
  // BR
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
});

})();
