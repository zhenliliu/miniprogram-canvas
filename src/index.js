/**
 * 小程序画图脚本
 * @author liuzhenli
 * 使用方法见 https://github.com/zhenliliu/miniprogram-canvas
 */
export default class ShareImageBuilder {

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
    let options = this.extraQueue.shift()
    if(!options || this.extraFunExcuting) return;
    this.extraFunExcuting = true
    this.renderElementLength += options.length
    for(let i = 0, len = options.length; i < len; i++) {
      if(options[i].drawType === 'text' || options[i].drawType === 'rect'){
        this.drawController(options[i])
      } else if(options[i].drawType === 'image') {
        this.downloadPromise(options[i].url).then((res) => {
          options[i].path = res.tempFilePath
          this.drawController(options[i])
        })
      }
    }
  }
  /**
   * 需要额外渲染的元素
   * @param { Object| Array} options 
   */
  setExtraData(options) {
    if(Array.isArray(options)) {
      if(!options.length) return ;
      this.extraQueue.push(options)
      this.haveExtraData = true;
      let intervalID = setInterval(() => {
        if(this.drawComplate) {
          clearInterval(intervalID)
          intervalID = null
          this.excuteExtraFun()
        }
      }, 100);
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
      useBgImage ? this.drawImage(path,0,0,width, height, useBgImage) : this.drawRect(0,0, width, height);
      this.drawMainContent();
    })
  }
  drawMainContent() {
    let { textArr= [], rectArr = [] } = this.options
    this.preDrawContentArr = this.sort(this.formatImgsInfoArr.concat(textArr).concat(rectArr), true)
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
    let { drawType ,url, path, x, y, width, height, text, color,  avatar, radius, bgColor, tlr = 0, trr = 0, blr = 0, brr = 0, lineWidth} = content;
    (drawType ==='image' && url && path) && (avatar ? this.drawArcImage(path, x, y, radius, color) : this.drawImage(path, x, y, width, height));
    (drawType ==='text' && text && color) && this.drawText(content);
    (drawType === 'rect' && width && height) && this.drawRect(x, y, width, height, color, bgColor, radius, tlr, trr, blr, brr,lineWidth);
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
        if(this.drawComplateCount === this.renderElementLength){
          this.generateImage().then((res) => {
            resolve(res)
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
  setDrawStatus() {
    if((this.drawComplateCount == this.renderElementLength) && this.extraFunExcuting) {
      this.extraFunExcuting = false
      this.excuteExtraFun()
    }
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
    this.haveExtraData && this.setDrawStatus()
  }
  /**
   * 
   * @param {String} path  图片地址
   * @param {Number} cx    起始x坐标
   * @param {Number} cy    起始y坐标
   * @param {Number} cr    圆角半径
   * @param {Number} color 边框颜色
   */
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
    this.haveExtraData && this.setDrawStatus()
  }
  /**
   * 
   * @param {Number} x       起始x坐标
   * @param {Number} y       起始y坐标
   * @param {Number} width   矩形宽
   * @param {Number} height  矩形高
   * @param {String} color   边框颜色
   * @param {String} bgColor 背景颜色
   * @param  {...any} args 
   */
  drawRect(x, y, width, height, color = '#fff', bgColor = "#fff", ...args ) {
    let [radius, tlr, trr, blr, brr, lineWidth = 0] = args
    this.ctx.setFillStyle(bgColor);
    this.ctx.beginPath()
    this.ctx.moveTo(x + (radius || tlr || 0), y);
    (radius || trr) ? this.ctx.lineTo(x + width - (radius || trr) , y): this.ctx.lineTo(x + width , y);
    (radius || trr) && this.ctx.arc(x + width - (radius || trr), y + (radius || trr), (radius || trr), 1.5 * Math.PI, 2 * Math.PI, false);
    (radius || brr) ? this.ctx.lineTo(x + width , y + height - (radius || brr)) : this.ctx.lineTo(x + width, y + height);
    (radius || brr) && this.ctx.arc(x + width - (radius || brr), y + height - (radius || brr), (radius || brr), 0, 0.5 * Math.PI, false);
    (radius || blr) ? this.ctx.lineTo(x + (radius || blr), y + height) : this.ctx.lineTo(x, y + height);
    (radius || blr) && this.ctx.arc(x + (radius || blr), y + height - (radius || blr), (radius || blr), 0.5 * Math.PI, Math.PI, false);
    (radius || tlr) ? this.ctx.lineTo(x, y + (radius || tlr)) : this.ctx.lineTo(x, y);
    (radius || tlr) && this.ctx.arc(x + (radius || tlr), y + (radius || tlr), (radius || tlr), Math.PI, 1.5 * Math.PI, false);
    this.ctx.fill();
    this.ctx.setLineWidth(lineWidth);
    this.ctx.setStrokeStyle(color);
    this.ctx.stroke();
    this.ctx.draw(true);
    this.drawComplateCount += 1
    this.haveExtraData && this.setDrawStatus()
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
  gaussBlur(imgData, limitArr) {
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
    if(limitArr){
        for(let l=0;l<limitArr.length;l++){
            let curLimitObj = limitArr[l];
            let limitConvert = function(val,max){
                if(val>=0){
                    return val;
                }else{
                    return max+val;
                }
            };
            let minX = curLimitObj.x && curLimitObj.x.min? limitConvert(curLimitObj.x.min, width): 0;
            let maxX = curLimitObj.x && curLimitObj.x.max? limitConvert(curLimitObj.x.max, width): width;
            let minY = curLimitObj.y && curLimitObj.y.min? limitConvert(curLimitObj.y.min, height): 0;
            let maxY = curLimitObj.y && curLimitObj.y.max? limitConvert(curLimitObj.y.max, height): height;
            //x 方向一维高斯运算
            for(y = minY; y < maxY; y++){
                for(x = minX; x<maxX; x++){
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
            for (x = minX; x < maxX; x++) {
                for (y = minY; y < maxY; y++) {
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
        }
    }else{
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
    }
    return imgData;
  }
}
