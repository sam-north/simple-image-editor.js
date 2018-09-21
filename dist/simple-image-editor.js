function simpleImageEditor() {
  var configSettings;
  if (arguments.length === 1 && typeof (arguments[0]) === 'string') {
    configSettings = {
      containerId: arguments[0]
    };
  }
  else {
    for (var i = 0; i < arguments.length; i++) {
      if (typeof (arguments[i]) === 'object') {
        configSettings = arguments[i];
        break;
      }
    }
    configSettings = configSettings || {};
    for (var j = 0; j < arguments.length; j++) {
      if (typeof (arguments[j]) === 'string') {
        configSettings.containerId = arguments[j];
        break;
      }
    }
  }
  var drawingControlTypes = {
    pencil: 0,
    line: 1,
    arrow: 2,
    eraser: 3,
    square: 4,
    circle: 5
  };
  var canvas,
    canvasContext,
    hiddenDrawingCanvas,
    hiddenDrawingCanvasContext,
    imgCanvas,
    imgCanvasContext,
    finalCanvas,
    finalCanvasContext,
    canvasStrokeStyle,
    canvasStrokeLineWidth = configSettings.defaultDrawingThickness || 6,
    mouseInfo,
    isDrawing = false,
    uneditedImageFileNameNoExtension,
    uneditedImageFileName,
    currentDrawingControl,
    showDownloadButton = configSettings.showDownloadButton !== undefined ? configSettings.showDownloadButton : true,
    showSaveButton = configSettings.showSaveButton !== undefined ? configSettings.showSaveButton : false,
    imageRotationAngle = 0;

  function clipboardPaste() {
    var _self = this;
    var ctrl_pressed = false;
    var command_pressed = false;
    var paste_event_support;
    var pasteCatcher;

    //handlers
    document.addEventListener('keydown', function (e) {
      _self.on_keyboard_action(e);
    }, false); //firefox fix
    document.addEventListener('keyup', function (e) {
      _self.on_keyboardup_action(e);
    }, false); //firefox fix
    document.addEventListener('paste', function (e) {
      _self.paste_auto(e);
    }, false); //official paste handler

    //constructor - we ignore security checks here
    this.init = function () {
      pasteCatcher = document.createElement("div");
      pasteCatcher.setAttribute("id", "paste_ff");
      pasteCatcher.setAttribute("contenteditable", "");
      pasteCatcher.style.cssText = 'opacity:0;position:fixed;top:0px;left:0px;width:10px;margin-left:-20px;';
      document.body.appendChild(pasteCatcher);

      // create an observer instance
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (paste_event_support === true || ctrl_pressed == false || mutation.type != 'childList') {
            //we already got data in paste_auto()
            return true;
          }

          //if paste handle failed - capture pasted object manually
          if (mutation.addedNodes.length == 1) {
            if (mutation.addedNodes[0].src != undefined) {
              //image
              _self.paste_createImage(mutation.addedNodes[0].src);
            }
            //register cleanup after some time.
            setTimeout(function () {
              pasteCatcher.innerHTML = '';
            }, 20);
          }
        });
      });
      var target = document.getElementById('paste_ff');
      var config = { attributes: true, childList: true, characterData: true };
      observer.observe(target, config);
    }();
    //default paste action
    this.paste_auto = function (e) {
      paste_event_support = false;
      if (pasteCatcher != undefined) {
        pasteCatcher.innerHTML = '';
      }
      if (e.clipboardData) {
        var items = e.clipboardData.items;
        if (items) {
          paste_event_support = true;
          //access data directly
          for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
              //image
              var blob = items[i].getAsFile();
              var URLObj = window.URL || window.webkitURL;
              var source = URLObj.createObjectURL(blob);
              this.paste_createImage(source);
            }
          }
          e.preventDefault();
        }
        else {
          //wait for DOMSubtreeModified event
          //https://bugzilla.mozilla.org/show_bug.cgi?id=891247
        }
      }
    };
    //on keyboard press
    this.on_keyboard_action = function (event) {
      k = event.keyCode;
      //ctrl
      if (k == 17 || event.metaKey || event.ctrlKey) {
        if (ctrl_pressed == false)
          ctrl_pressed = true;
      }
      //v
      if (k == 86) {
        if (document.activeElement != undefined && document.activeElement.type == 'text') {
          //let user paste into some input
          return false;
        }

        if (ctrl_pressed == true && pasteCatcher != undefined) {
          pasteCatcher.focus();
        }
      }
    };
    //on kaybord release
    this.on_keyboardup_action = function (event) {
      //ctrl
      if (event.ctrlKey == false && ctrl_pressed == true) {
        ctrl_pressed = false;
      }
      //command
      else if (event.metaKey == false && command_pressed == true) {
        command_pressed = false;
        ctrl_pressed = false;
      }
    };
    //draw pasted image to canvas
    this.paste_createImage = function (source) {
      var pastedImage = new Image();
      pastedImage.onload = function () {
        loadImageFromUrl(pastedImage);
      };
      pastedImage.src = source;
    };
  }

  function loadImageFromFileInput(e) {
    var file = e.target.files[0];
    var fileReader = new FileReader();
    fileReader.onload = imageLoadedHandler;
    fileReader.readAsDataURL(file);
    buildFileName(file.name);
  }

  function loadImageFromUrl(jsImage) {
    buildFileName(jsImage.src);
    setHiddenImgPreviewSrc(jsImage.src);
  }

  function setHiddenImgPreviewSrc(src) {
    var hiddenImagePreview = document.getElementById('sie-hp');
    hiddenImagePreview.setAttribute('src', src);
    loadImageSetup();
  }

  function imageLoadedHandler(e) {
    setHiddenImgPreviewSrc(e.target.result);
  }

  function drawImageToCanvas() {
    var hiddenImagePreview = document.getElementById('sie-hp');
    var imageProportionScale = hiddenImagePreview.width / imgCanvas.width;
    var imageScaledWidth = imgCanvas.width;
    var imageScaledHeight = imgCanvas.height;
    if (hiddenImagePreview.width >= hiddenImagePreview.height) {
      imageScaledHeight = hiddenImagePreview.height / imageProportionScale;
    }
    else {
      imageProportionScale = hiddenImagePreview.height / imgCanvas.height;
      imageScaledWidth = hiddenImagePreview.width / imageProportionScale;
    }
    imgCanvasContext.drawImage(hiddenImagePreview, 0, 0, imageScaledWidth, imageScaledHeight);
  }

  function loadImageSetup() {
    toggleControls((configSettings.hideAllControls !== undefined && configSettings.hideAllControls === true) ? 'hide' : 'show');
    imageRotationAngle = 0;
    imgCanvasContext.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    initializeImageEditorControlEventListeners();
  }

  function toggleControls(showOrHideParam) {
    var showOrHide = showOrHideParam;
    var controls = document.getElementById('sie-c');
    var hideClass = 'sie-h';
    var showClass = 'sie-ib';
    if (showOrHideParam === undefined)
      showOrHide = controls.classList.contains(hideClass) ? 'show' : 'hide';
    var addClass = showOrHide === 'show' ? showClass : hideClass;
    var removeClass = showOrHide === 'show' ? hideClass : showClass;
    controls.classList.remove(removeClass);
    controls.classList.add(addClass);
  }


  function buildFileName(fullName) {
    if (fullName && fullName !== '' && fullName.indexOf('blob:') !== 0) {
      var lastSlashIndex = fullName.lastIndexOf('\\');
      if (lastSlashIndex === -1)
        lastSlashIndex = fullName.lastIndexOf('/');

      uneditedImageFileName = lastSlashIndex === -1 ? fullName : fullName.substring(lastSlashIndex + 1);

      var fileExtensionIndexStart = uneditedImageFileName.lastIndexOf('.');
      if (fileExtensionIndexStart != -1)
        uneditedImageFileNameNoExtension = uneditedImageFileName.substring(0, fileExtensionIndexStart);
    }
    else {
      uneditedImageFileName = 'edited';
      uneditedImageFileNameNoExtension = uneditedImageFileName;
    }
  }

  function resetMouseInfo() {
    mouseInfo = {
      pX: 0,
      pY: 0,
      X: 0,
      Y: 0,
      beginX: 0,
      beginY: 0,
      endX: 0,
      endY: 0
    };
  }
  function rotateEverything(direction) {
    imgCanvasContext.save();
    var directionAngleModifier = (90 * direction);
    imageRotationAngle = (imageRotationAngle + directionAngleModifier) % 360;
    var radianRotationAngle = imageRotationAngle * Math.PI / 180;
    imgCanvasContext.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
    var absImageRotationAngle = Math.abs(imageRotationAngle);
    var xTranslation = imageRotationAngle === 90 || absImageRotationAngle === 180 || imageRotationAngle === -270 ? canvas.width : 0;
    var yTranslation = absImageRotationAngle === 180 || imageRotationAngle === 270 || imageRotationAngle === -90 ? canvas.height : 0;
    imgCanvasContext.translate(xTranslation, yTranslation);
    imgCanvasContext.rotate(radianRotationAngle);
    drawImageToCanvas();
    imgCanvasContext.rotate(-radianRotationAngle);
    imgCanvasContext.translate(-xTranslation, yTranslation);
    imgCanvasContext.restore();

    var hiddenRotationRadian = (directionAngleModifier * Math.PI / 180);
    var xDrawingTranslate = direction > 0 ? hiddenDrawingCanvas.width : 0;
    var yDrawingTranslate = direction > 0 ? 0 : hiddenDrawingCanvas.height;
    hiddenDrawingCanvasContext.translate(xDrawingTranslate, yDrawingTranslate);
    hiddenDrawingCanvasContext.rotate(hiddenRotationRadian);
    hiddenDrawingCanvasContext.clearRect(0, 0, hiddenDrawingCanvas.width, hiddenDrawingCanvas.height);
    hiddenDrawingCanvasContext.drawImage(canvas, 0, 0);
    hiddenDrawingCanvasContext.rotate(-hiddenRotationRadian);
    hiddenDrawingCanvasContext.translate(-xDrawingTranslate, -yDrawingTranslate);
    hiddenDrawingCanvasContext.restore();

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.drawImage(hiddenDrawingCanvas, 0, 0);
    hiddenDrawingCanvasContext.clearRect(0, 0, hiddenDrawingCanvas.width, hiddenDrawingCanvas.height);
  }

  function handleRotateRightButtonClick(e) {
    rotateEverything(1);
  }

  function handleRotateLeftButtonClick(e) {
    rotateEverything(-1);
  }

  function getCurrentMouseX(e) {
    return e.clientX - canvas.getBoundingClientRect().left;
  }

  function getCurrentMouseY(e) {
    return e.clientY - canvas.getBoundingClientRect().top;
  }

  function setMouseInfo(e) {
    mouseInfo.pX = mouseInfo.X;
    mouseInfo.pY = mouseInfo.Y;
    mouseInfo.X = getCurrentMouseX(e);
    mouseInfo.Y = getCurrentMouseY(e);
  }

  function drawPathOnCanvas() {
    canvasContext.beginPath();
    canvasContext.moveTo(mouseInfo.pX, mouseInfo.pY);
    canvasContext.lineTo(mouseInfo.X, mouseInfo.Y);
    canvasContext.strokeStyle = canvasStrokeStyle;
    canvasContext.lineWidth = canvasStrokeLineWidth;
    canvasContext.stroke();
    canvasContext.closePath();
  }

  function drawEraserOnCanvas() {
    var expandedLineWidth = canvasStrokeLineWidth * 3;
    canvasContext.clearRect(mouseInfo.X - canvasStrokeLineWidth, mouseInfo.Y - canvasStrokeLineWidth, expandedLineWidth, expandedLineWidth);
  }
  function drawSquareOnCanvas() {
    canvasContext.beginPath();
    canvasContext.moveTo(mouseInfo.beginX, mouseInfo.beginY);
    canvasContext.lineTo(mouseInfo.beginX, mouseInfo.endY);
    canvasContext.lineTo(mouseInfo.endX, mouseInfo.endY);
    canvasContext.lineTo(mouseInfo.endX, mouseInfo.beginY);
    canvasContext.lineTo(mouseInfo.beginX, mouseInfo.beginY);
    canvasContext.strokeStyle = canvasStrokeStyle;
    canvasContext.lineWidth = canvasStrokeLineWidth;
    canvasContext.stroke();
    canvasContext.closePath();
  }

  function drawCircleOnCanvas() {
    var xDifference = mouseInfo.endX - mouseInfo.beginX;
    var xDifferenceHalf = xDifference * 0.5;
    var xPoint = mouseInfo.endX - xDifferenceHalf;
    var yDifference = mouseInfo.endY - mouseInfo.beginY;
    var yDifferenceHalf = yDifference * 0.5;
    var yPoint = mouseInfo.endY - yDifferenceHalf;
    var distance = Math.sqrt(Math.pow(mouseInfo.endX - xPoint, 2) + Math.pow(mouseInfo.endY - yPoint, 2));
    canvasContext.beginPath();
    canvasContext.arc(xPoint, yPoint, distance, 0, 2 * Math.PI);
    canvasContext.strokeStyle = canvasStrokeStyle;
    canvasContext.lineWidth = canvasStrokeLineWidth;
    canvasContext.stroke();
    canvasContext.closePath();
  }

  function drawLineOnCanvas() {
    canvasContext.beginPath();
    canvasContext.moveTo(mouseInfo.beginX, mouseInfo.beginY);
    canvasContext.lineTo(mouseInfo.endX, mouseInfo.endY);
    canvasContext.strokeStyle = canvasStrokeStyle;
    canvasContext.lineWidth = canvasStrokeLineWidth;
    canvasContext.stroke();
    canvasContext.closePath();
  }

  function drawArrowOnCanvas() {
    var xDifference = mouseInfo.endX - mouseInfo.beginX;
    var xDifferenceTenth = xDifference * 0.1;
    var xDifferenceSmaller = xDifference * 0.07;
    var xPoint = mouseInfo.endX - xDifferenceTenth;
    var xPointSmaller = mouseInfo.endX - xDifferenceSmaller;
    var yDifference = mouseInfo.endY - mouseInfo.beginY;
    var yDifferenceTenth = yDifference * 0.1;
    var yDifferenceSmaller = yDifference * 0.07;
    var yPoint = mouseInfo.endY - yDifferenceTenth;
    var yPointSmaller = mouseInfo.endY - yDifferenceSmaller;
    var slopeTop = (mouseInfo.endY - mouseInfo.beginY);
    var slopeBottom = (mouseInfo.endX - mouseInfo.beginX);
    var perpendicularSlope = -1 * (slopeBottom / slopeTop);
    var points = getPerpendicularLinePointsForTriangle(xPoint, yPoint, canvasStrokeLineWidth * 2.5, perpendicularSlope);

    canvasContext.beginPath();
    canvasContext.moveTo(mouseInfo.beginX, mouseInfo.beginY);
    canvasContext.lineTo(xPointSmaller, yPointSmaller);
    canvasContext.strokeStyle = canvasStrokeStyle;
    canvasContext.lineWidth = canvasStrokeLineWidth;
    canvasContext.stroke();
    canvasContext.closePath();

    canvasContext.beginPath();
    canvasContext.moveTo(points.a.x, points.a.y);
    canvasContext.lineTo(points.b.x, points.b.y);
    canvasContext.lineTo(mouseInfo.endX, mouseInfo.endY);
    canvasContext.fillStyle = canvasStrokeStyle;
    canvasContext.fill();
    canvasContext.closePath();
  }

  function getPerpendicularLinePointsForTriangle(x, y, distance, slope) {
    var aX, aY, bX, bY;
    if (slope === 0) {
      aX = x + distance;
      aY = y;

      bX = x - distance;
      bY = y;
    }
    else if (!isFinite(slope)) {
      aX = x;
      aY = y + distance;

      bX = x;
      bY = y - distance;
    }
    else {
      var dX = (distance / Math.sqrt(1 + Math.pow(slope, 2)));
      var dY = slope * dX;

      aX = x + dX;
      aY = y + dY;

      bX = x - dX;
      bY = y - dY;
    }
    return {
      a: {
        x: aX,
        y: aY
      },
      b: {
        x: bX,
        y: bY
      }
    };
  }

  function handleImageEditorMouseBegin(e) {
    resetMouseInfo();
    mouseInfo.beginX = getCurrentMouseX(e);
    mouseInfo.beginY = getCurrentMouseY(e);
    setMouseInfo(e);
    isDrawing = true;
  }

  function handleImageEditorMouseMove(e) {
    if (isDrawing) {
      setMouseInfo(e);
      if (currentDrawingControl === drawingControlTypes.pencil) {
        drawPathOnCanvas();
      } else if (currentDrawingControl === drawingControlTypes.eraser) {
        drawEraserOnCanvas();
      }
    }
  }

  function handleImageEditorMouseEnd(e) {
    mouseInfo.endX = getCurrentMouseX(e);
    mouseInfo.endY = getCurrentMouseY(e);
    if (isDrawing && currentDrawingControl === drawingControlTypes.line)
      drawLineOnCanvas();
    else if (isDrawing && currentDrawingControl === drawingControlTypes.arrow)
      drawArrowOnCanvas();
    else if (isDrawing && currentDrawingControl === drawingControlTypes.square)
      drawSquareOnCanvas();
    else if (isDrawing && currentDrawingControl === drawingControlTypes.circle)
      drawCircleOnCanvas();
    isDrawing = false;
    resetMouseInfo();
  }

  function setColorForImageEditor(color) {
    var colorPickerElement = document.getElementById('sie-cp');
    if (color)
      colorPickerElement.value = color;
    canvasStrokeStyle = colorPickerElement.value;
  }

  function handleImageEditorSave() {
    var hiddenLink = document.getElementById('sie-hsl');
    var editedImageFileType = configSettings.exportImageFileType || 'png';

    var editedFileName = decodeURI(uneditedImageFileNameNoExtension + '.' + editedImageFileType);

    finalCanvasContext.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
    finalCanvasContext.drawImage(imgCanvas, 0, 0);
    finalCanvasContext.drawImage(canvas, 0, 0);

    var savedUrlOctet = finalCanvas.toDataURL("image/" + editedImageFileType).replace("image/" + editedImageFileType, "image/octet-stream");
    hiddenLink.setAttribute('download', editedFileName);
    hiddenLink.setAttribute('href', savedUrlOctet);

    return {
      originalFileName: decodeURI(uneditedImageFileName),
      base64Image: savedUrlOctet,
      editedFileName: editedFileName
    };
  }

  function handleImageEditorDownload() {
    handleImageEditorSave();
    var hiddenLink = document.getElementById('sie-hsl');
    hiddenLink.click();
  }

  function handleDrawingControlClick(e) {
    setCurrentDrawingControl(e.target.dataset.value);
  }

  function setCurrentDrawingControl(newValue) {
    var drawingControlValue = newValue;
    if (isNaN(drawingControlValue))
      drawingControlValue = drawingControlTypes[newValue];

    currentDrawingControl = Number(drawingControlValue);

    var drawingControlElements = document.getElementsByClassName('sie-dc');
    for (var key in drawingControlElements) {
      if (drawingControlElements.hasOwnProperty(key)) {
        var element = drawingControlElements[key];
        element.classList.remove('sie-pc');
        element.removeAttribute('disabled');

        if (Number(element.dataset.value) === currentDrawingControl) {
          element.setAttribute('disabled', 'disabled');
          element.classList.add('sie-pc');
        }
      }
    }
  }

  function setDrawingThickness(width, isManuallySet) {
    canvasStrokeLineWidth = Number(width);
    var lineWidthDisplayElement = document.getElementById('sie-lwd');
    if (isManuallySet) {
      var lineWidthSlider = document.getElementById('sie-lw');
      lineWidthSlider.value = canvasStrokeLineWidth;
    }
    lineWidthDisplayElement.textContent = canvasStrokeLineWidth;
  }

  function handleLineWidthChange(e) {
    setDrawingThickness(e.target.value);
  }

  function initializeImageEditorControlEventListeners() {
    var rotateButtonRightElement = document.getElementById('sie-rbr');
    rotateButtonRightElement.addEventListener('click', handleRotateRightButtonClick, false);
    var rotateButtonLeftElement = document.getElementById('sie-rbl');
    rotateButtonLeftElement.addEventListener('click', handleRotateLeftButtonClick, false);

    var lineWidthElement = document.getElementById('sie-lw');
    lineWidthElement.value = canvasStrokeLineWidth;
    lineWidthElement.addEventListener('change', handleLineWidthChange, false);
    setDrawingThickness(canvasStrokeLineWidth, true);

    var colorPickerElement = document.getElementById('sie-cp');
    colorPickerElement.addEventListener('change', setColorForImageEditor, false);
    colorPickerElement.value = configSettings.defaultDrawingColor || '#FF0000';
    setColorForImageEditor();

    canvas.addEventListener('mousedown', handleImageEditorMouseBegin, false);
    canvas.addEventListener('mousemove', handleImageEditorMouseMove, false);
    canvas.addEventListener('mouseup', handleImageEditorMouseEnd, false);
    canvas.addEventListener('mouseout', handleImageEditorMouseEnd, false);

    var imageEditorSaveButton = document.getElementById('sie-sb');

    if (showSaveButton)
      imageEditorSaveButton.addEventListener('click', handleImageEditorSave, false);
    else
      imageEditorSaveButton.parentElement.classList.add('sie-h');

    var iamgeEditorDownloadButton = document.getElementById('sie-d');
    if (showDownloadButton)
      iamgeEditorDownloadButton.addEventListener('click', handleImageEditorDownload, false);
    else
      iamgeEditorDownloadButton.classList.add('sie-h');

    var drawingControlElements = document.getElementsByClassName('sie-dc');
    for (var key in drawingControlElements) {
      if (drawingControlElements.hasOwnProperty(key)) {
        var element = drawingControlElements[key];
        element.addEventListener('click', handleDrawingControlClick, false);
      }
    }
    var initialDrawingControl = (configSettings.defaultDrawingControl && configSettings.defaultDrawingControl !== '') ? configSettings.defaultDrawingControl : drawingControlTypes.pencil;
    setCurrentDrawingControl(initialDrawingControl);
  }

  function generateCss() {
    var generatedCSS = '<style>#sie-cnv{position:relative}#sie-i-cnv{position:absolute}#sie-h-cnv{display:none;position:relative}#sie-f-cnv{display:none;position:relative}.sie-cnt{overflow:hidden;margin-bottom:10px;margin-top:10px;text-align:center;border:1px #000 solid}.sie-cnt>img{width:96%;position:absolute;display:block;top:0;left:6px}#sie-cnv:hover{cursor:cell}.sie-ib{display:inline-block}.sie-cc button{width:80px}.sie-h{display:none!important}#sie-cnt{display:hidden}#sie-c{vertical-align:top;margin-left:10px;min-width:180px;width:180px}#sie-c .sie-cc{margin-top:10px;margin-bottom:10px}.sie-pc{color:#fff;background-color:#494a4f;border:#767676 2px solid}#sie-lw{width:70px}.sie-bc{margin-right:10px;width:80px}</style>';
    return generatedCSS;
  }

  function generateHTML() {
    var generatedHTML = '<input id="sie-fu" type="file"><span>"ctrl + v" to paste</span><br><div id="sie"><canvas id="sie-i-cnv" class="sie-cnt"></canvas><canvas id="sie-cnv" class="sie-cnt"></canvas><canvas id="sie-h-cnv" class="sie-cnt"></canvas><canvas id="sie-f-cnv" class="sie-cnt"></canvas><div id="sie-cnt" class="sie-cnt sie-h"><img id="sie-hp"> <a id="sie-hsl"></a></div><div id="sie-c" class="sie-h"><div class="sie-bc sie-ib"><div class="sie-cc"><button id="sie-rbl">&lt;- Rotate</button></div></div><div class="sie-bc sie-ib"><div class="sie-cc"><button id="sie-rbr">-&gt; Rotate</button></div></div><hr><div class="sie-cc"><input id="sie-cp" type="color"> <span>Select color</span></div><div class="sie-cc"><input id="sie-lw" min="1" max="10" type="range"> <span>Line width: <span id="sie-lwd"></span></span></div><div class="sie-ib sie-bc"><div class="sie-cc"><button data-value="3" class="sie-dc">Eraser</button></div><div class="sie-cc"><button data-value="0" class="sie-dc">Pencil</button></div><div class="sie-cc"><button data-value="1" class="sie-dc">Line</button></div></div><div class="sie-ib sie-bc"><div class="sie-cc"><button data-value="2" class="sie-dc">Arrow</button></div><div class="sie-cc"><button data-value="4" class="sie-dc">Square</button></div><div class="sie-cc"><button data-value="5" class="sie-dc">Circle</button></div></div><hr><div class="sie-cc"><div class="sie-ib sie-bc"><button id="sie-sb">Save</button></div><div class="sie-ib sie-bc"><button id="sie-d">Download</button></div></div></div></div>';
    return generatedHTML;
  }

  var containerElement = document.getElementById(configSettings.containerId);
  containerElement.innerHTML = generateCss() + generateHTML();
  resetMouseInfo();

  var imageUploadElement = document.getElementById("sie-fu");
  imageUploadElement.addEventListener('input', loadImageFromFileInput, false);
  var imagePreview = document.getElementById('sie-hp');
  imagePreview.addEventListener('load', drawImageToCanvas, false);

  canvas = document.getElementById('sie-cnv');
  canvas.width = configSettings.width || 300;
  canvas.height = canvas.width;
  canvasContext = canvas.getContext('2d');

  hiddenDrawingCanvas = document.getElementById('sie-h-cnv');
  hiddenDrawingCanvas.width = configSettings.width || 300;
  hiddenDrawingCanvas.height = hiddenDrawingCanvas.width;
  hiddenDrawingCanvasContext = hiddenDrawingCanvas.getContext('2d');

  imgCanvas = document.getElementById('sie-i-cnv');
  imgCanvas.width = configSettings.width || 300;
  imgCanvas.height = imgCanvas.width;
  imgCanvasContext = imgCanvas.getContext('2d');

  finalCanvas = document.getElementById('sie-f-cnv');
  finalCanvas.width = configSettings.width || 300;
  finalCanvas.height = finalCanvas.width;
  finalCanvasContext = finalCanvas.getContext('2d');

  new clipboardPaste();

  return {
    saveImage: handleImageEditorSave,
    loadImage: loadImageFromUrl,
    rotateRight: function () { rotateEverything(1); },
    rotateLeft: function () { rotateEverything(-1); },
    setColor: setColorForImageEditor,
    setDrawingThickness: function (width) { setDrawingThickness(width, true); },
    setDrawingControl: setCurrentDrawingControl,
    toggleControls: toggleControls
  };
}