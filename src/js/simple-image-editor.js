function simpleImageEditor(settings) {
  var configSettings = settings || {};
  var canvas,
    canvasContext,
    canvasStrokeStyle,
    canvasStrokeLineWidth = configSettings.canvasStrokeLineWidth || 6,
    isDrawing = false,
    uneditedImageFileNameNoExtension = 'simple-image',
    showDownloadButton = configSettings.showDownloadButton || true,
    showSaveButton = configSettings.showSaveButton || false,
    imageRotationAngle = 0;

  var mouseInfo;
  var drawingControls = {
    pencil: 0,
    line: 1
  };
  var currentDrawingControl;

  function simpleImageEditorResetMouseInfo() {
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

  function simpleImageEditorImageHandler(e) {
    var hiddenImagePreview = document.getElementById('sie-hp');
    hiddenImagePreview.setAttribute('src', e.target.result);
    imageRotationAngle = 0;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  }

  function simpleImageEditorDrawImageToCanvas() {
    var hiddenImagePreview = document.getElementById('sie-hp');
    var imageProportionScale = hiddenImagePreview.width / canvas.width;
    var imageScaledHeight = hiddenImagePreview.height / imageProportionScale;
    var heightDifference = canvas.height - imageScaledHeight;
    var heightOffset = heightDifference > 0 && (imageRotationAngle === 90 || imageRotationAngle === 180) ? heightDifference : 0;
    canvasContext.drawImage(hiddenImagePreview, 0, heightOffset, canvas.width, imageScaledHeight);
  }

  function simpleImageEditorHandleRotateButtonClick(e) {
    canvasContext.save();
    imageRotationAngle = (imageRotationAngle + 90) % 360;
    var radianRotationAngle = imageRotationAngle * Math.PI / 180;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    var xTranslation = imageRotationAngle === 90 || imageRotationAngle === 180 ? canvas.width : 0;
    var yTranslation = imageRotationAngle === 180 || imageRotationAngle === 270 ? canvas.height : 0;
    canvasContext.translate(xTranslation, yTranslation);
    canvasContext.rotate(radianRotationAngle);
    simpleImageEditorDrawImageToCanvas();
    canvasContext.rotate(-radianRotationAngle);
    canvasContext.translate(-xTranslation, yTranslation);
    canvasContext.restore();
  }

  function simpleImageEditorLoadimage(e) {
    var file = e.target.files[0];
    var fileReader = new FileReader();
    fileReader.onload = simpleImageEditorImageHandler;
    fileReader.readAsDataURL(file);
    var fileExtensionIndexStart = file.name.lastIndexOf('.');
    if (fileExtensionIndexStart != -1)
      uneditedImageFileNameNoExtension = file.name.substring(0, fileExtensionIndexStart);
    var controls = document.getElementById('sie-c');
    controls.classList.remove('sie-h');
    controls.classList.add('sie-ib');
    simpleImageEditorInitializeImageEditorControlEventListeners();
  }

  function simpleImageEditorGetCurrentMouseX(e) {
    return e.clientX - canvas.getBoundingClientRect().left;
  }

  function simpleImageEditorGetCurrentMouseY(e) {
    return e.clientY - canvas.getBoundingClientRect().top;
  }

  function simpleImageEditorSetMouseCoordinates(e) {
    mouseInfo.pX = mouseInfo.X;
    mouseInfo.pY = mouseInfo.Y;
    mouseInfo.X = simpleImageEditorGetCurrentMouseX(e);
    mouseInfo.Y = simpleImageEditorGetCurrentMouseY(e);
  }

  function simpleImageEditorDrawPathOnCanvas() {
    canvasContext.beginPath();
    canvasContext.moveTo(mouseInfo.pX, mouseInfo.pY);
    canvasContext.lineTo(mouseInfo.X, mouseInfo.Y);
    canvasContext.strokeStyle = canvasStrokeStyle;
    canvasContext.lineWidth = canvasStrokeLineWidth;
    canvasContext.stroke();
    canvasContext.closePath();
  }

  function simpleImageEditorDrawLineOnCanvas() {
    canvasContext.beginPath();
    canvasContext.moveTo(mouseInfo.beginX, mouseInfo.beginY);
    canvasContext.lineTo(mouseInfo.endX, mouseInfo.endY);
    canvasContext.strokeStyle = canvasStrokeStyle;
    canvasContext.lineWidth = canvasStrokeLineWidth;
    canvasContext.stroke();
    canvasContext.closePath();
  }

  function simpleImageEditorHandleImageEditorMouseBegin(e) {
    simpleImageEditorResetMouseInfo();
    mouseInfo.beginX = simpleImageEditorGetCurrentMouseX(e);
    mouseInfo.beginY = simpleImageEditorGetCurrentMouseY(e);
    simpleImageEditorSetMouseCoordinates(e);
    isDrawing = true;
  }

  function simpleImageEditorHandleImageEditorMouseMove(e) {
    if (isDrawing) {
      simpleImageEditorSetMouseCoordinates(e);
      if (currentDrawingControl === drawingControls.pencil) {
        simpleImageEditorDrawPathOnCanvas();
      }
    }
  }

  function simpleImageEditorHandleImageEditorMouseEnd(e) {
    mouseInfo.endX = simpleImageEditorGetCurrentMouseX(e);
    mouseInfo.endY = simpleImageEditorGetCurrentMouseY(e);
    if (isDrawing && currentDrawingControl === drawingControls.line)
      simpleImageEditorDrawLineOnCanvas();
    isDrawing = false;
    simpleImageEditorResetMouseInfo();
  }

  function simpleImageEditorSetColorForImageEditor() {
    var colorPickerElement = document.getElementById('sie-cp');
    canvasStrokeStyle = colorPickerElement.value;
  }

  function simpleImageEditorHandleImageEditorSave() {
    var hiddenLink = document.getElementById('sie-hsl');
    var editedImageAppendedName = configSettings.editedImageAppendedName || '-edited';
    var editedImageFileType = configSettings.editedImageFileType || 'png';

    var savedUrlOctet = canvas.toDataURL("image/" + editedImageAppendedName).replace("image/" + editedImageAppendedName, "image/octet-stream");
    hiddenLink.setAttribute('download', uneditedImageFileNameNoExtension + editedImageAppendedName + '.' + editedImageFileType);
    hiddenLink.setAttribute('href', savedUrlOctet);

    return savedUrlOctet;
  }

  function simpleImageEditorHandleImageEditorDownload() {
    simpleImageEditorHandleImageEditorSave();
    var hiddenLink = document.getElementById('sie-hsl');
    hiddenLink.click();
  }

  function simpleImageEditorHandleDrawingControlClick(e) {
    var drawingControls = document.getElementsByClassName('sie-dc');
    for (var key in drawingControls) {
      if (drawingControls.hasOwnProperty(key)) {
        var element = drawingControls[key];
        element.classList.remove('sie-pc');
        element.removeAttribute('disabled');
      }
    }
    currentDrawingControl = Number(e.target.dataset.value);
    e.target.setAttribute('disabled', 'disabled');
    e.target.classList.add('sie-pc');
  }

  function simpleImageEditorSetLineWidthValueDisplay() {
    var lineWidthDisplayElement = document.getElementById('sie-lwd');
    lineWidthDisplayElement.textContent = canvasStrokeLineWidth;
  }

  function simpleImageEditorHandleLineWidthChange(e) {
    canvasStrokeLineWidth = Number(e.target.value);
    simpleImageEditorSetLineWidthValueDisplay();
  }

  function simpleImageEditorInitializeImageEditorControlEventListeners() {
    var rotateButtonElement = document.getElementById('sie-rb');
    rotateButtonElement.addEventListener('click', simpleImageEditorHandleRotateButtonClick, false);

    var lineWidthElement = document.getElementById('sie-lw');
    lineWidthElement.value = canvasStrokeLineWidth;
    lineWidthElement.addEventListener('change', simpleImageEditorHandleLineWidthChange, false);
    simpleImageEditorSetLineWidthValueDisplay();

    var colorPickerElement = document.getElementById('sie-cp');
    colorPickerElement.addEventListener('change', simpleImageEditorSetColorForImageEditor, false);
    colorPickerElement.value = configSettings.canvasStrokeStyle || '#FF0000';
    simpleImageEditorSetColorForImageEditor();

    canvas.addEventListener('mousedown', simpleImageEditorHandleImageEditorMouseBegin, false);
    canvas.addEventListener('mousemove', simpleImageEditorHandleImageEditorMouseMove, false);
    canvas.addEventListener('mouseup', simpleImageEditorHandleImageEditorMouseEnd, false);
    canvas.addEventListener('mouseout', simpleImageEditorHandleImageEditorMouseEnd, false);

    var imageEditorSaveButton = document.getElementById('sie-sb');

    if (showSaveButton)
      imageEditorSaveButton.addEventListener('click', simpleImageEditorHandleImageEditorSave, false);
    else
      imageEditorSaveButton.classList.add('sie-h');

    var iamgeEditorDownloadButton = document.getElementById('sie-d');
    if (showDownloadButton)
      iamgeEditorDownloadButton.addEventListener('click', simpleImageEditorHandleImageEditorDownload, false);
    else
      iamgeEditorDownloadButton.classList.add('sie-h');

    var drawingControls = document.getElementsByClassName('sie-dc');
    for (var key in drawingControls) {
      if (drawingControls.hasOwnProperty(key)) {
        var element = drawingControls[key];
        element.addEventListener('click', simpleImageEditorHandleDrawingControlClick, false);
      }
    }
    document.getElementById('sie-c').getElementsByClassName('sie-dc')[0].click();
  }

  function simpleImageEditorGenerateCss() {
    var generatedCSS = '<style>@@generatedCss</style>';
    return generatedCSS;
  }

  function simpleImageEditorGenerateHTML() {
    var generatedHTML = '@@generatedHTML';
    return generatedHTML;
  }

  var containerElement = document.getElementById(configSettings.containerId);
  containerElement.innerHTML = simpleImageEditorGenerateCss() + simpleImageEditorGenerateHTML();
  simpleImageEditorResetMouseInfo();
  var imageUploadElement = document.getElementById("sie-fu");
  imageUploadElement.addEventListener('input', simpleImageEditorLoadimage, false);
  var imagePreview = document.getElementById('sie-hp');
  imagePreview.addEventListener('load', simpleImageEditorDrawImageToCanvas, false);


  canvas = document.getElementById('sie-cnv');
  canvas.width = configSettings.width || 300;
  canvas.height = configSettings.height || canvas.width;
  canvasContext = canvas.getContext('2d');

  return {
    saveImage: simpleImageEditorHandleImageEditorSave
  };
}