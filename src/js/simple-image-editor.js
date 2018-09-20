function simpleImageEditor(settings) {
  var configSettings = settings || {};
  var drawingControlTypes = {
    pencil: 0,
    line: 1,
    arrow: 2,
    eraser: 3
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
    var imageProportionScale = hiddenImagePreview.width / canvas.width;
    var imageScaledHeight = hiddenImagePreview.height / imageProportionScale;
    var heightDifference = canvas.height - imageScaledHeight;
    var heightOffset = heightDifference > 0 && (imageRotationAngle === 90 || imageRotationAngle === 180) ? heightDifference : 0;
    imgCanvasContext.drawImage(hiddenImagePreview, 0, 0, canvas.width, imageScaledHeight);
  }

  function loadImageSetup() {
    var controls = document.getElementById('sie-c');
    controls.classList.remove('sie-h');
    controls.classList.add('sie-ib');
    imageRotationAngle = 0;
    imgCanvasContext.clearRect(0, 0, canvas.width, canvas.height);
    initializeImageEditorControlEventListeners();
  }

  function buildFileName(fullName) {
    if (fullName && fullName !== '') {
      var lastSlashIndex = fullName.lastIndexOf('\\');
      if (lastSlashIndex === -1)
        lastSlashIndex = fullName.lastIndexOf('/');

      uneditedImageFileName = lastSlashIndex === -1 ? fullName : fullName.substring(lastSlashIndex + 1);

      var fileExtensionIndexStart = uneditedImageFileName.lastIndexOf('.');
      if (fileExtensionIndexStart != -1)
        uneditedImageFileNameNoExtension = uneditedImageFileName.substring(0, fileExtensionIndexStart);
    }
    else {
      uneditedImageFileName = 'simple-image-editor';
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

  function handleRotateButtonClick(e) {
    imgCanvasContext.save();
    imageRotationAngle = (imageRotationAngle + 90) % 360;
    var radianRotationAngle = imageRotationAngle * Math.PI / 180;
    imgCanvasContext.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
    var xTranslation = imageRotationAngle === 90 || imageRotationAngle === 180 ? canvas.width : 0;
    var yTranslation = imageRotationAngle === 180 || imageRotationAngle === 270 ? canvas.height : 0;
    imgCanvasContext.translate(xTranslation, yTranslation);
    imgCanvasContext.rotate(radianRotationAngle);
    drawImageToCanvas();
    imgCanvasContext.rotate(-radianRotationAngle);
    imgCanvasContext.translate(-xTranslation, yTranslation);
    imgCanvasContext.restore();


    var hiddenRotationRadian = (90 * Math.PI / 180);
    hiddenDrawingCanvasContext.translate(hiddenDrawingCanvas.width, 0);
    hiddenDrawingCanvasContext.rotate(hiddenRotationRadian);
    hiddenDrawingCanvasContext.clearRect(0, 0, hiddenDrawingCanvas.width, hiddenDrawingCanvas.height);
    hiddenDrawingCanvasContext.drawImage(canvas, 0, 0);
    hiddenDrawingCanvasContext.rotate(-hiddenRotationRadian);
    hiddenDrawingCanvasContext.translate(-hiddenDrawingCanvas.width, 0);
    hiddenDrawingCanvasContext.restore();


    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.drawImage(hiddenDrawingCanvas, 0, 0);
    hiddenDrawingCanvasContext.clearRect(0, 0, hiddenDrawingCanvas.width, hiddenDrawingCanvas.height);
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
    isDrawing = false;
    resetMouseInfo();
  }

  function setColorForImageEditor() {
    var colorPickerElement = document.getElementById('sie-cp');
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

  function setLineWidthValueDisplay() {
    var lineWidthDisplayElement = document.getElementById('sie-lwd');
    lineWidthDisplayElement.textContent = canvasStrokeLineWidth;
  }

  function handleLineWidthChange(e) {
    canvasStrokeLineWidth = Number(e.target.value);
    setLineWidthValueDisplay();
  }

  function initializeImageEditorControlEventListeners() {
    var rotateButtonElement = document.getElementById('sie-rb');
    rotateButtonElement.addEventListener('click', handleRotateButtonClick, false);

    var lineWidthElement = document.getElementById('sie-lw');
    lineWidthElement.value = canvasStrokeLineWidth;
    lineWidthElement.addEventListener('change', handleLineWidthChange, false);
    setLineWidthValueDisplay();

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
      imageEditorSaveButton.classList.add('sie-h');

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
    if (configSettings.defaultDrawingControl && configSettings.defaultDrawingControl !== '')
      setCurrentDrawingControl(configSettings.defaultDrawingControl);
    else
      document.getElementById('sie-c').getElementsByClassName('sie-dc')[0].click();
  }

  function generateCss() {
    var generatedCSS = '<style>@@generatedCss</style>';
    return generatedCSS;
  }

  function generateHTML() {
    var generatedHTML = '@@generatedHTML';
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
  canvas.height = configSettings.height || canvas.width;
  canvasContext = canvas.getContext('2d');

  hiddenDrawingCanvas = document.getElementById('sie-h-cnv');
  hiddenDrawingCanvas.width = configSettings.width || 300;
  hiddenDrawingCanvas.height = configSettings.height || hiddenDrawingCanvas.width;
  hiddenDrawingCanvasContext = hiddenDrawingCanvas.getContext('2d');

  imgCanvas = document.getElementById('sie-i-cnv');
  imgCanvas.width = configSettings.width || 300;
  imgCanvas.height = configSettings.height || imgCanvas.width;
  imgCanvasContext = imgCanvas.getContext('2d');

  finalCanvas = document.getElementById('sie-f-cnv');
  finalCanvas.width = configSettings.width || 300;
  finalCanvas.height = configSettings.height || finalCanvas.width;
  finalCanvasContext = finalCanvas.getContext('2d');

  return {
    saveImage: handleImageEditorSave,
    loadImage: loadImageFromUrl
  };
}