function simpleImageEditor(settings) {
  var configSettings = settings || {};
  var drawingControlTypes = {
    pencil: 0,
    line: 1
  };
  var canvas,
    canvasContext,
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
    canvasContext.drawImage(hiddenImagePreview, 0, heightOffset, canvas.width, imageScaledHeight);
  }

  function loadImageSetup() {
    var controls = document.getElementById('sie-c');
    controls.classList.remove('sie-h');
    controls.classList.add('sie-ib');
    imageRotationAngle = 0;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
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
    canvasContext.save();
    imageRotationAngle = (imageRotationAngle + 90) % 360;
    var radianRotationAngle = imageRotationAngle * Math.PI / 180;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    var xTranslation = imageRotationAngle === 90 || imageRotationAngle === 180 ? canvas.width : 0;
    var yTranslation = imageRotationAngle === 180 || imageRotationAngle === 270 ? canvas.height : 0;
    canvasContext.translate(xTranslation, yTranslation);
    canvasContext.rotate(radianRotationAngle);
    drawImageToCanvas();
    canvasContext.rotate(-radianRotationAngle);
    canvasContext.translate(-xTranslation, yTranslation);
    canvasContext.restore();
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

  function drawLineOnCanvas() {
    canvasContext.beginPath();
    canvasContext.moveTo(mouseInfo.beginX, mouseInfo.beginY);
    canvasContext.lineTo(mouseInfo.endX, mouseInfo.endY);
    canvasContext.strokeStyle = canvasStrokeStyle;
    canvasContext.lineWidth = canvasStrokeLineWidth;
    canvasContext.stroke();
    canvasContext.closePath();
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
      }
    }
  }

  function handleImageEditorMouseEnd(e) {
    mouseInfo.endX = getCurrentMouseX(e);
    mouseInfo.endY = getCurrentMouseY(e);
    if (isDrawing && currentDrawingControl === drawingControlTypes.line)
      drawLineOnCanvas();
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


    var savedUrlOctet = canvas.toDataURL("image/" + editedImageFileType).replace("image/" + editedImageFileType, "image/octet-stream");
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

  return {
    saveImage: handleImageEditorSave,
    loadImage: loadImageFromUrl
  };
}