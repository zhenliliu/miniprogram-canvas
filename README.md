### Component of generate share image by Canvas


> **注：** canvas画图不需要适配机型，适配设计稿，所使用的单位都是px,此组件在绘画过程中严格按照设计图标注进行赋值，为了保证导出图片的清晰度，尽可能使用2倍稿或3倍稿，一份配置文件对应一个分享图片,配置options部分为预处理物料，setExtraData(options)为填充动态数据，调用draw()开始绘制，返回Promise

#### 使用方法
```javascript
  import Canvas from 'miniprogram-canvas'
  let canvas = new Canvas(this,  {
      // 画布的ID
      canvasId: 'canvas',
      // 是否使用图片做背景，如果为true 则传入的imgArr的第一张为背景图片
      useBgImage: false,
      // 画布的宽度 缺省 750 （单位： px）
      width: 750,
      // 画布的高度 缺省 1334 (单位： px）
      height: 1334,
      // 绘制超时时间
      timeout: 10000,
      // 是否使用预览
      preview: true,
      // 导出图片的格式
      fileType: 'jpg',
      // 需要绘制的图片元素
      imgArr: [
        {drawType: 'image',url:'http://image.png',x: 40, y: 1076, zIndex: 31, height: 150, width:150},
        {drawType: 'image',url:'http://image.jpg',x: 35, y: 482, width: 680, height: 451, zIndex: 31},
      ],
      // 需要绘制的文本元素
      textArr: [
        {drawType: 'text', text: '感谢', color: '#888889', x: 60, y: 180, zIndex: 33, fontSize: 28,textAlign: 'left'},
        // 如果文本行内需要填充动态数据， 则填充部分使用 ‘${10}$’  替代， 数字则为需要填充的文字个数， 长度可能不是很准确，根据应用场景定义
        {drawType: 'text', text: '第${10}$位', color: '#888889', x: 60, y: 240, zIndex: 33, fontSize: 28,textAlign: 'left'},
        {drawType: 'text', text: '为《${18}$》捐献爱心的人士', color: '#888889', x: 60, y: 290, zIndex: 33, fontSize: 28,textAlign: 'left'},
        {drawType: 'text', text: '长按或扫描二维码', color: '#666', x: 210, y: 1100, zIndex: 34, fontSize: 30, textAlign: 'left'},
      ],
      // 需要绘制的矩形的元素
      rectArr: [
        {drawType: 'rect',x: 10, y: 10, width: 730, height: 1314, color: '#303135', bgColor: '#FFF',  zIndex: 0, radius: 20},
        {drawType: 'rect',x: 10, y: 10, width: 730, height: 1000, color: '#303135', bgColor: '#303135',  zIndex: 1, trr: 20, trr: 20},
      ],
      
  })
```
##### 入参options 为预处理物料，即所需要绘制的静态内容,所需要绘制的动态数据可以通过 “setExtraData”函数进行添加绘制

```javascript
  Page({
    onLoad() {
        this.canvas = new Canvas(this,options)
    },
    createImage() {
      // 所需要绘制的动态数据
      this.canvas.setExtraData([
        {drawType: 'text', text: "测试", color: '#fff', x: 140, y: 180, zIndex: 33, fontSize: 28,textAlign: 'left'},
        {drawType: 'text', text: '动态数据', color: '#b78f53', x: 410, y: 240, zIndex: 33, fontSize: 28,textAlign: 'left'},
        {drawType: 'text', text: '绘制动态数据', color: '#888889', x: 120, y: 290, zIndex: 33, fontSize: 28,textAlign: 'left'},
        {drawType: 'text', text: '1.99', color: 'red', x: 265, y: 1162, zIndex: 34, fontSize: 26, textAlign: 'left'},
        {drawType: 'image',url: "http://image.png",x: 106, y: 112, avatar: true, radius: 50,zIndex: 31},
      ])
      // 调用draw函数开始绘制
      this.canvas.draw().then(function(res) {
        console.log('res', res)
      })
    }
  })
```
#### 目前受小程序的限制，还不能动态的创建添加标签，所以需要相应的wxml页面添加以下代码
```xml
   <!--canvas-id是自己定义的，此处canvas-id是什么，option配置文件 canvasId 就是什么-->
  <canvas canvas-id="canvas" style="height: {{canvasHeight}}px; width: {{canvasWidth}}px;position: absolute;left: -100000px"></canvas>
```
#### 元素共有属性
属性 | 元素 | 值 | 值类型 | 必填 | 备注
----|------|-------|-------|---------|----
drawType   |image、text、rect|'image'、'text'、'rect'|String|是|渲染起始x坐标
x   |image、text、rect|缺省值为0|Number|是|渲染起始x坐标
y   |image、text、rect|缺省值为0|Number|是|渲染起始y坐标
height  |image、text、rect|缺省值为元素高度|Number|是|渲染元素的高度
width   |image、text、rect|缺省值为元素宽度|Number|是|渲染元素的宽度
zIndex  |image、text、rect|0|Number|否|渲染元素的层级，值越大层级越高


#### 元素私有属性

##### image

属性 | 默认值 | 值类型 | 必填 | 备注
----|-------|-------|---------|----
url   |-----|String|是|图片地址
avatar|-----|String|否|所画元素是否是头像圆角头像
color|-----|String|否|所画头像边框的颜色：只有在avatar为true时生效
radius|-----|Number|否|所画头像的半径：只有在avatar为true时生效

#### rect

属性 | 默认值 | 值类型 | 必填 | 备注
----|-------|-------|---------|----
radius|0|String|是|圆角半径
tlr|0|String|否|矩形左上角圆角半径， radius存在时此值无效
trr|0|String|否|矩形右上角圆角半径， radius存在时此值无效
blr|0|String|否|矩形左下角圆角半径， radius存在时此值无效
brr|0|String|否|矩形右下角圆角半径， radius存在时此值无效
color|-----|String|否|边框的颜色
bgColor|-----|Number|否|填充的颜色


#### text

属性 | 默认值 | 值类型 | 必填 | 备注
----|-------|-------|---------|----
text|-----|String|是|要填充的文字
color|#000|String|否|字体的颜色
fontSize|20|Number|否|字体大小
textAlign|'center'|String|否|字体对其方式
lineHeight| 10 |String|否|行间距