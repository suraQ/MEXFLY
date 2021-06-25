
function init()
{
  var canvas = document.getElementById("canvas");
  if( !canvas || !canvas.getContext ) return;
  cc = canvas.getContext("2d");
   tweetBtn = document.getElementById("tweetButton");
  // ステージサイズ
  STAGE_WIDTH = canvas.width;
  STAGE_HEIGHT = canvas.height;
  STAGE_SIZE = Math.max(STAGE_WIDTH,STAGE_HEIGHT)*0.5;
  //中心を原点に
  cc.translate(STAGE_WIDTH*0.5,STAGE_HEIGHT*0.5);
  // フレームレート
  FRAME_RATE = 30;
  //fov
  ANGLE = 55;
  FOV=Math.tan(ANGLE*0.5*Math.PI/180);
  //speed;
  DEF_SP =4;
  speed = 4;
  FAR = 70;
  // キーボードイベントの設定
  initKeyboardEvent();
  //vcamera
  cam = new Camera();
  //squares
  squares = new Array();
  linePos = Math.random()*360;
  for( i = 0; i<FAR; i++)
  {
       var sq = new Square(70*Math.sin(linePos*6*Math.PI*2/360),150*Math.cos(linePos*2.2*Math.PI*2/360),
         220+50*Math.sin(linePos*4*Math.PI*2/360),220+50*Math.sin(linePos*8*Math.PI*2/360),
         linePos%720/2,"rgba(255,100,10,");
    sq.z = i*5;
    squares.push(sq);
    linePos++;
  }
  meter = new Meter(cc);// ODO_SPEEDメーター
  showTitle();
}
// キーボードイベントの設定
function initKeyboardEvent()
{
  key = new KeyboardEvent();
  key.onKeyDown = startGame;
  key.addKeyboardEvent();
}
// タイトル画面
function showTitle()
{
  cc.save();
  cc.fillStyle = '#ffffff';
  cc.textAlign = "center";
  cc.font ="bold 25px 'gothic' ";
  cc.fillText( "HIT [ENTER] KEY TO START." ,0,0);
  cc.font ="bold 13px 'gothic' ";
  cc.fillText( "Arrow or WASD: control" , 0,30);
  cc.fillText( "SPACE : boost" ,0,43);
  cc.fillText( "Z : brake" ,0,56);
  cc.fillText( "※Use boost to Recover HP" ,0,69);
  cc.restore();
}
// ゲーム開始
function startGame()
{
  if(key.keyCode[13])
  {
    tweetBtn.style.display = "none";
    key.onKeyDown = null;
    key.addKeyboardEvent();
    hoge = new Hoge(50,30);
    hoge.update(key.keyCode[37] , key.keyCode[39], key.keyCode[38], key.keyCode[40]);
    meter.odo =0;
    intervalId = setInterval( drawAnimation,1000/ FRAME_RATE );
  }
}
// アニメーション描画処理
function drawAnimation()
{
  cc.save();
  clearCanvas();// キャンバスをクリア
  hoge.update( key.keyCode[37] ||key.keyCode[65], key.keyCode[39]||key.keyCode[68], key.keyCode[38]||key.keyCode[87], key.keyCode[40]||key.keyCode[83],key.keyCode[32],key.keyCode[90] );
  cam.update();
  var l = squares.length;
  for(i = 0; i<l; i++)
  {
    var s = squares[i];
    if(s.z<=speed+10)
    {
      squares.shift();
      linePos++;
      var newSq = new Square(70*Math.sin(linePos*6*Math.PI*2/360),150*Math.cos(linePos*2.2*Math.PI*2/360),
        220+50*Math.sin(linePos*4*Math.PI*2/360),220+50*Math.sin(linePos*8*Math.PI*2/360),
        linePos%720/2,"rgba(255,100,10,");
      newSq.z = squares[squares.length-1].z+5;
      squares.push(newSq);
      i--;
    }else
    {
      s.update();
    }
  }
  checkHit();
  cc.restore();
  hoge.draw();
  meter.check();
  meter.displayODO();
}
// キャンバスをクリア
function clearCanvas()
{
  cc.clearRect(-STAGE_WIDTH*0.5 , -STAGE_HEIGHT*0.5, STAGE_WIDTH , STAGE_HEIGHT );
}
//衝突判定
function checkHit()
{
  var target = squares[Math.round(hoge.z/5)];
  var p1 = hoge.vertices[0].rotate(-target.rotation);
  var p2 = hoge.vertices[1].rotate(-target.rotation);
  hoge.hit = !(target.includePoint(p1) && target.includePoint(p2));
}
/*--------------------------------------------------------------------------------------
　Hogeくん
--------------------------------------------------------------------------------------*/
var Hoge = function(w,h)
{
  this.DEF_COL = '#ffff00';
  this.HIT_COL = '#ff0000';
  this.HEIGHT = h;
  this.WIDTH =w;
  this.SPEED = 15;
  this.x = 0;
  this.y = 0;
  this.z = 50;
  this.DEF_Z = 50;
  this.hit = false;
  this.CONTROLABLITY = 1.5;
  this.MAX_HITPOINT = 200;
  this.hitPoint = this.MAX_HITPOINT;
  //機体姿勢
  this.roll = 0;
  this.pitch = 0;
  //this.yaw = 0;
  this.vertices =[];
  this.projectedPoints = [];
};
Hoge.prototype = {
  draw:function()
  {
    if (this.hit)
    {
      cc.strokeStyle = this.HIT_COL;
      this.hitPoint--;
    }else
    {
      cc.strokeStyle = this.DEF_COL;
    }
    cc.beginPath();
    var l = this.vertices.length;
    cc.moveTo(this.projectedPoints[0].x,this.projectedPoints[0].y);
    for(var i = 1; i<l; i++)
    {
      cc.lineTo(this.projectedPoints[i].x,this.projectedPoints[i].y);
    }
    cc.closePath();
    cc.stroke();
  },
  update:function( isPressLeft , isPressRight, isPressUp,isPressDown,isPressBoost, isPressBrake )
  {
    if( isPressLeft )
    {
      this.roll-=this.CONTROLABLITY;
      if(this.roll<-180) this.roll+=360;
    }
    if( isPressRight )
    {
      this.roll+=this.CONTROLABLITY;
      if(this.roll >180) this.roll-=360;
    }
    if( isPressUp )
    {
      this.pitch-= this.CONTROLABLITY;
      if(this.pitch<-70)this.pitch =-70;
    }
    if( isPressDown )
    {
      this.pitch+= this.CONTROLABLITY;
      if (this.pitch > 70)this.pitch = 70;
    }
    if(isPressBoost)
    {
      this.z++;
      this.hitPoint+= 1/10;
      if(this.hitPoint>this.MAX_HITPOINT)this.hitPoint = this.MAX_HITPOINT;
      if(this.z>120) this.z = 120;
    }
    if(isPressBrake)
    {
      this.z--;
      if(this.z<=25) this.z = 25;
    }
    this.pitch -= this.pitch/80*speed/10;
    this.roll -= this.roll/80*speed/10;
    this.z-= (this.z-this.DEF_Z)/60;
    this.x += this.SPEED*this.roll/180;
    this.y += this.SPEED*this.pitch/70;
    speed = DEF_SP+(this.z-this.DEF_Z)/10;
    //projection
    this.vertices[0]=new Point3D(this.x+this.WIDTH*0.5* Math.cos(this.roll*Math.PI/180),this.y+this.WIDTH*0.5* Math.sin(this.roll*Math.PI/180),this.z);
    this.vertices[1]=new Point3D(this.x-this.WIDTH*0.5* Math.cos(this.roll*Math.PI/180),this.y-this.WIDTH*0.5* Math.sin(this.roll*Math.PI/180),this.z);
    this.vertices[2]=new Point3D(this.x,this.y+this.HEIGHT*0.5* Math.sin(this.pitch*Math.PI/180),this.z+this.HEIGHT*0.5* Math.cos(this.pitch*Math.PI/180));
    var l = this.vertices.length;
    for(var i = 0 ; i<l; i++)
    {
      this.projectedPoints[i] = projectToScreen(this.vertices[i]);
    }
  }
};
/*--------------------------------------------------------------------------------------
　WallWire
--------------------------------------------------------------------------------------*/
var Square = function(x,y,width, height, rotation, color)
{
  this.height = height;
  this.width = width;
  this.color = color;
  this.rotation = rotation;
  this.z = 0;
  this.x = x;
  this.y = y;
  this.sin = Math.sin(rotation*Math.PI/180);
  this.cos = Math.cos(rotation*Math.PI/180);
};
Square.prototype = {
  update:function()
  {
    this.z-=speed;
    var dz = this.z/FOV/STAGE_SIZE;
    var drawWidth=this.width/dz;
    var drawHeight=this.height/dz;
    cc.setTransform(this.cos, this.sin, -this.sin, this.cos,STAGE_WIDTH*0.5-cam.x/dz,STAGE_HEIGHT*0.5-cam.y/dz);
    cc.strokeStyle = this.color+(1-this.z/FAR/5)+")";
    cc.strokeRect(-drawWidth*0.5+this.x/dz,-drawHeight*0.5+this.y/dz,drawWidth,drawHeight);
  },
  includePoint:function(p)
  {
    return (p.x<(this.x+this.width*0.5) && p.x> (this.x-this.width*0.5) 
    && p.y<(this.y+this.height*0.5) && p.y> (this.y-this.height*0.5));
  }
};
/*--------------------------------------------------------------------------------------
　Camera
--------------------------------------------------------------------------------------*/
var Camera = function()
{
  this.x = 0;
  this.y = 0;
};
Camera.prototype = {
  update:function()
  {
    this.x += (hoge.x-this.x)/8;
    this.y += (hoge.y-this.y)/8;
  }
};
/*--------------------------------------------------------------------------------------
　Point3D
--------------------------------------------------------------------------------------*/
var Point3D = function(x,y,z)
{
  this.x = x;
  this.y = y;
  this.z = z;
};
Point3D.prototype =
{
  rotate:function(rot)
  {
    var nx =this.x*Math.cos(rot*Math.PI/180)-this.y*Math.sin(rot*Math.PI/180);
    var ny =this.x*Math.sin(rot*Math.PI/180)+this.y*Math.cos(rot*Math.PI/180);
    return new Point(nx,ny);
  }
};
/*--------------------------------------------------------------------------------------
　Point
--------------------------------------------------------------------------------------*/
var Point = function(x,y)
{
  this.x = x;
  this.y = y;
};
//スクリーンに投影
function projectToScreen(p3d)
{
  var dz = p3d.z/FOV/STAGE_SIZE;
  var sx = (p3d.x-cam.x)/dz;
  var sy = (p3d.y-cam.y)/dz;
  return new Point(sx,sy);
}
/*--------------------------------------------------------------------------------------
　Meter
--------------------------------------------------------------------------------------*/
var Meter = function(cc)
{
  this.cc = cc;
  this.odo;
};
Meter.prototype = {
  check:function()
  {
    this.odo += speed;
    if(hoge.hitPoint < 0) stopGame();
  },
  displayODO:function()
  {
    this.cc.fillStyle = '#ffffff';
    cc.font ="bold 10px 'gothic' ";
    this.cc.fillText( "DST:" +  (this.odo).toFixed()+"m" , -STAGE_WIDTH*0.5+10 , STAGE_HEIGHT*0.5-40 );
    this.cc.fillText("SPD:" +  meter.calcSp(speed).toFixed(2) + "km/h" , -STAGE_WIDTH*0.5+10 , STAGE_HEIGHT*0.5-20);
    this.cc.strokeStyle = '#3DBF00';
    this.cc.fillStyle = 'rgba(61,191,0,0.4)';
    this.cc.fillRect( -STAGE_WIDTH*0.5+110,STAGE_HEIGHT*0.5-28,(STAGE_WIDTH-120)*hoge.hitPoint/hoge.MAX_HITPOINT, 10);
  },
  calcSp:function(sp)
  {
    return sp*FRAME_RATE*60*60/10000;
  }
};
// ゲームオーバー
function stopGame()
{
  cc.save();
  clearInterval(intervalId);
  cc.fillStyle = '#ffffff';
  cc.textAlign = "center";
  cc.font ="bold 35px 'gothic' ";
  cc.fillText( "GAME OVER" ,0,0 );
  cc.font ="20px 'gothic' ";
  cc.fillText("You've reached "+meter.odo.toFixed(0)+"m.",0,25);
  cc.font ="13px 'gothic' ";
  cc.fillText( "HIT [ENTER] KEY TO RESTART." ,0,55);
  cc.restore();
  tweetBtn.style.display = "block";
  tweetBtn.onclick = TweetResult;
  key.onKeyDown = startGame;
  key.addKeyboardEvent();
}
// スコアをツイート
function TweetResult()
{
  tweetBtn.blur();
  window.open("http://twitter.com/home?status=" 
              + encodeURIComponent(meter.odo.toFixed(0)+"m地点まで到達しました。"),"_blank");
  return false;
}
var KeyboardEvent = function()
{
  this.keyCode = new Array(256);
  this.onKeyDown;
  this.onKeyUp;
  var i;
  for (i=0;i<256;i++){ this.keyCode[i]=0; }
};
KeyboardEvent.prototype = {
  addKeyboardEvent: function(){
    var keyCode = this.keyCode;
    var onkeyDown = this.onKeyDown;
    var onKeyUp = this.onKeyUp;
    var which;
    var setKeyCode = function( which , value )
    {
      keyCode[which] = value;
    };
    window.document.onkeydown = function(e)
    {
      which = (e||window.event).keyCode;
      setKeyCode( which , 1 );
      if( onkeyDown ) onkeyDown();
    };
    window.document.onkeyup = function(e){
      which = (e||window.event).keyCode;
      setKeyCode( which , 0 );
      if( onKeyUp ) onKeyUp();
    };
  }
};
