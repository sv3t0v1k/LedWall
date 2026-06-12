(function(){
'use strict';

/* ===== CANVAS BG: GEOMETRIC LINES ===== */
var canvas,ctx,W,H,nodes=[],beams=[],animId;

function initCanvas(){
  canvas=document.getElementById('bgCanvas');
  if(!canvas)return;
  ctx=canvas.getContext('2d');
  resize();
  window.addEventListener('resize',debounce(resize,200));
  createNodes();
  createBeams();
  animate();
}

function resize(){
  W=canvas.width=window.innerWidth;
  H=canvas.height=window.innerHeight;
}

function debounce(fn,ms){var t;return function(){clearTimeout(t);t=setTimeout(fn,ms)}}

function createNodes(){
  var spacing=Math.max(80,Math.min(W,H)*0.12);
  var cols=Math.ceil(W/spacing)+2,rows=Math.ceil(H/spacing)+2;
  var offsetX=(W-cols*spacing)/2,offsetY=(H-rows*spacing)/2;
  nodes=[];
  for(var r=-1;r<=rows+1;r++)for(var c=-1;c<=cols+1;c++){
    nodes.push({
      bx:offsetX+c*spacing,
      by:offsetY+r*spacing,
      ox:(Math.random()-0.5)*spacing*0.3,
      oy:(Math.random()-0.5)*spacing*0.3,
      phase:Math.random()*Math.PI*2,
      speed:0.2+Math.random()*0.4
    });
  }
}

function createBeams(){
  beams=[];
  for(var i=0;i<3;i++){
    beams.push({
      angle:Math.random()*Math.PI*2,
      speed:0.003+Math.random()*0.005,
      len:0.3+Math.random()*0.4,
      width:0.02+Math.random()*0.03
    });
  }
}

function getNodePos(n,t){
  return{
    x:n.bx+n.ox*(0.5+0.5*Math.sin(t*n.speed+n.phase)),
    y:n.by+n.oy*(0.5+0.5*Math.sin(t*n.speed*0.7+n.phase*1.3))
  };
}

function animate(){
  var t=Date.now()/1000;
  ctx.clearRect(0,0,W,H);

  // Grid lines
  ctx.strokeStyle='rgba(255,255,255,0.015)';
  ctx.lineWidth=1;
  for(var i=0;i<nodes.length;i++){
    var n=nodes[i];
    for(var j=i+1;j<nodes.length;j++){
      var n2=nodes[j];
      if(Math.abs(n.bx-n2.bx)<200&&Math.abs(n.by-n2.by)<200){
        var p1=getNodePos(n,t),p2=getNodePos(n2,t);
        var d=Math.hypot(p2.x-p1.x,p2.y-p1.y);
        if(d<200){
          var a=Math.max(0,1-d/200)*0.3;
          ctx.globalAlpha=a*0.15;
          ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
        }
      }
    }
  }
  ctx.globalAlpha=1;

  // Structural lines (stronger)
  ctx.strokeStyle='rgba(0,212,255,0.04)';
  ctx.lineWidth=0.5;
  for(var r=0;r<6;r++){
    var yFrac=(r/5);
    var yPos=yFrac*H;
    ctx.beginPath();ctx.moveTo(0,yPos);
    for(var x=0;x<=W;x+=10){
      var wave=Math.sin(x*0.008+t*0.1+r)*8;
      ctx.lineTo(x,yPos+wave);
    }
    ctx.stroke();
  }

  // Light beams
  for(var bi=0;bi<beams.length;bi++){
    var b=beams[bi];
    b.angle+=b.speed;
    var sx=W/2+Math.cos(b.angle)*W*0.5;
    var sy=H/2+Math.sin(b.angle)*H*0.3;
    var ex=W/2+Math.cos(b.angle+b.len)*W*0.5;
    var ey=H/2+Math.sin(b.angle+b.len)*H*0.3;
    var grad=ctx.createLinearGradient(sx,sy,ex,ey);
    grad.addColorStop(0,'rgba(0,212,255,0)');
    grad.addColorStop(0.3,'rgba(0,212,255,0.02)');
    grad.addColorStop(0.5,'rgba(0,212,255,0.04)');
    grad.addColorStop(0.7,'rgba(0,212,255,0.02)');
    grad.addColorStop(1,'rgba(0,212,255,0)');
    ctx.strokeStyle=grad;
    ctx.lineWidth=Math.abs(b.width*H);
    ctx.beginPath();ctx.moveTo(sx,sy);
    var steps=30;
    for(var si=0;si<=steps;si++){
      var frac=si/steps;
      var px=sx+(ex-sx)*frac,py=sy+(ey-sy)*frac;
      var wobble=Math.sin(frac*Math.PI*4+t*0.5+bi)*15;
      ctx.lineTo(px,py+wobble);
    }
    ctx.stroke();
  }

  // Glowing nodes
  for(var ni=0;ni<nodes.length;ni++){
    var p=getNodePos(nodes[ni],t);
    var size=1+Math.sin(t*nodes[ni].speed+nodes[ni].phase)*0.5;
    var grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,size*4);
    grd.addColorStop(0,'rgba(0,212,255,'+(0.15+Math.sin(t*nodes[ni].speed+nodes[ni].phase)*0.08)+')');
    grd.addColorStop(1,'rgba(0,212,255,0)');
    ctx.fillStyle=grd;
    ctx.beginPath();ctx.arc(p.x,p.y,size*4,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle='rgba(255,255,255,'+(0.03+Math.sin(t*nodes[ni].speed+nodes[ni].phase)*0.02)+')';
    ctx.beginPath();ctx.arc(p.x,p.y,size,0,Math.PI*2);
    ctx.fill();
  }

  // Corner markers (blueprint style)
  var margin=30;
  ctx.strokeStyle='rgba(0,212,255,0.06)';
  ctx.lineWidth=1;
  var cm=12;
  // TL
  ctx.beginPath();ctx.moveTo(margin,margin+cm);ctx.lineTo(margin,margin);ctx.lineTo(margin+cm,margin);ctx.stroke();
  // TR
  ctx.beginPath();ctx.moveTo(W-margin-cm,margin);ctx.lineTo(W-margin,margin);ctx.lineTo(W-margin,margin+cm);ctx.stroke();
  // BL
  ctx.beginPath();ctx.moveTo(margin,H-margin-cm);ctx.lineTo(margin,H-margin);ctx.lineTo(margin+cm,H-margin);ctx.stroke();
  // BR
  ctx.beginPath();ctx.moveTo(W-margin-cm,H-margin);ctx.lineTo(W-margin,H-margin);ctx.lineTo(W-margin,H-margin-cm);ctx.stroke();

  // Hash marks on edges (blueprint ruler)
  ctx.strokeStyle='rgba(255,255,255,0.02)';
  ctx.lineWidth=0.5;
  for(var hi=0;hi<20;hi++){
    var hx=margin+(W-margin*2)*(hi/19);
    ctx.beginPath();ctx.moveTo(hx,margin-6);ctx.lineTo(hx,margin+6);ctx.stroke();
    ctx.beginPath();ctx.moveTo(hx,H-margin-6);ctx.lineTo(hx,H-margin+6);ctx.stroke();
  }

  animId=requestAnimationFrame(animate);
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
