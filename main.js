//获取文档中 id="displayScoring" 的元素，以显示得分数
const para = document.querySelector('#displayScoring');

let count = 0; // 定义弹球计数变量count
let score = 0; //定义累计计分分数score

// 设置画布，游戏开始前隐藏
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.style.display = "none";

//设置画布宽度高度
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;


// 在随机区间生成随机整数的函数
//用于随机颜色
function random(min, max) {
  const num = Math.floor(Math.random() * (max - min)) + min;
  return num;
};


//两数a/b随机选择一个的函数
//用于随机彩球大小与速度
function random2(a, b) {
  const num = random(a, b); //调用random函数，在随机区间[a,b]内生成随机整数
  if (num > ((a + b) / 2)) //大于两者中位数者，取大
    return b;
  else return a; //小于两者中位数，取小
};


// 生成随机颜色值的函数
function randomColor() {
  const color = 'rgb('
    + random(0, 255) + ','
    + random(0, 255) + ','
    + random(0, 255) + ')';
  return color;
};


// 定义 Shape类
class Shape {
  constructor(x, y, velX, velY, exists) {
    this.x = x;
    this.y = y; //圆心位置
    this.velX = velX;
    this.velY = velY; //沿x、y轴的速度
    this.exists = exists; //是否存在显示
  };
};


// 定义 Ball类，继承自 Shape类
class Ball extends Shape {

  //定义 Ball构造器函数
  constructor(x, y, velX, velY, exists, color, size) {
    super(x, y, velX, velY, exists); //调用父类构造方法

    this.color = color; //彩球颜色
    this.size = size; //彩球大小
  };


  // 定义彩球绘制函数
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  };


  // 定义彩球更新函数
  //当彩球碰到画布边界，方向调转，速度大小不变
  update() {
    if ((this.x + this.size) >= width) {
      this.velX = -(this.velX);
    }

    if ((this.x - this.size) <= 0) {
      this.velX = -(this.velX);
    }

    if ((this.y + this.size) >= height) {
      this.velY = -(this.velY);
    }

    if ((this.y - this.size) <= 0) {
      this.velY = -(this.velY);
    }

    this.x += this.velX;
    this.y += this.velY;
  };


  // 定义碰撞检测函数
  //当存在两彩球圆心之间的距离小于其半径之和，即为碰撞
  //彩球碰撞后，两彩球随机一个相同的颜色
  collisionDetect() {
    for (var j = 0; j < balls.length; j++) {
      if (this !== balls[j]) {
        const dx = this.x - balls[j].x;
        const dy = this.y - balls[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + balls[j].size && balls[j].exists) {
          balls[j].color = this.color = randomColor();
        }
      }
    }
  };


};


// 定义 EvilCircle类, 继承自 Shape类
class EvilCircle extends Shape {

  //定义 EvilCircle构造器函数
  constructor(x, y, exists) {
    super(x, y, 20, 20, exists); //调用父类Shape类构造方法

    this.color = 'white'; //吞噬圈默认颜色：白色
    this.size = 10; //吞噬圈默认大小10
  };


  // 定义 EvilCircle 绘制方法
  draw() {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3; //线宽3
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
  };


  // 定义 EvilCircle 的边缘检测（checkBounds）方法
  //防止吞噬圈移出屏幕
  checkBounds() {
    if ((this.x + this.size) >= width) {
      this.x -= this.size;
    }

    if ((this.x - this.size) <= 0) {
      this.x += this.size;
    }

    if ((this.y + this.size) >= height) {
      this.y -= this.size;
    }

    if ((this.y - this.size) <= 0) {
      this.y += this.size;
    }
  };


  // 定义 EvilCircle 键盘控制设置（setControls）方法
  //键盘控制吞噬圈上下左右移动
  setControls() {
    window.onkeydown = e => {
      switch (e.key) {
        case 'a':
        case 'A':
        case 'ArrowLeft':
          this.x -= this.velX;
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          this.x += this.velX;
          break;
        case 'w':
        case 'W':
        case 'ArrowUp':
          this.y -= this.velY;
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          this.y += this.velY;
          break;
      }
    };
  };


  // 定义 EvilCircle 冲突检测函数
  //存在的彩球与吞噬圈圆心之间的距离小于其半径之和，该彩球设为不存在，count--,得分累加
  collisionDetect() {
    for (let j = 0; j < balls.length; j++) {
      if (balls[j].exists) {
        const dx = this.x - balls[j].x;
        const dy = this.y - balls[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy); //两球圆心直接的距离

        if (distance < this.size + balls[j].size) {
          balls[j].exists = false;
          count--;
          score += scoring(balls[j], this); //累计得分  

          para.textContent = '剩余彩球数：' + count + '\n' + '累计得分数：' + score;
        }
      }
    }
  };

};


//定义计分函数
function scoring(ball, evil) {
  //彩球小
  if (ball.size <= evil.size)
    //彩球快，因为velX=velY故只设一个
    if (ball.velX >= 5)
      return 20; //彩球小速度快，计20分
    else return 15; //彩球小速度慢，计15分
  else
  if (ball.velX >= 5)
    return 10; //彩球大速度快，计10分
  else return 5; //彩球大速度慢，计5分
};


// 定义一个数组，生成并保存所有的彩球
var balls = [];


