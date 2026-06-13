(function(){
'use strict';

/* ===== CANVAS BG: STAGE ROOF ===== */
var canvas,ctx,W,H,animId;
var stage={},fixtures=[],waveforms=[],scanY=0,scanDir=1;

function initCanvas(){
  canvas=document.getElementById('bgCanvas');
  if(!canvas)return;
  ctx=canvas.getContext('2d');
  resize();
  window.addEventListener('resize',debounce(resize,200));
  buildStage();
  buildFixtures();
  buildWaveforms();
  animate();
}

function resize(){
  W=canvas.width=window.innerWidth;
  H=canvas.height=window.innerHeight;
  scanY=0;
}

function debounce(fn,ms){var t;return function(){clearTimeout(t);t=setTimeout(fn,ms)}}

/* --- Build stage roof structure --- */
function buildStage(){
  var roofH=Math.min(H*0.25,150);
  var roofW=W;
  var trussRows=4;
  var trussCols=6;
  var colSpacing=roofW/(trussCols+1);
  var rowSpacing=roofH/(trussRows+1);

  stage={x:0,y:0,w:roofW,h:roofH,trussRows:trussRows,trussCols:trussCols,colSpacing:colSpacing,rowSpacing:rowSpacing,
    nodes:[],segments:[],verticalSegments:[]};

  // Create grid nodes
  for(var r=0;r<=trussRows;r++){
    for(var c=0;c<=trussCols;c++){
      var nx=c*colSpacing,ny=r*rowSpacing;
      stage.nodes.push({x:nx,y:ny,row:r,col:c});
    }
  }

  // Horizontal truss segments
  for(var hr=0;hr<=trussRows;hr++){
    for(var hc=0;hc<trussCols;hc++){
      stage.segments.push({
        x1:hc*colSpacing,y1:hr*rowSpacing,
        x2:(hc+1)*colSpacing,y2:hr*rowSpacing
      });
    }
  }

  // Vertical truss segments (cross members)
  for(var vc=0;vc<=trussCols;vc++){
    for(var vr=0;vr<trussRows;vr++){
      stage.segments.push({
        x1:vc*colSpacing,y1:vr*rowSpacing,
        x2:vc*colSpacing,y2:(vr+1)*rowSpacing
      });
    }
  }

  // Vertical support trusses (downstage legs)
  stage.verticalSegments=[];
  for(var sc=0;sc<=trussCols;sc+=2){
    var sx=sc*colSpacing;
    var topY=roofH;
    var botY=H*0.7+Math.random()*H*0.1;
    stage.verticalSegments.push({x:sx,y1:topY,y2:botY});
  }
}

/* --- Mount fixtures on truss --- */
function buildFixtures(){
  fixtures=[];
  var colors=['rgba(0,212,255','rgba(124,58,237','rgba(245,158,11','rgba(16,185,129','rgba(239,68,68','rgba(236,72,153'];
  var mountPoints=[
    {col:1,row:0},{col:2,row:0},{col:3,row:0},{col:4,row:0},{col:5,row:0},
    {col:1,row:1},{col:3,row:1},{col:5,row:1}
  ];
  for(var i=0;i<mountPoints.length;i++){
    var mp=mountPoints[i];
    var fx=mp.col*stage.colSpacing;
    var fy=mp.row*stage.rowSpacing;
    fixtures.push({
      x:fx,y:fy,
      angle:-Math.PI/4+Math.random()*Math.PI/2,
      targetAngle:-Math.PI/4+Math.random()*Math.PI/2,
      pivotTimer:Math.random()*5,
      color:colors[i%colors.length],
      intensity:0.9+Math.random()*0.3,
      beamWidth:0.03+Math.random()*0.02,
      row:mp.row,col:mp.col
    });
  }
}

/* --- Sound wave oscillators --- */
function buildWaveforms(){
  waveforms=[];
  for(var i=0;i<2;i++){
    waveforms.push({
      y:H*(0.55+i*0.2),
      speed:25+Math.random()*20,
      amp:18+Math.random()*20,
      freq:0.006+Math.random()*0.004,
      color:i===0?'rgba(0,212,255':'rgba(124,58,237'
    });
  }
}

function animate(){
  var t=Date.now()/1000;
  ctx.clearRect(0,0,W,H);

  drawPerspectiveGrid(t);
  drawStageRoof(t);
  drawLightBeams(t);
  drawWaveforms(t);
  drawScanLine(t);

  animId=requestAnimationFrame(animate);
}

/* ===== 1. PERSPECTIVE GRID ===== */
function drawPerspectiveGrid(t){
  var cx=W/2,cy=H/3;
  ctx.lineWidth=0.5;
  for(var i=-35;i<=35;i++){
    var angle=i*0.04+Math.sin(t*0.015)*0.005;
    var dx=Math.cos(angle+Math.PI/2)*W*0.7;
    var dy=Math.sin(angle+Math.PI/2)*W*0.5;
    var a=0.02+0.01*Math.sin(t*0.1+i*0.3);
    ctx.strokeStyle='rgba(255,255,255,'+a+')';
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+dx,cy+dy);ctx.stroke();
  }
  for(var j=1;j<25;j++){
    var f=j/25;
    var yPos=cy+(H-cy)*f*f;
    var a=0.01+f*0.025;
    ctx.strokeStyle='rgba(255,255,255,'+a+')';ctx.lineWidth=0.5+f*0.3;
    ctx.beginPath();ctx.moveTo(0,yPos);ctx.lineTo(W,yPos);ctx.stroke();
  }
}

/* ===== 2. STAGE ROOF TRUSS ===== */
function drawStageRoof(t){
  if(!stage.nodes)return;
  var cs=8; // chord spacing
  var ba=30; // bay length
  var alpha=0.14+0.03*Math.sin(t*0.3);

  // Draw horizontal truss segments
  ctx.globalAlpha=alpha;
  stage.segments.forEach(function(seg){
    drawTrussSegment(ctx,seg.x1,seg.y1,seg.x2,seg.y2,cs,ba,t);
  });

  // Draw vertical support legs
  ctx.strokeStyle='rgba(0,212,255,'+(alpha*0.5)+')';ctx.lineWidth=0.6;
  ctx.globalAlpha=alpha*0.5;
  stage.verticalSegments.forEach(function(vs){
    // Parallel chord legs
    var spread=4+Math.sin(t*0.5+vs.x)*2;
    ctx.beginPath();ctx.moveTo(vs.x-spread,vs.y1);ctx.lineTo(vs.x-spread,vs.y2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(vs.x+spread,vs.y1);ctx.lineTo(vs.x+spread,vs.y2);ctx.stroke();
    // Cross bracing
    var steps=Math.floor((vs.y2-vs.y1)/25);
    for(var s=0;s<steps;s++){
      var f1=s/steps,f2=(s+1)/steps;
      var y1=vs.y1+(vs.y2-vs.y1)*f1;
      var y2=vs.y1+(vs.y2-vs.y1)*f2;
      if(s%2===0){
        ctx.beginPath();ctx.moveTo(vs.x-spread,y1);ctx.lineTo(vs.x+spread,y2);ctx.stroke();
      }else{
        ctx.beginPath();ctx.moveTo(vs.x+spread,y1);ctx.lineTo(vs.x-spread,y2);ctx.stroke();
      }
    }
    // Floor mount
    ctx.fillStyle='rgba(0,212,255,'+(alpha*0.3)+')';
    ctx.strokeStyle='rgba(0,212,255,'+(alpha*0.6)+')';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(vs.x-8,vs.y2);ctx.lineTo(vs.x,vs.y2+6);ctx.lineTo(vs.x+8,vs.y2);ctx.closePath();ctx.fill();ctx.stroke();
  });
  ctx.globalAlpha=1;

  // Node glow on the grid
  stage.nodes.forEach(function(n){
    var pulse=0.5+0.5*Math.sin(t*0.6+n.x*0.01+n.y*0.02);
    var grd=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,5);
    grd.addColorStop(0,'rgba(0,212,255,'+(0.12*pulse)+')');
    grd.addColorStop(1,'rgba(0,212,255,0)');
    ctx.fillStyle=grd;
    ctx.beginPath();ctx.arc(n.x,n.y,5,0,Math.PI*2);ctx.fill();
  });
}

function drawTrussSegment(ctx,x1,y1,x2,y2,cs,ba,t){
  var lx=x2-x1,ly=y2-y1;
  var len=Math.sqrt(lx*lx+ly*ly);
  if(len<5)return;
  var nx=-ly/len*cs,ny=lx/len*cs;

  // Two chords
  ctx.strokeStyle='rgba(0,212,255,0.15)';ctx.lineWidth=0.6;
  ctx.beginPath();ctx.moveTo(x1+nx,y1+ny);ctx.lineTo(x2+nx,y2+ny);ctx.stroke();
  ctx.strokeStyle='rgba(124,58,237,0.12)';ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(x1-nx,y1-ny);ctx.lineTo(x2-nx,y2-ny);ctx.stroke();

  // Zigzag bracing
  var bays=Math.max(1,Math.round(len/ba));
  ctx.strokeStyle='rgba(0,212,255,0.08)';ctx.lineWidth=0.4;
  for(var b=0;b<bays;b++){
    var f1=b/bays,f2=(b+1)/bays;
    var xa=x1+lx*f1,ya=y1+ly*f1;
    var xb=x1+lx*f2,yb=y1+ly*f2;
    if(b%2===0){ctx.beginPath();ctx.moveTo(xa+nx,ya+ny);ctx.lineTo(xb-nx,yb-ny);ctx.stroke();}
    else{ctx.beginPath();ctx.moveTo(xa-nx,ya-ny);ctx.lineTo(xb+nx,yb+ny);ctx.stroke();}
  }

  // Vertical connectors at joints
  ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(x1+nx,y1+ny);ctx.lineTo(x1-nx,y1-ny);ctx.stroke();
}

/* ===== 3. LIGHT BEAMS FROM TRUSS ===== */
function drawLightBeams(t){
  fixtures.forEach(function(f,i){
    f.pivotTimer+=0.004;
    if(f.pivotTimer>3+i*0.2){
      f.targetAngle=-Math.PI/3+Math.random()*Math.PI*2/3;
      f.pivotTimer=0;
    }
    var diff=f.targetAngle-f.angle;
    while(diff>Math.PI)diff-=Math.PI*2;
    while(diff<-Math.PI)diff+=Math.PI*2;
    f.angle+=diff*0.012;

    var intensity=f.intensity*(0.6+0.4*Math.sin(t*0.35+i*1.2));

    var sx=f.x,sy=f.y;
    var beamLen=W*0.65;
    var ex=sx+Math.cos(f.angle)*beamLen;
    var ey=sy+Math.sin(f.angle)*beamLen;

    // Volumetric beam cone
    var w=f.beamWidth*beamLen*0.3*intensity;
    var grad=ctx.createRadialGradient(sx,sy,0,sx,sy,beamLen*0.4);
    grad.addColorStop(0,f.color+','+(0.1*intensity)+')');
    grad.addColorStop(0.2,f.color+','+(0.05*intensity)+')');
    grad.addColorStop(0.5,f.color+','+(0.02*intensity)+')');
    grad.addColorStop(1,f.color+',0)');
    ctx.fillStyle=grad;
    ctx.beginPath();ctx.moveTo(sx,sy);
    var spread=0.06*intensity;
    ctx.lineTo(ex+Math.cos(f.angle+Math.PI/2)*w*spread,ey+Math.sin(f.angle+Math.PI/2)*w*spread);
    ctx.lineTo(ex-Math.cos(f.angle+Math.PI/2)*w*spread,ey-Math.sin(f.angle+Math.PI/2)*w*spread);
    ctx.closePath();ctx.fill();

    // Bright core ray
    ctx.strokeStyle=f.color+','+(0.08*intensity)+')';ctx.lineWidth=2+3*intensity;
    ctx.beginPath();ctx.moveTo(sx,sy);
    var steps=25;
    for(var si=0;si<=steps;si++){
      var frac=si/steps;
      var px=sx+(ex-sx)*frac,py=sy+(ey-sy)*frac;
      var wb=Math.sin(frac*Math.PI*5+t*1.0+i)*w*0.3;
      ctx.lineTo(px+wb,py+Math.sin(frac*3+t*0.7+i)*w*0.3);
    }
    ctx.stroke();

    // Fixture head glow (mounted on truss)
    var glowR=10+20*intensity;
    var sgrd=ctx.createRadialGradient(sx,sy,0,sx,sy,glowR);
    sgrd.addColorStop(0,'rgba(255,255,255,'+(0.35*intensity)+')');
    sgrd.addColorStop(0.3,f.color+','+(0.12*intensity)+')');
    sgrd.addColorStop(1,f.color+',0)');
    ctx.fillStyle=sgrd;
    ctx.beginPath();ctx.arc(sx,sy,glowR,0,Math.PI*2);ctx.fill();

    // Short hanging cable from truss
    ctx.strokeStyle='rgba(255,255,255,0.02)';ctx.lineWidth=0.3;
    ctx.beginPath();ctx.moveTo(sx,sy-6);ctx.lineTo(sx,sy);ctx.stroke();
  });
}

/* ===== 4. TRAVELING WAVEFORMS ===== */
function drawWaveforms(t){
  waveforms.forEach(function(wf){
    var wfAlpha=wf.color.indexOf('255')>0?0.16:0.12;
    ctx.strokeStyle=wf.color+','+wfAlpha+')';ctx.lineWidth=1.5;
    ctx.beginPath();var first=true;
    for(var x=0;x<=W;x+=2){
      var y=wf.y+Math.sin(x*wf.freq-t*wf.speed*0.001)*wf.amp
           +Math.sin(x*wf.freq*2.3-t*wf.speed*0.0017)*wf.amp*0.4
           +Math.sin(x*wf.freq*0.5-t*wf.speed*0.0006)*wf.amp*0.6
           +Math.sin(x*wf.freq*3.7-t*wf.speed*0.0023)*wf.amp*0.2;
      if(first){ctx.moveTo(x,y);first=false;}else ctx.lineTo(x,y);
    }
    ctx.stroke();

    // Fill below
    ctx.lineTo(W,wf.y+wf.amp);ctx.lineTo(0,wf.y+wf.amp);ctx.closePath();
    ctx.fillStyle=wf.color+','+(0.02)+')';ctx.fill();
  });
}

/* ===== 5. SCAN LINE + HUD ===== */
function drawScanLine(t){
  scanY+=0.5*scanDir;
  if(scanY>H||scanY<0)scanDir*=-1;

  var alpha=0.03+0.02*Math.sin(t*1.5);
  ctx.strokeStyle='rgba(0,212,255,'+alpha+')';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,scanY);ctx.lineTo(W,scanY);ctx.stroke();

  var grd=ctx.createRadialGradient(W/2,scanY,0,W/2,scanY,60);
  grd.addColorStop(0,'rgba(0,212,255,'+(alpha*0.2)+')');
  grd.addColorStop(1,'rgba(0,212,255,0)');
  ctx.fillStyle=grd;
  ctx.fillRect(0,scanY-60,W,120);

  // Corners
  ctx.strokeStyle='rgba(0,212,255,0.06)';ctx.lineWidth=1;
  var m=20,cs=30;
  ctx.beginPath();ctx.moveTo(m,m+cs);ctx.lineTo(m,m);ctx.lineTo(m+cs,m);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W-m-cs,m);ctx.lineTo(W-m,m);ctx.lineTo(W-m,m+cs);ctx.stroke();
  ctx.beginPath();ctx.moveTo(m,H-m-cs);ctx.lineTo(m,H-m);ctx.lineTo(m+cs,H-m);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W-m-cs,H-m);ctx.lineTo(W-m,H-m);ctx.lineTo(W-m,H-m-cs);ctx.stroke();

  // HUD text
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
