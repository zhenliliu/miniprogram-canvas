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
    this.drawComplateCount   = -1
    this.setCanvasMeasure(this.canvasWidth, this.canvasHeight)
    this.initAllImageInfo()
    this.getAllImgInfo()
  }
  /**
   * 设置画布的大小
   * @param {Number} canvasWidth 
   * @param {Number} canvasHeight 
   */
  setCanvasMeasure(canvasWidth, canvasHeight) {
    this.page.setData({
      canvasHeight,
      canvasWidth
    })
  }
  /**
   * 需要额外渲染的元素
   * @param { Object| Array} options 
   */
  setExtraData(options) {
    let executeFun = () => {
        if(Array.isArray(options)) {
          for(let i = 0, len = options.length; i < len; i++) {
            this.renderElementLength += 1
            if(options[i].drawType === 'text' || options[i].drawType === 'rect'){
              this.drawController(options[i])
            } else if(options[i].drawType === 'image') {
              this.downloadPromise(options[i].url).then((res) => {
                options[i].path = res.tempFilePath
                this.drawController(options[i])
              })
            }
          }
        } else if(typeof options === 'object') {
          this.drawController(options)
        } else {
          this.extraData = false
          console.error('数据格式不正确！')
        }
    }
    if( this.drawComplate) {
      executeFun()
    }else{
      this.observeFun = executeFun
    }
  }
  /**
   * 获取文本宽度
   * @param {String} text 
   */
  getTextWidth(text) {
    return this.ctx.measureText(text)
  }
 
  initAllImageInfo() {
    let { imgArr = [] } = this.options
    imgArr = this.sort(imgArr)
    for(let i = 0, j = imgArr.length; i < j ; i++) {
      this.formatImgsInfoArr.push( this.formatImageInfo(imgArr[i]))
    }
  }
  /**
   * 格式化所有渲染图片的参数:URL;height; width
   * @param {Object} imgItemObj 
   */
  formatImageInfo(imgItemObj) {
    return  new Promise((resolve, reject) => {
      this.downloadPromise(imgItemObj.url).then((res) => {
        wx.getImageInfo({
          src: res.tempFilePath,
          success: (imageInfo) => {
            resolve({
              ...imgItemObj, 
              ...imageInfo, 
              height: imgItemObj.height || imageInfo.height,
              width: imgItemObj.width || imageInfo.width
            })
          },
          fail: (errorInfo) => {
            reject(errorInfo)
          }
        })
      })
    })
  }
  getAllImgInfo() {
    Promise.all(this.formatImgsInfoArr).then((arr) => {
      this.canDraw = true
      this.formatImgsInfoArr = arr
      this.initCanvas()
    }).catch(e => {
      console.warn('网络开小差了')
    })
  }
  initCanvas() {
    let { useBgImage } = this.options
    let { path, height = 1334, width = 750 } = useBgImage ? this.formatImgsInfoArr.pop() : this.options
    this.canvasHeight  = height
    this.canvasWidth   = width
    this.page.setData({
      canvasHeight: height,
      canvasWidth: width
    }, () => {
      useBgImage ? this.drawImage(path,0,0,width, height) : this.drawRect(0,0, width, height);
      this.drawMainContent();
    })
  }
  drawMainContent() {
    let { textArr= [], rectArr = []} = this.options
    this.preDrawContentArr = this.sort(this.formatImgsInfoArr.concat(textArr).concat(rectArr), true)
    this.renderElementLength = this.preDrawContentArr.length
    for(let i = 0, len = this.preDrawContentArr.length; i < len; i++) {
      if(!this.preDrawContentArr[i].$D) {
        this.drawController(this.preDrawContentArr[i])
        this.preDrawContentArr[i]['$D'] = true
      }
      if(i === len - 1) {
        let intervalID = setInterval(() => {
          if(this.drawComplateCount === len) {
            this.observeFun && this.observeFun()
            this.drawComplate = true
            clearInterval(intervalID)
            intervalID = null
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
    let { drawType ,url, path, x, y, width, height, text, color,  avatar, radius, bgColor, tlr = 0, trr = 0, blr = 0, brr = 0} = content;
    (drawType ==='image' && url && path) && (avatar ? this.drawArcImage(path, x, y, radius, color) : this.drawImage(path, x, y, width, height));
    (drawType ==='text' && text && color) && this.drawText(content);
    (drawType === 'rect' && width && height) && this.drawRect(x, y, width, height, color, bgColor, radius, tlr, trr, blr, brr);
  }
  /**
   * 生成图片
   */
  generateImage() {
    return new Promise((resolve, reject) => {
      this.ctx.draw(true, () => {
        wx.canvasToTempFilePath({
          canvasId: this.canvas,
          y       : 1,
          fileType: this.fileType || 'png',
          success: (res) => {
            this.preview && wx.previewImage({urls: [res.tempFilePath]})
            resolve(res.tempFilePath)
          },
        })
      })
    })
  }
  draw() {
    return new Promise((resolve, reject) => {
      let intervalID = setInterval(() => {
        if(this.drawComplateCount === this.renderElementLength){
          this.generateImage().then((res) => {
            resolve(res)
          })
          clearInterval(intervalID)
          intervalID = null
        }
      },10)
      setTimeout(() => {
        reject('timeout')
        intervalID && console.warn('网络超时，请重试')
        intervalID && clearInterval(intervalID)
        intervalID = null
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
        success: (res) => resolve(res),
        fail   : (err) => reject('downloadFailed')
      })
    });
  }
  /**
   * 渲染图片
   * @param {String} imageUrl 
   * @param  {...any} args 
   */
  drawImage(imageUrl, ...args) {
    this.ctx.drawImage(imageUrl, ...args);
    this.ctx.draw(true);
    this.drawComplateCount += 1
  }
  drawArcImage(path, cx, cy, cr, color = '#000') {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.setLineWidth(2);
    this.ctx.arc(cx, cy, cr, 0, 2 * Math.PI);
    this.ctx.setStrokeStyle(color);
    this.ctx.stroke();
    this.ctx.clip();
    this.ctx.drawImage(path, cx - cr, cy - cr, 2 * cr, 2 * cr);
    this.ctx.draw(true);
    this.ctx.restore();
    this.drawComplateCount += 1
  }
  /**
   * 
   * @param {Number} x 
   * @param {Number} y 
   * @param {Number} width 
   * @param {Number} height 
   * @param {String} color 
   * @param {String} bgColor 
   * @param  {...any} args 
   */
  drawRect(x, y, width, height, color = '#fff', bgColor = "#fff", ...args ) {
    let [radius, tlr, trr, blr, brr] = args
    this.ctx.setFillStyle(bgColor);
    this.ctx.beginPath()
    this.ctx.moveTo(x + (radius || tlr || 0), y);
    (radius || trr) ?  this.ctx.lineTo(x + width - (radius || trr) , y): this.ctx.lineTo(x + width , y);
    (radius || trr) && this.ctx.arc(x + width - (radius || trr), y + (radius || trr), (radius || trr), 1.5 * Math.PI, 2 * Math.PI, false);
    (radius || brr) ?  this.ctx.lineTo(x + width , y + height - (radius || brr)) : this.ctx.lineTo(x + width, y + height);
    (radius || brr) && this.ctx.arc(x + width - (radius || brr), y + height - (radius || brr), (radius || brr), 0, 0.5 * Math.PI, false);
    (radius || blr) ?  this.ctx.lineTo(x + (radius || blr), y + height) : this.ctx.lineTo(x, y + height);
    (radius || blr) && this.ctx.arc(x + (radius || blr), y + height - (radius || blr), (radius || blr), 0.5 * Math.PI, Math.PI, false);
    (radius || tlr) ?  this.ctx.lineTo(x, y + (radius || tlr)) : this.ctx.lineTo(x, y);
    (radius || tlr) && this.ctx.arc(x + (radius || tlr), y + (radius || tlr), (radius || tlr), Math.PI, 1.5 * Math.PI, false);
    this.ctx.fill();
    this.ctx.setLineWidth(0);
    this.ctx.setStrokeStyle(color);
    this.ctx.stroke();
    this.ctx.draw(true);
    this.drawComplateCount += 1
  }
  drawCircle() {

  }
  /**
   * 渲染文字
   * @param {Object} item 
   */
  drawText(item) {
    let {
      text, 
      padding,
      x          = 0, 
      y          = 0, 
      fontSize   = 20, 
      color      = '#000', 
      textAlign  = 'center' ,
      lineHeight = 10
     } = item
    this.ctx.setTextAlign(textAlign)
    this.ctx.setFontSize(fontSize)
    this.ctx.setFillStyle(color)
    this.ctx.setTextBaseline('top')
    if(/(.*\$\{(.*)\}\$)/.test(text)) {
      let space       = /(.*\$\{(.*)\}\$)/.exec(text)[2]
      let spaceString = " "
      for(let i = 0; i < space; i ++) {
        spaceString += " "
      }
      text = text.replace(/\$\{(.*)\}\$/, spaceString)
    }
    if( padding ) {
      let canvasWidth    = this.canvasWidth
      let widthOfRow     = canvasWidth - padding * 2
      let charCountOfRow = Math.floor(widthOfRow/fontSize)
      let charGroup      = Math.ceil(text.length / charCountOfRow)
      for(let i = 0; i < charGroup; i ++) {
        this.ctx.fillText(text.substring(i * charCountOfRow, (i + 1) * charCountOfRow), padding,  i > 0 ? y + i * (fontSize + lineHeight) : y)
      }
    } else {
      this.ctx.fillText(text, x, y)
    }
    this.ctx.draw(true)
    this.drawComplateCount += 1
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
              temp             = arraytoSort[j+1];
              arraytoSort[j+1] = arraytoSort[j];
              arraytoSort[j]   = temp;
            }   
          }else{
            if( Number(arraytoSort[j+1].zIndex) > Number(arraytoSort[j].zIndex) ){
              temp             = arraytoSort[j+1];
              arraytoSort[j+1] = arraytoSort[j];
              arraytoSort[j]   = temp;
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
  gaussBlur(imgData) {
    var pixes = imgData.data;
    var width = imgData.width;
    var height = imgData.height;
    var gaussMatrix = [],
        gaussSum = 0,
        x, y,
        r, g, b, a,
        i, j, k, len;

    var radius = 10;
    var sigma = 5;

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
    return imgData;
  }
}

/***/ })

/******/ });
//# sourceMappingURL=index.js.map