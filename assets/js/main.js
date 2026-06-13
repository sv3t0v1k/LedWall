(function(){
'use strict';

/* ===== CANVAS BG: SCI-FI ENTERTAINMENT ===== */
var canvas,ctx,W,H,animId;
var heads=[],trusses=[],waveforms=[],eqData=[],scanY=0,scanDir=1;

function initCanvas(){
  canvas=document.getElementById('bgCanvas');
  if(!canvas)return;
  ctx=canvas.getContext('2d');
  resize();
  window.addEventListener('resize',debounce(resize,200));
  createHeads();
  createTrusses();
  createWaveforms();
  for(var i=0;i<60;i++)eqData.push(0);
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
  var colors=['rgba(0,212,255','rgba(124,58,237','rgba(245,158,11','rgba(16,185,129','rgba(239,68,68'];
  var positions=[[0.15,0.08],[0.35,0.05],[0.5,0.1],[0.65,0.05],[0.85,0.08]];
  for(var i=0;i<5;i++){
    heads.push({
      x:W*positions[i][0],y:H*positions[i][1],
      angle:-Math.PI/4+Math.random()*Math.PI/2,
      targetAngle:-Math.PI/4+Math.random()*Math.PI/2,
      pivotTimer:Math.random()*10,
      color:colors[i],
      intensity:0.8+Math.random()*0.4,
      beamWidth:0.03+Math.random()*0.03
    });
  }
}

/* --- Truss structures (ladder trusses) --- */
function createTrusses(){
  trusses=[];
  // Long horizontal truss runs
  for(var t=0;t<5;t++){
    var segCount=4+Math.floor(Math.random()*4);
    var startX=Math.random()*W*0.6+W*0.1;
    var startY=Math.random()*H*0.4+H*0.05;
    var angle=(Math.random()-0.5)*0.3;
    var chordSpacing=12+Math.random()*15;
    var bayLen=20+Math.random()*25;
    var segs=[];
    for(var s=0;s<segCount;s++){
      segs.push({
        x:startX+Math.cos(angle)*s*bayLen*segCount*0.5,
        y:startY+Math.sin(angle)*s*bayLen*segCount*0.5
      });
    }
    trusses.push({
      segs:segs,angle:angle,chordSpacing:chordSpacing,bayLen:bayLen,
      driftX:(Math.random()-0.5)*0.15,driftY:(Math.random()-0.5)*0.1,
      rotSpeed:(Math.random()-0.5)*0.002,
      phase:Math.random()*Math.PI*2,
      color:Math.random()>0.5?'#00d4ff':'#7c3aed',
      alpha:0.12+Math.random()*0.08
    });
  }
  // Vertical/support trusses
  for(var v=0;v<3;v++){
    var vSegs=[];
    var vx=W*(0.15+Math.random()*0.7);
    var vStartY=H*0.1;
    var vCount=3+Math.floor(Math.random()*3);
    for(var vs=0;vs<vCount;vs++){
      vSegs.push({x:vx+(Math.random()-0.5)*20,y:vStartY+vs*40+20});
    }
    trusses.push({
      segs:vSegs,angle:0,chordSpacing:10+Math.random()*8,bayLen:25+Math.random()*15,
      driftX:(Math.random()-0.5)*0.05,driftY:(Math.random()-0.5)*0.1,
      rotSpeed:0,phase:Math.random()*Math.PI*2,
      color:'#00d4ff',alpha:0.08+Math.random()*0.04
    });
  }
}

/* --- Traveling waveform --- */
function createWaveforms(){
  waveforms=[];
  for(var i=0;i<2;i++){
    waveforms.push({
      y:H*(0.55+i*0.18),
      speed:20+Math.random()*15,
      amp:15+Math.random()*25,
      freq:0.008+Math.random()*0.005,
      color:i===0?'rgba(0,212,255':'rgba(124,58,237'
    });
  }
}

function animate(){
  var t=Date.now()/1000;
  ctx.clearRect(0,0,W,H);

  // 1. Perspective grid
  drawPerspectiveGrid(t);
  // 2. Truss structures
  drawTrusses(t);
  // 3. Light beams from moving heads
  drawLightBeams(t);
  // 4. Traveling waveform
  drawWaveforms(t);
  // 5. Equalizer
  drawEqualizer(t);
  // 6. Scan line
  drawScanLine(t);

  animId=requestAnimationFrame(animate);
}

/* ===== 1. PERSPECTIVE GRID ===== */
function drawPerspectiveGrid(t){
  var cx=W/2,cy=H/3;
  var nLines=35;

  // Radial
  ctx.lineWidth=0.5;
  for(var i=-nLines;i<=nLines;i++){
    var angle=i*0.04+Math.sin(t*0.015)*0.005;
    var dx=Math.cos(angle+Math.PI/2)*W*0.7;
    var dy=Math.sin(angle+Math.PI/2)*W*0.5;
    var a=0.02+0.01*Math.sin(t*0.1+i*0.3);
    ctx.strokeStyle='rgba(255,255,255,'+a+')';
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+dx,cy+dy);ctx.stroke();
  }

  // Horizontal
  for(var j=1;j<25;j++){
    var f=j/25;
    var yPos=cy+(H-cy)*f*f;
    var a=0.01+f*0.025;
    ctx.strokeStyle='rgba(255,255,255,'+a+')';ctx.lineWidth=0.5+f*0.3;
    ctx.beginPath();ctx.moveTo(0,yPos);ctx.lineTo(W,yPos);ctx.stroke();
  }
}

/* ===== 2. TRUSS STRUCTURES ===== */
function drawTrusses(t){
  trusses.forEach(function(tr){
    var segs=tr.segs;
    if(segs.length<2)return;

    // Drift
    var dx=Math.sin(t*0.1+tr.phase)*tr.driftX*3;
    var dy=Math.cos(t*0.1+tr.phase)*tr.driftY*3;
    var rot=tr.rotSpeed*t;

    for(var i=0;i<segs.length-1;i++){
      var p1=segs[i],p2=segs[i+1];

      // Apply drift + rotation
      var cosR=Math.cos(rot),sinR=Math.sin(rot);
      var cx2=(p1.x+p2.x)/2,cy2=(p1.y+p2.y)/2;

      var ax1=(p1.x-cx2)*cosR-(p1.y-cy2)*sinR+cx2+dx;
      var ay1=(p1.x-cx2)*sinR+(p1.y-cy2)*cosR+cy2+dy;
      var ax2=(p2.x-cx2)*cosR-(p2.y-cy2)*sinR+cx2+dx;
      var ay2=(p2.x-cx2)*sinR+(p2.y-cy2)*cosR+cy2+dy;

      // Direction vector
      var lx=ax2-ax1,ly=ay2-ay1;
      var len=Math.sqrt(lx*lx+ly*ly);
      if(len<1)continue;
      var nx=-ly/len*tr.chordSpacing,ny=lx/len*tr.chordSpacing;

      // Two chords (upper and lower)
      ctx.strokeStyle=tr.color;ctx.lineWidth=0.8;
      ctx.globalAlpha=tr.alpha;
      ctx.beginPath();ctx.moveTo(ax1+nx,ay1+ny);ctx.lineTo(ax2+nx,ay2+ny);ctx.stroke();
      ctx.beginPath();ctx.moveTo(ax1-nx,ay1-ny);ctx.lineTo(ax2-nx,ay2-ny);ctx.stroke();

      // Zigzag bracing between chords
      var bays=Math.max(1,Math.round(len/tr.bayLen));
      for(var b=0;b<bays;b++){
        var f1=b/bays,f2=(b+1)/bays;
        var x1=ax1+(ax2-ax1)*f1,y1=ay1+(ay2-ay1)*f1;
        var x2=ax1+(ax2-ax1)*f2,y2=ay1+(ay2-ay1)*f2;
        // Alternate zigzag
        if(b%2===0){
          ctx.beginPath();ctx.moveTo(x1+nx,y1+ny);ctx.lineTo(x2-nx,y2-ny);ctx.stroke();
        }else{
          ctx.beginPath();ctx.moveTo(x1-nx,y1-ny);ctx.lineTo(x2+nx,y2+ny);ctx.stroke();
        }
      }

      // Node connectors (vertical bars at segment joints)
      ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=0.5;
      ctx.globalAlpha=tr.alpha*0.6;
      ctx.beginPath();ctx.moveTo(ax1+nx,ay1+ny);ctx.lineTo(ax1-nx,ay1-ny);ctx.stroke();

      // Node glow at each joint
      var pulse=0.5+0.5*Math.sin(t*0.5+i+tr.phase);
      ctx.globalAlpha=tr.alpha*pulse*0.8;
      ctx.fillStyle=tr.color;
      ctx.beginPath();ctx.arc(ax1,ay1,2+pulse*2,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;

    // Final node
    var last=segs[segs.length-1];
    var pl=segs[segs.length-2];
    var cosR2=Math.cos(rot),sinR2=Math.sin(rot);
    var cx3=(pl.x+last.x)/2,cy3=(pl.y+last.y)/2;
    var lx2=(last.x-pl.x),ly2=(last.y-pl.y);
    var len2=Math.sqrt(lx2*lx2+ly2*ly2);
    var nx2=len2>0?-ly2/len2*tr.chordSpacing:0;
    var ny2=len2>0?lx2/len2*tr.chordSpacing:0;
    var axL=(last.x-cx3)*cosR2-(last.y-cy3)*sinR2+cx3+dx;
    var ayL=(last.x-cx3)*sinR2+(last.y-cy3)*cosR2+cy3+dy;
    ctx.globalAlpha=tr.alpha;
    ctx.fillStyle=tr.color;
    ctx.beginPath();ctx.arc(axL,ayL,2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=0.5;
    ctx.globalAlpha=tr.alpha*0.6;
    ctx.beginPath();ctx.moveTo(axL+nx2,ayL+ny2);ctx.lineTo(axL-nx2,ayL-ny2);ctx.stroke();
    ctx.globalAlpha=1;
  });
}

/* ===== 3. LIGHT BEAMS ===== */
function drawLightBeams(t){
  for(var hi=0;hi<heads.length;hi++){
    var h=heads[hi];
    h.pivotTimer+=0.005;
    if(h.pivotTimer>2.5+hi*0.3){
      h.targetAngle=-Math.PI/3+Math.random()*Math.PI*2/3;
      h.pivotTimer=0;
    }
    var diff=h.targetAngle-h.angle;
    while(diff>Math.PI)diff-=Math.PI*2;
    while(diff<-Math.PI)diff+=Math.PI*2;
    h.angle+=diff*0.015;

    var intensity=h.intensity*(0.6+0.4*Math.sin(t*0.4+hi*1.3));

    var sx=h.x,sy=h.y;
    var beamLen=W*0.7;
    var ex=sx+Math.cos(h.angle)*beamLen;
    var ey=sy+Math.sin(h.angle)*beamLen;

    // Bright volumetric cone
    var w=h.beamWidth*beamLen*0.3*intensity;
    var grad=ctx.createRadialGradient(sx,sy,0,sx,sy,beamLen*0.5);
    grad.addColorStop(0,h.color+','+(0.08*intensity)+')');
    grad.addColorStop(0.2,h.color+','+(0.04*intensity)+')');
    grad.addColorStop(0.5,h.color+','+(0.015*intensity)+')');
    grad.addColorStop(1,h.color+',0)');
    ctx.fillStyle=grad;
    ctx.beginPath();ctx.moveTo(sx,sy);
    var spread=0.08*intensity;
    ctx.lineTo(ex+Math.cos(h.angle+Math.PI/2)*w*spread,ey+Math.sin(h.angle+Math.PI/2)*w*spread);
    ctx.lineTo(ex-Math.cos(h.angle+Math.PI/2)*w*spread,ey-Math.sin(h.angle+Math.PI/2)*w*spread);
    ctx.closePath();ctx.fill();

    // Core ray (bright center)
    ctx.strokeStyle=h.color+','+(0.07*intensity)+')';ctx.lineWidth=2+4*intensity;
    ctx.beginPath();ctx.moveTo(sx,sy);
    var steps=25;
    for(var si=0;si<=steps;si++){
      var frac=si/steps;
      var px=sx+(ex-sx)*frac,py=sy+(ey-sy)*frac;
      var wb=Math.sin(frac*Math.PI*5+t*1.2+hi)*w*0.3;
      ctx.lineTo(px+wb,py+Math.sin(frac*3+t*0.8+hi)*w*0.3);
    }
    ctx.stroke();

    // Source glow (fixture head)
    var glowR=15+25*intensity;
    var sgrd=ctx.createRadialGradient(sx,sy,0,sx,sy,glowR);
    sgrd.addColorStop(0,'rgba(255,255,255,'+(0.4*intensity)+')');
    sgrd.addColorStop(0.3,h.color+','+(0.15*intensity)+')');
    sgrd.addColorStop(1,h.color+',0)');
    ctx.fillStyle=sgrd;
    ctx.beginPath();ctx.arc(sx,sy,glowR,0,Math.PI*2);ctx.fill();
  }
}

/* ===== 4. TRAVELING WAVEFORM ===== */
function drawWaveforms(t){
  waveforms.forEach(function(wf){
    var wfAlpha=wf.color.indexOf('255')>0?0.14:0.1;
    ctx.strokeStyle=wf.color+','+wfAlpha+')';
    ctx.lineWidth=1.5;
    ctx.beginPath();
    var first=true;
    for(var x=0;x<=W;x+=2){
      var y=wf.y+Math.sin(x*wf.freq-t*wf.speed*0.001)*wf.amp
           +Math.sin(x*wf.freq*2.3-t*wf.speed*0.0017)*wf.amp*0.4
           +Math.sin(x*wf.freq*0.5-t*wf.speed*0.0006)*wf.amp*0.6;
      if(first){ctx.moveTo(x,y);first=false;}else ctx.lineTo(x,y);
    }
    ctx.stroke();

    // Fill below waveform
    ctx.strokeStyle=wf.color+','+(0.03)+')';
    ctx.lineTo(W,wf.y+wf.amp);ctx.lineTo(0,wf.y+wf.amp);ctx.closePath();
    ctx.fillStyle=wf.color+','+(0.015)+')';
    ctx.fill();
  });
}

/* ===== 5. EQUALIZER ===== */
function drawEqualizer(t){
  var count=60;
  var barW=Math.min(W/count,6);
  var totalW=count*barW;
  var startX=(W-totalW)/2;
  var baseY=H-25;

  // Smooth EQ data
  for(var i=0;i<count;i++){
    var target=(Math.sin(t*1.8+i*0.4)*0.5+0.5)
              *(Math.sin(t*2.3+i*1.1)*0.5+0.5)
              *(Math.sin(t*1.1+i*0.7)*0.5+0.5);
    eqData[i]=eqData[i]*0.85+target*0.15;
  }

  for(var bi=0;bi<count;bi++){
    var h=Math.max(2,eqData[bi]*35);
    var alpha=0.04+h*0.004;
    // Gradient from cyan to purple for higher bars
    var r=Math.round(0+eqData[bi]*124);
    var g=Math.round(212*(1-eqData[bi]*0.5));
    var b=Math.round(255-eqData[bi]*50);
    ctx.fillStyle='rgba('+r+','+g+','+b+','+alpha+')';
    ctx.fillRect(startX+bi*barW,baseY-h,barW-1,h);

    // Light dot at top
    ctx.fillStyle='rgba(0,212,255,'+(alpha*0.5)+')';
    ctx.fillRect(startX+bi*barW,baseY-h-1,barW-1,1);
  }
}

/* ===== 6. SCAN LINE ===== */
function drawScanLine(t){
  scanY+=0.5*scanDir;
  if(scanY>H||scanY<0)scanDir*=-1;

  var alpha=0.03+0.02*Math.sin(t*1.5);
  ctx.strokeStyle='rgba(0,212,255,'+alpha+')';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,scanY);ctx.lineTo(W,scanY);ctx.stroke();

  // Glow
  var grd=ctx.createRadialGradient(W/2,scanY,0,W/2,scanY,60);
  grd.addColorStop(0,'rgba(0,212,255,'+(alpha*0.2)+')');
  grd.addColorStop(1,'rgba(0,212,255,0)');
  ctx.fillStyle=grd;
  ctx.fillRect(0,scanY-60,W,120);

  // Corner brackets
  var m=20;
  ctx.strokeStyle='rgba(0,212,255,0.06)';ctx.lineWidth=1;
  var cs=30;
  ctx.beginPath();ctx.moveTo(m,m+cs);ctx.lineTo(m,m);ctx.lineTo(m+cs,m);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W-m-cs,m);ctx.lineTo(W-m,m);ctx.lineTo(W-m,m+cs);ctx.stroke();
  ctx.beginPath();ctx.moveTo(m,H-m-cs);ctx.lineTo(m,H-m);ctx.lineTo(m+cs,H-m);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W-m-cs,H-m);ctx.lineTo(W-m,H-m);ctx.lineTo(W-m,H-m-cs);ctx.stroke();

  // HUD text (subtle)
  ctx.fillStyle='rgba(0,212,255,0.03)';ctx.font='9px monospace';ctx.textAlign='left';
  var lines=['SYS>STAGE.LIVE','GRID>ACTIVE','TRUSS>STABLE','DMX>SYNCED'];
  lines.forEach(function(l,i){ctx.fillText(l,m+cs+8,m+14+i*14);});
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