//生成并保存所有彩球的函数
function savingBalls() {
  while (balls.length < 50) {
    const size = random2(10, 20); //随机10或20两种大小
    const v = random2(2, 7); //随机2或7两种速度
    let ball = new Ball(
      // 为避免绘制错误，球至少离画布边缘球本身一倍宽度的距离
      //为便于明显判断彩球速度快慢，设置彩球velX、velY都为随机选择的同一个速度v
      random(0 + size, width - size),
      random(0 + size, height - size),
      v,
      v,
      true,
      randomColor(),
      size
    );
    balls.push(ball); //将对象ball加入balls数组中
    count++;
    var text = '剩余彩球数：' + count + '\n' + '累计得分数：' + score;
    para.textContent = text;
  }
};


//创建吞噬圈，并调用其控制方法
let evil = new EvilCircle(random(0, width), random(0, height), true);
evil.setControls();


// 定义一个循环来不停地播放
function loop() {

  ctx.fillStyle = 'rgba(0,0,0,0.25)'; //黑色画板
  ctx.fillRect(0, 0, width, height); //画板尺寸

  //彩球存在，则画出、更新、检测冲突
  for (let i = 0; i < balls.length; i++) {
    if (balls[i].exists) {
      balls[i].draw();
      balls[i].update();
      balls[i].collisionDetect();
    }
  }

  //吞噬圈画出、边缘检测、冲突检测
  evil.draw();
  evil.checkBounds();
  evil.collisionDetect();

  //设置动画循环播放
  var sta = requestAnimationFrame(loop);

};


//定义从头开始游戏的函数
function startGame() {

  balls = []; //重置彩球
  count = 0; //重置彩球数
  score = 0; //重置得分数

  //生成并保存所有彩球
  savingBalls();

  //循环播放
  loop();

  //60秒后跳出弹窗，截取分数，输出排行榜前三名
  setTimeout(function () {
    modal.style.display = "block";
    s.innerHTML = score;
    outputFirstThreeUsers();
  }, 60000);

};


//打开“开始游戏”按钮对象
var btn = document.getElementById("start");
//获取成绩
var s = document.getElementById("scores");

// 点击"开始游戏"按钮前，界面居中显示按钮，画布隐藏，游戏未开始
//点击按钮后，按钮隐藏，画布显示，游戏开始，60秒后截取分数，跳出弹窗
btn.onclick = function () {
  btn.style.display = "none"; //”开始游戏“按钮隐藏
  canvas.style.display = "block"; //画布显示
  startGame(); //开始游戏
};


//获取弹窗
var modal = document.getElementById('myModal');
//获取 <span> 元素，用于关闭弹窗
var span = document.querySelector('.close');

//点击 <span> (x), 关闭弹窗
span.onclick = function () {
  modal.style.display = "none"; //弹窗隐藏
};

//在用户点击其他地方时，弹窗不变
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "block"; //弹窗显示
  }
};


//定义用户类
class User {
  constructor(name, ascore, date) {
    this.name = name;
    this.ascore = ascore;
    this.date = date;
  };
};


//保存用户数据的函数；
function savingUser() {
  //取本地存储的数组到localtionUsers
  var locationUsers = JSON.parse(localStorage.getItem("messageStorage"));
  //当本地存储的数组为null时，为localtionUsers新建一个数组
  if (locationUsers == null)
    locationUsers = new Array();
  //取当前用户输入的姓名、成绩、及获得成绩的时间，建立User对象加入到locationUsers数组,
  let name = document.getElementById("name").value;
  let ascore = document.getElementById("scores").innerHTML;
  let date = Date();
  let user = new User(
    name,
    ascore,
    date
  );
  locationUsers.push(user);

  //将locationUsers数组存入本地
  localStorage.setItem("messageStorage", JSON.stringify(locationUsers));

};


//定义输出数组前三的函数
function outputFirstThreeUsers() {
  //取本地存储的数组到localtionUsers
  var locationUsers = JSON.parse(localStorage.getItem("messageStorage"));
	
  //当本地存储的数组为null时，为localtionUsers新建一个数组
  if (locationUsers == null)
    locationUsers = new Array();
	
  //对locationUsers数组按成绩高低进行排序
  locationUsers.sort(function (a, b) {
    return b.ascore - a.ascore;
  });

  //在表格中输出前三名
  for (let i = 0; i < locationUsers.length && i < 3; i++) {
    var tr = document.createElement("tr"); //创建HTML"tr"标签元素
    tr.innerHTML = "<td>" + locationUsers[i].name + "</td>"
      + "<td>" + locationUsers[i].ascore + "</td>"
      + "<td>" + locationUsers[i].date + "</td>"; //将数组内容填入新创建的tr元素
    var ttable = document.getElementById("history");
    ttable.appendChild(tr); //将创建的tr元素加入显示表格
  }
};


//获取保存按钮
var saveing = document.getElementById("save");
//点击保存按钮后，保存用户信息，界面刷新，重新开始游戏
saveing.onclick = function () {
  savingUser();
  location.reload();
};


//获取清除按钮
var clearing = document.getElementById("clear");
//点击清除按钮后，清除所有本地保存的用户信息，跳转到游戏开始界面，设置此方法便于测试
clearing.onclick = function () {
  localStorage.clear();
  location.reload();
};
