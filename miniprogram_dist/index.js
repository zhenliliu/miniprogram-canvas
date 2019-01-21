module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "0":
/*!***************************************************!*\
  !*** 0***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ShareImageBuilder; });
/**
 * 小程序画图脚本
 * @author liuzhenli
 * 使用方法见 https://github.com/zhenliliu/miniprogram-canvas
 */
class ShareImageBuilder {

  constructor(page, options) {
    this.options             = options;
    this.page                = page;
    this.fileType            = options.fileType;
    this.preview             = options.preview;
    this.canvas              = options.canvasId;
    this.ctx                 = wx.createCanvasContext(options.canvasId);
    this.formatImgsInfoArr   = [];
    this.canDraw             = false;
    this.canvasHeight        = 1334;
    this.canvasWidth         = 750;
    this.extraData           = false; //暂时未使用
    this.preDrawContentArr   = [];
    this.renderElementLength = 0
    this.drawComplate        = false;
    this.observeFun          = null;
    this.drawComplateCount   = -1;
    this.localImageArr       = [];
    this.extraQueue          = [];
    this.extraFunExcuting    = false;
    this.haveExtraData       = false;
    this.haveExcutedObserveFun = false
    this.setCanvasMeasure(this.canvasWidth, this.canvasHeight)
    this.initAllImageInfo()
  }
  /**
   * 设置画布的大小
   * @param {Number} canvasWidth 
   * @param {Number} canvasHeight 
   */
  setCanvasMeasure(canvasWidth, canvasHeight, callback) {
    this.page.setData({
      canvasHeight,
      canvasWidth
    },callback)
  }
  excuteExtraFun() {
    if(!this.extraFunExcuting) {
      let options = this.extraQueue.shift()
      console.log('extraFunExcuting options', options)
      if(!options) return;
      this.extraFunExcuting = true
      if( options.drawType === 'text' || options.drawType === 'rect' || options.drawType === 'line' || options.drawType === 'circle'){
        this.drawController(options)
      } else if(options.drawType === 'image') {
        this.downloadPromise(options.url).then((res) => {
          options.path = res.tempFilePath
          this.drawController(options)
        })
      }
    } else if(this.extraQueue.length) {
      let IntervalID = setInterval(() => {
        if(!this.extraFunExcuting) {
          clearInterval(IntervalID)
          IntervalID = null
          this.excuteExtraFun()
        }
      },10)
    } else {
      return
    }
  }
  /**
   * 需要额外渲染的元素
   * @param { Object| Array} options 
   */
  setExtraData(options) {
    if(Array.isArray(options)) {
      if(!options.length) return ;
      this.extraQueue.push(...options)
      this.renderElementLength += options.length
      this.haveExtraData = true;
      let intervalID = setInterval(() => {
        if(this.drawComplate) {
          clearInterval(intervalID)
          intervalID = null
          this.excuteExtraFun()
        }
      },10);
    } else {
      this.extraData = false
      console.error('options需要为Array类型，数据格式不正确！')
    }
  }
  /**
   * 获取文本宽度
   * @param {String} text 
   */
  getTextWidth(text) {
    return this.ctx.measureText(text)
  }
  /**
   * 创建获取图片信息的异步操作
   */
  initAllImageInfo() {
    let { imgArr = [] } = this.options
    imgArr = this.sort(imgArr)
    for(let i = 0, j = imgArr.length; i < j ; i++) {
      if(imgArr[i].url.match(/(http:\/\/|https:\/\/)/)){
        this.formatImgsInfoArr[i] = this.createImageDownloadPromise(imgArr[i])
      } else {
        this.formatImgsInfoArr[i] = new Promise((resolve, reject) => {
          this.setImageInfo(imgArr[i], i).then( res => {
            resolve(res)
          }).catch(error => {
            reject(error)
          }) 
        })
      }
    }
    this.getAllImgInfo()
  }
  /**
   * 获取图片宽高
   * 设置图片信息
   * @param {*} imgItemObj 
   */
  setImageInfo(imgItemObj) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: imgItemObj.url,
        success: (imageInfo) => {
          resolve({
            ...imgItemObj, 
            ...imageInfo, 
            path: imgItemObj.url,
            height: imgItemObj.height || imageInfo.height,
            width: imgItemObj.width || imageInfo.width
          })
        },
        fail: (errorInfo) => {
          reject(errorInfo)
        }
      })
    })
  }
  /**
   * 格式化所有渲染图片的参数:URL;height; width
   * @param {Object} imgItemObj 
   */
  createImageDownloadPromise(imgItemObj) {
    return  new Promise((resolve, reject) => {
      this.downloadPromise(imgItemObj.url).then((res) => {
        let imgInfoObj = {
          ...imgItemObj,
          url: res.tempFilePath,
          originUrl: imgItemObj.url
        }
        this.setImageInfo(imgInfoObj).then(res => {
          resolve(res)
        }).catch( error => {
          reject(error)
        })
      })
    })
  }
  /**
   * 执行所有下载图片的异步操作
   */
  getAllImgInfo() {
    Promise.all(this.formatImgsInfoArr).then((arr) => {
      this.canDraw = true
      this.formatImgsInfoArr = arr
      this.initCanvas()
    }).catch(e => {
      console.warn('网络开小差了')
    })
  }
  /**
   * 初始化canvas
   */
  initCanvas() {
    let { useBgImage } = this.options
    let { path, height = 1334, width = 750 } = useBgImage ? this.formatImgsInfoArr.pop() : this.options
    this.canvasHeight  = height
    this.canvasWidth   = width
    this.setCanvasMeasure(width, height, () => {
      useBgImage ? this.drawImage({path,x:0,y:0,width, height}) : this.drawRect({x:0,y:0,width,height});
      this.drawMainContent();
    })
  }
  drawMainContent() {
    let { 
      lineArr = [],
      textArr = [], 
      rectArr = [], 
      circleArr = [] } = this.options
    this.preDrawContentArr = this.sort([
      ...this.formatImgsInfoArr,
      ...textArr, 
      ...rectArr, 
      ...circleArr, 
      ...lineArr,
    ], true)
    if(!this.preDrawContentArr.length) {
      this.drawComplate = true
      return;
    }
    this.renderElementLength = this.preDrawContentArr.length 
    for(let i = 0, len = this.preDrawContentArr.length; i < len; i++) {
      if(!this.preDrawContentArr[i].$D) {
        this.drawController(this.preDrawContentArr[i])
        this.preDrawContentArr[i]['$D'] = true
      }
      if(i === len - 1) {
        this.drawObserveIntervalID = setInterval(() => {
          if(this.drawComplateCount === len) {
            this.drawComplate = true
            clearInterval(this.drawObserveIntervalID)
            this.drawObserveIntervalID = null
          }
        },10)
      }
    }
  }
  /**
   * 要渲染的元素
   * @param {Object} content 
   */
  drawController(content) {
    let { 
      drawType ,
      url, 
      path, 
      width, 
      height, 
      text, 
      color,  
      avatar, 
      radius,
    } = content;
    (drawType ==='image' && url   && path)   && (avatar ? this.drawArcImage(content) : this.drawImage(content));
    (drawType ==='text'  && text  && color)  && this.drawText(content);
    (drawType ==='rect'  && width && height) && this.drawRect(content);
    (drawType ==='circle' && radius) && this.drawCircle(content);
    (drawType ==='line'   && width) && this.drawLine(content)
  }
  /**
   * 生成图片
   */
  generateImage() {
    return new Promise((resolve, reject) => {
      //此处加setTimeout是为了解决安卓手机在画完以后不执行回调的问题，导致图片导出超时失败（安卓手机性能可能有问题）
      this.ctx.draw(true, setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: this.canvas,
          y: 1,
          fileType: this.fileType || 'png',
          success: (res) => {
            this.preview && wx.previewImage({
              urls: [res.tempFilePath]
            })
            resolve(res.tempFilePath)
          },
          fail: (error) => {
            reject(error)
          }
        })
      }, 200))
    })
  }

  draw() {
    return new Promise((resolve, reject) => {
      this.drawIntervalID = setInterval(() => {
        if((this.drawComplateCount === this.renderElementLength) && !this.extraQueue.length){
          this.generateImage().then((res) => {
            resolve(res)
            this.extraFunExcuting = false
          })
          clearInterval( this.drawIntervalID)
          this.drawIntervalID = null
        }
      },10)
      setTimeout(() => {
        reject('timeout')
        this.drawIntervalID && console.warn('网络超时，请重试')
        this.drawIntervalID && clearInterval( this.drawIntervalID)
        this.drawIntervalID = null
      },this.options.timeout || 5 * 1000)
    })
    
  }
  /**
   * 下载所需渲染的图片
   * @param {String} filePath 
   */
  downloadPromise(filePath) {
    return new Promise((resolve,reject) => {
      wx.downloadFile({
        url: filePath.replace(/^(http:\/\/)/g, 'https://'),
        success: (res) => {
          resolve(res);
        },
        fail: (err) => {
          reject('downloadFailed')
        }
      })
    });
  }
  hasDrawComplete() {
    return (this.drawComplateCount === this.renderElementLength)
  }
  setDrawStatus() {
    if((this.drawComplateCount < this.renderElementLength)) {
      this.extraFunExcuting = false
      this.excuteExtraFun()
    }
  }
  /**
   * 渲染图片
   * @param {String} imageUrl 
   * @param  {...any} args 
   */
  drawImage(content) {
    let { path, x, y, width, height, blur } = content
    this.ctx.drawImage(path, x, y, width, height);
    this.ctx.draw(true);
    this.drawComplateCount += 1
    this.extraFunExcuting = false
    this.haveExtraData && this.setDrawStatus()
  }
  /**
   * 
   * @param {String} path  图片地址
   * @param {Number} cx    起始x坐标
   * @param {Number} cy    起始y坐标
   * @param {Number} cr    圆角半径
   * @param {Number} borderColor 边框颜色
   */
  drawArcImage(content) {
    let { path, x, y, radius, borderColor = 'transparent', borderWidth = 0 } = content
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.setLineWidth(borderWidth);
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.setStrokeStyle(borderColor);
    this.ctx.stroke();
    this.ctx.clip();
    this.ctx.drawImage(path, x - radius, y - radius, 2 * radius, 2 * radius);
    this.ctx.draw(true);
    this.ctx.restore();
    this.drawComplateCount += 1
    this.extraFunExcuting = false
    this.haveExtraData && this.setDrawStatus()
  }
  /**
   * 
   * @param {Number} x       起始x坐标
   * @param {Number} y       起始y坐标
   * @param {Number} width   矩形宽
   * @param {Number} height  矩形高
   * @param {String} color   边框颜色
   * @param {String} backgroundColor 背景颜色
   * @param  {...any} args 
   */
  drawRect(content) {
    let { x, y, width, height, borderColor, backgroundColor = '#fff', radius, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius,lineWidth = 0} = content
    this.ctx.setFillStyle(backgroundColor);
    this.ctx.beginPath()
    this.ctx.moveTo(x + (radius || topLeftRadius || 0), y);
    (radius || topRightRadius)    ?  this.ctx.lineTo(x + width - (radius || topRightRadius) , y): this.ctx.lineTo(x + width , y);
    (radius || topRightRadius)    && this.ctx.arc(x + width - (radius || topRightRadius), y + (radius || topRightRadius), (radius || topRightRadius), 1.5 * Math.PI, 2 * Math.PI, false);
    (radius || bottomRightRadius) ?  this.ctx.lineTo(x + width , y + height - (radius || bottomRightRadius)) : this.ctx.lineTo(x + width, y + height);
    (radius || bottomRightRadius) && this.ctx.arc(x + width - (radius || bottomRightRadius), y + height - (radius || bottomRightRadius), (radius || bottomRightRadius), 0, 0.5 * Math.PI, false);
    (radius || bottomLeftRadius)  ?  this.ctx.lineTo(x + (radius || bottomLeftRadius), y + height) : this.ctx.lineTo(x, y + height);
    (radius || bottomLeftRadius)  && this.ctx.arc(x + (radius || bottomLeftRadius), y + height - (radius || bottomLeftRadius), (radius || bottomLeftRadius), 0.5 * Math.PI, Math.PI, false);
    (radius || topLeftRadius)     ?  this.ctx.lineTo(x, y + (radius || topLeftRadius)) : this.ctx.lineTo(x, y);
    (radius || topLeftRadius)     && this.ctx.arc(x + (radius || topLeftRadius), y + (radius || topLeftRadius), (radius || topLeftRadius), Math.PI, 1.5 * Math.PI, false);
    this.ctx.fill();
    this.ctx.setLineWidth(lineWidth);
    this.ctx.setStrokeStyle(borderColor);
    this.ctx.stroke();
    this.ctx.draw(true);
    this.drawComplateCount += 1
    this.extraFunExcuting = false
    this.haveExtraData && this.setDrawStatus()
  }
  /**
   * 
   * @param {*} content 
   */
  drawCircle(content) {
    let { x, y, backgroundColor = 'red', borderStyle, borderColor = backgroundColor, radius, borderWidth = 0, dashedWidth = 2, dashedOffset = 2} = content
    this.ctx.beginPath()
    this.ctx.lineWidth = borderWidth
    borderStyle == 'dashed' && this.ctx.setLineDash([dashedWidth, dashedOffset]);
    this.ctx.arc(x, y, radius, 0, Math.PI * 2, )
    this.ctx.setFillStyle(backgroundColor)
    this.ctx.fill()
    this.ctx.setStrokeStyle(borderColor)
    this.ctx.stroke()
    this.ctx.draw(true)
    this.drawComplateCount += 1
    this.extraFunExcuting = false
    this.haveExtraData && this.setDrawStatus()
  }
  /**
   * 
   * @param {*} content 
   */
  drawLine(content) {
    let { x, y, width, height = 2, dashedWidth = 5, lineStyle, dashedHeight = 5, dashedOffset = 5, type , color = 'red' } = content
    this.ctx.beginPath()
    this.ctx.moveTo(x,y)
    this.ctx.lineWidth = type == "vertical" ? width : height;
    lineStyle == 'dashed' && this.ctx.setLineDash([type == "vertical" ? dashedHeight : dashedWidth , dashedOffset]);
    this.ctx.setStrokeStyle(color)
    this.ctx.lineTo(type == "vertical" ? x : x + width , type == "vertical" ? y + height: y)
    this.ctx.stroke()
    this.ctx.draw(true)
    this.drawComplateCount += 1
    this.extraFunExcuting = false
    this.haveExtraData && this.setDrawStatus()
  }
  /**
   * 渲染文字
   * @param {Object} item 
   */
  drawText(item) {
    let {
      text, 
      fontSize = 20, 
      x = 0, 
      y = 0, 
      color = '#000', 
      textAlign = 'center' ,
      padding,
      paddingLeft,
      paddingRight
     } = item
    this.ctx.setTextAlign(textAlign)
    this.ctx.setFontSize(fontSize)
    this.ctx.setFillStyle(color)
    this.ctx.setTextBaseline('top')
    if(/(.*\$\{(.*)\}\$)/.test(text)) {
      let space = /(.*\$\{(.*)\}\$)/.exec(text)[2]
      let spaceString = " "
      for(let i = 0; i < space; i ++) {
        spaceString += " "
      }
      text = text.replace(/\$\{(.*)\}\$/, spaceString)
    }
    if( padding ) {
        this.drawTextWidthPadding(this.canvasWidth - padding * 2, item, text, textAlign == 'center' ? this.canvasWidth / 2 : textAlign == 'right' ? this.canvasWidth - padding : padding)
    } else if(paddingLeft && !paddingRight) {
        this.drawTextWidthPadding(this.canvasWidth - paddingLeft, item, text, paddingLeft)
    } else if(!paddingLeft && paddingRight) {
      this.drawTextWidthPadding(this.canvasWidth - paddingRight,item, text, x)
    } else if(paddingLeft && paddingRight) {
      this.drawTextWidthPadding(this.canvasWidth - paddingRight - paddingLeft, item, text, paddingLeft)
    } else {
      this.ctx.fillText(text, x, y)
    }
    this.ctx.draw(true)
    this.drawComplateCount += 1
    this.extraFunExcuting = false
    this.haveExtraData && this.setDrawStatus()
  }
  drawTextWidthPadding(widthOfRow,item, text, x) {
    let {
      fontSize = 20, 
      lineHeight = 10,
      y = 0, 
     } = item
    let charCountOfRow = Math.floor(widthOfRow/fontSize)
    let charGroup      = Math.ceil(text.length / charCountOfRow)
    for(let i = 0; i < charGroup; i ++) {
      this.ctx.fillText(text.substring(i * charCountOfRow, (i + 1) * charCountOfRow), x,  i > 0 ? y + i * (fontSize + lineHeight) : y)
    }
  }
  /**
   * 排序
   * @param {Array} arraytoSort 
   * @param {Boolean} flag 倒序
   */
  sort(arraytoSort, flag){
    let temp;
    for(let i = 1; i< arraytoSort.length; i++){
        for(let j = i-1; j>=0; j--){
          if(flag) {
            if( Number(arraytoSort[j+1].zIndex) < Number(arraytoSort[j].zIndex) ){
              temp = arraytoSort[j+1];
              arraytoSort[j+1] = arraytoSort[j];
              arraytoSort[j] = temp;
            }   
          }else{
            if( Number(arraytoSort[j+1].zIndex) > Number(arraytoSort[j].zIndex) ){
              temp = arraytoSort[j+1];
              arraytoSort[j+1] = arraytoSort[j];
              arraytoSort[j] = temp;
            }   
          }
        }   
    }
    return arraytoSort  
  }
  /**
   * 图片进行高斯模糊
   * @param {} imgData 
   */
  gaussBlur(imgObj) {
    wx.canvasGetImageData({
      canvasId: this.canvas,
      x: 0,
      y: 0,
      height: 400,
      width: 300,
      success: (imgData) => {
        let pixes = imgData.data;
        let width = imgData.width;
        let height = imgData.height;
        let gaussMatrix = [],
            gaussSum = 0,
            x, y,
            r, g, b, a,
            i, j, k, len;
        let radius = 10;
        let sigma = 50;
            a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
            b = -1 / (2 * sigma * sigma);
        //生成高斯矩阵
        for (i = 0, x = -radius; x <= radius; x++, i++){
            g = a * Math.exp(b * x * x);
            gaussMatrix[i] = g;
            gaussSum += g;

        }
        //归一化, 保证高斯矩阵的值在[0,1]之间
        for (i = 0, len = gaussMatrix.length; i < len; i++) {
            gaussMatrix[i] /= gaussSum;
        }
        //x 方向一维高斯运算
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                r = g = b = a = 0;
                gaussSum = 0;
                for(j = -radius; j <= radius; j++){
                    k = x + j;
                    if(k >= 0 && k < width){//确保 k 没超出 x 的范围
                        //r,g,b,a 四个一组
                        i = (y * width + k) * 4;
                        r += pixes[i] * gaussMatrix[j + radius];
                        g += pixes[i + 1] * gaussMatrix[j + radius];
                        b += pixes[i + 2] * gaussMatrix[j + radius];
                        // a += pixes[i + 3] * gaussMatrix[j];
                        gaussSum += gaussMatrix[j + radius];
                    }
                }
                i = (y * width + x) * 4;
                // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
                // console.log(gaussSum)
                pixes[i] = r / gaussSum;
                pixes[i + 1] = g / gaussSum;
                pixes[i + 2] = b / gaussSum;
                // pixes[i + 3] = a ;
            }
        }
        //y 方向一维高斯运算
        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                r = g = b = a = 0;
                gaussSum = 0;
                for(j = -radius; j <= radius; j++){
                    k = y + j;
                    if(k >= 0 && k < height){//确保 k 没超出 y 的范围
                        i = (k * width + x) * 4;
                        r += pixes[i] * gaussMatrix[j + radius];
                        g += pixes[i + 1] * gaussMatrix[j + radius];
                        b += pixes[i + 2] * gaussMatrix[j + radius];
                        // a += pixes[i + 3] * gaussMatrix[j];
                        gaussSum += gaussMatrix[j + radius];
                    }
                }
                i = (y * width + x) * 4;
                pixes[i] = r / gaussSum;
                pixes[i + 1] = g / gaussSum;
                pixes[i + 2] = b / gaussSum;
            }
        }
        wx.canvasPutImageData({
          canvasId: this.canvas,
          ...imgData,
          success: (data) => {
          }
        })
      }
    })
  }
}

/***/ })

/******/ });
//# sourceMappingURL=index.js.map