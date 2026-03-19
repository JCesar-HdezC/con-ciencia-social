(function(){
const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
const tip=document.getElementById('chtip');
const W=560,H=480;
canvas.width=W;canvas.height=H;

// Territorio y Comunidad = mismo sistema (colores similares, muy conectados)
// Tecnología = puente (navy, al centro, conecta hacia los dos)
const CT={cx:155,cy:280,r:108,label:'Territorio',color:'#2D7A7A',r0:45,g0:122,b0:122,pts:[],isBridge:false};
const CC={cx:445,cy:335,r:102,label:'Comunidad', color:'#3D8F8A',r0:61,g0:143,b0:138,pts:[],isBridge:false};
const CTe={cx:300,cy:175,r:98, label:'Tecnologia',color:'#1B2A4A',r0:27,g0:42, b0:74, pts:[],isBridge:true};
const clusters=[CT,CTe,CC];

clusters.forEach(function(cl){
  for(var i=0;i<55;i++){
    var a=Math.random()*Math.PI*2;
    var d=Math.pow(Math.random(),0.6)*cl.r*0.9;
    var layer=Math.floor(Math.random()*3);
    cl.pts.push({
      ox:cl.cx+Math.cos(a)*d, oy:cl.cy+Math.sin(a)*d,
      x:0,y:0, layer:layer,
      r:layer===0?(1+Math.random()*1.5):layer===1?(2.5+Math.random()*2):(4.5+Math.random()*3.5),
      alpha:layer===0?(0.15+Math.random()*0.15):layer===1?(0.35+Math.random()*0.2):(0.65+Math.random()*0.25),
      t:Math.random()*Math.PI*2, speed:0.005+Math.random()*0.012,
      life:1, maxLife:500+Math.random()*500, age:Math.random()*400,
      cl:cl
    });
  }
});

var allPts=[];
clusters.forEach(function(cl){ cl.pts.forEach(function(p){ allPts.push(p); }); });
allPts.sort(function(a,b){ return a.layer-b.layer; });

var mouse={x:-999,y:-999}, hov=null, frame=0;
var energyPts=[];

// Partículas constantes: fluyen DESDE Tecnología hacia Territorio y Comunidad
var ambientEnergy=[];
function spawnAmbient(){
  [CT,CC].forEach(function(dest){
    ambientEnergy.push({
      from:CTe, to:dest,
      t:Math.random(),
      speed:0.0015+Math.random()*0.001,
      size:1+Math.random()*1.2,
      alpha:0.2+Math.random()*0.25
    });
  });
}
for(var i=0;i<12;i++) spawnAmbient();

canvas.addEventListener('mousemove',function(e){
  var r=canvas.getBoundingClientRect();
  mouse.x=(e.clientX-r.left)*(W/r.width);
  mouse.y=(e.clientY-r.top)*(H/r.height);
  var prevHov=hov; hov=null;
  clusters.forEach(function(cl){
    var dx=mouse.x-cl.cx,dy=mouse.y-cl.cy;
    if(Math.sqrt(dx*dx+dy*dy)<cl.r+25) hov=cl;
  });
  if(hov && hov!==prevHov){
    // Hover en Tecnología: lanza energía hacia ambos
    if(hov===CTe){
      [CT,CC].forEach(function(dest){
        for(var i=0;i<3;i++){
          energyPts.push({from:CTe,to:dest,t:i/3,speed:0.003+Math.random()*0.002,size:2+Math.random()*1.5,alpha:0.8});
        }
      });
    }
    // Hover en Territorio o Comunidad: lanza energía hacia Tecnología (buscando el puente)
    else {
      energyPts.push({from:hov,to:CTe,t:0,speed:0.003,size:2.5,alpha:0.85});
      energyPts.push({from:hov,to:CTe,t:0.3,speed:0.003,size:2,alpha:0.7});
      energyPts.push({from:hov,to:CTe,t:0.6,speed:0.003,size:1.8,alpha:0.6});
    }
  }
  if(hov){
    tip.textContent=hov.label; tip.style.opacity='1';
    var rb=canvas.getBoundingClientRect();
    tip.style.left=(e.clientX-rb.left+14)+'px';
    tip.style.top=(e.clientY-rb.top-12)+'px';
  } else tip.style.opacity='0';
});
canvas.addEventListener('mouseleave',function(){mouse={x:-999,y:-999};hov=null;tip.style.opacity='0';});

function drawHalo(cl,ih){
  var glow=ctx.createRadialGradient(cl.cx,cl.cy,0,cl.cx,cl.cy,cl.r*1.5);
  var intensity=ih?0.28:0.09;
  glow.addColorStop(0,'rgba('+cl.r0+','+cl.g0+','+cl.b0+','+intensity+')');
  glow.addColorStop(0.5,'rgba('+cl.r0+','+cl.g0+','+cl.b0+','+(intensity*0.35)+')');
  glow.addColorStop(1,'rgba('+cl.r0+','+cl.g0+','+cl.b0+',0)');
  ctx.fillStyle=glow;
  ctx.beginPath();ctx.arc(cl.cx,cl.cy,cl.r*1.5,0,Math.PI*2);ctx.fill();
}

function drawBridgeLine(from,to,ih){
  // Tecnología → Territorio/Comunidad: línea de puente
  if(ih){
    ctx.strokeStyle='rgba(45,140,130,0.5)';
    ctx.lineWidth=2.5; ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(from.cx,from.cy);ctx.lineTo(to.cx,to.cy);ctx.stroke();
    ctx.strokeStyle='rgba(180,240,230,0.25)';
    ctx.lineWidth=7;
    ctx.beginPath();ctx.moveTo(from.cx,from.cy);ctx.lineTo(to.cx,to.cy);ctx.stroke();
  } else {
    ctx.strokeStyle='rgba(45,122,122,0.12)';
    ctx.lineWidth=1; ctx.setLineDash([6,6]);
    ctx.beginPath();ctx.moveTo(from.cx,from.cy);ctx.lineTo(to.cx,to.cy);ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawSystemLine(ih){
  // Territorio ↔ Comunidad: misma familia, línea orgánica
  if(ih){
    ctx.strokeStyle='rgba(45,160,145,0.4)';
    ctx.lineWidth=2; ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(CT.cx,CT.cy);ctx.lineTo(CC.cx,CC.cy);ctx.stroke();
    ctx.strokeStyle='rgba(100,200,185,0.15)';
    ctx.lineWidth=8;
    ctx.beginPath();ctx.moveTo(CT.cx,CT.cy);ctx.lineTo(CC.cx,CC.cy);ctx.stroke();
  } else {
    ctx.strokeStyle='rgba(45,122,122,0.18)';
    ctx.lineWidth=1.2; ctx.setLineDash([3,4]);
    ctx.beginPath();ctx.moveTo(CT.cx,CT.cy);ctx.lineTo(CC.cx,CC.cy);ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawParticle(ep){
  ep.t+=ep.speed;
  if(ep.t>=1) return false;
  var x=ep.from.cx+(ep.to.cx-ep.from.cx)*ep.t;
  var y=ep.from.cy+(ep.to.cy-ep.from.cy)*ep.t;
  var fade=ep.t<0.12?ep.t/0.12:ep.t>0.85?(1-ep.t)/0.15:1;
  ctx.globalAlpha=ep.alpha*fade;
  ctx.fillStyle='rgba(160,230,215,1)';
  ctx.beginPath();ctx.arc(x,y,ep.size,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(45,140,130,0.3)';
  ctx.beginPath();ctx.arc(x,y,ep.size*2.8,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
  return true;
}

function draw(){
  ctx.clearRect(0,0,W,H);
  frame++;

  allPts.forEach(function(pt){
    pt.age++; pt.t+=pt.speed;
    var lr=pt.age/pt.maxLife;
    if(lr<0.12) pt.life=lr/0.12;
    else if(lr>0.82) pt.life=1-(lr-0.82)/0.18;
    else pt.life=1;
    if(pt.age>pt.maxLife){
      var a=Math.random()*Math.PI*2,d=Math.pow(Math.random(),0.6)*pt.cl.r*0.9;
      pt.ox=pt.cl.cx+Math.cos(a)*d; pt.oy=pt.cl.cy+Math.sin(a)*d;
      pt.age=0; pt.maxLife=500+Math.random()*500; pt.life=0;
    }
    var ih=hov===pt.cl;
    var wb=ih?12:4;
    var tx=pt.ox+Math.cos(pt.t)*wb+Math.sin(pt.t*0.6)*wb*0.4;
    var ty=pt.oy+Math.sin(pt.t)*wb+Math.cos(pt.t*0.8)*wb*0.4;
    if(ih){
      var dx=mouse.x-tx,dy=mouse.y-ty,d=Math.sqrt(dx*dx+dy*dy);
      if(d<100){tx+=dx*(0.22*(1-d/100));ty+=dy*(0.22*(1-d/100));}
    }
    pt.x=tx; pt.y=ty;
  });

  // Halos
  clusters.forEach(function(cl){ drawHalo(cl,hov===cl); });

  // Línea sistema Territorio-Comunidad
  drawSystemLine(hov===CT||hov===CC);

  // Líneas puente Tecnología → Territorio y Comunidad
  drawBridgeLine(CTe,CT, hov===CTe||hov===CT);
  drawBridgeLine(CTe,CC, hov===CTe||hov===CC);

  // Partículas de hover
  energyPts=energyPts.filter(drawParticle);

  // Anillos
  clusters.forEach(function(cl){
    var ih=hov===cl;
    ctx.strokeStyle='rgba('+cl.r0+','+cl.g0+','+cl.b0+','+(ih?0.45:0.12)+')';
    ctx.lineWidth=ih?2:0.7; ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(cl.cx,cl.cy,cl.r,0,Math.PI*2);ctx.stroke();
    if(ih){
      var pulse=(Math.sin(frame*0.08)+1)/2;
      ctx.strokeStyle='rgba('+cl.r0+','+cl.g0+','+cl.b0+','+(0.18*pulse)+')';
      ctx.lineWidth=7;
      ctx.beginPath();ctx.arc(cl.cx,cl.cy,cl.r+8+pulse*7,0,Math.PI*2);ctx.stroke();
    }
  });

  // Líneas entre puntos cercanos
  for(var i=0;i<allPts.length;i++){
    var pa=allPts[i];
    if(pa.layer===0) continue;
    var ihA=hov===pa.cl;
    var cd=ihA?85:55;
    for(var j=i+1;j<allPts.length;j++){
      var pb=allPts[j];
      if(pb.layer===0) continue;
      var ihB=hov===pb.cl;
      var dx2=pb.x-pa.x,dy2=pb.y-pa.y;
      var dist=Math.sqrt(dx2*dx2+dy2*dy2);
      if(dist<cd){
        var same=pa.cl===pb.cl;
        var strength=(1-dist/cd)*pa.life*pb.life;
        var baseA=same?(ihA?0.45:0.12):(ihA||ihB?0.28:0.05);
        var alpha=baseA*strength;
        if(alpha<0.02) continue;
        if(same) ctx.strokeStyle='rgba('+pa.cl.r0+','+pa.cl.g0+','+pa.cl.b0+','+alpha+')';
        else ctx.strokeStyle='rgba(45,100,100,'+alpha+')';
        ctx.lineWidth=same?(ihA?0.9:0.4):(ihA||ihB?0.7:0.3);
        ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);ctx.stroke();
      }
    }
  }

  // Puntos
  allPts.forEach(function(pt){
    var ih=hov===pt.cl;
    var a=(ih?pt.alpha:pt.alpha*0.55)*pt.life;
    if(a<0.02) return;
    ctx.globalAlpha=a;
    ctx.fillStyle=pt.cl.color;
    ctx.beginPath();ctx.arc(pt.x,pt.y,ih?pt.r*1.4:pt.r,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
  });

  // Nodos centrales
  clusters.forEach(function(cl){
    var ih=hov===cl;
    ctx.fillStyle=cl.color; ctx.globalAlpha=ih?1:0.8;
    ctx.beginPath();ctx.arc(cl.cx,cl.cy,ih?10:6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(cl.cx,cl.cy,ih?4.5:2.5,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    ctx.font='700 '+(ih?13:10)+'px Raleway,sans-serif';
    ctx.fillStyle=cl.color; ctx.globalAlpha=ih?0.95:0.4;
    ctx.textAlign='center';
    ctx.fillText(cl.label.toUpperCase(),cl.cx,cl.cy-cl.r-10);
    ctx.globalAlpha=1;
  });

  requestAnimationFrame(draw);
}
draw();
})();
