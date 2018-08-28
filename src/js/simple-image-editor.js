function simpleImageEditor(idSelector) {
  var canvas,
    canvasContext,
    canvasStrokeStyle,
    canvasStrokeLineWidth = 6,
    isDrawing = false,
    uneditedImageFileNameNoExtension = 'simple-image',
    imageRotationAngle = 0;

  var mouseInfo;
  var loggingLevels = {
    none: 0,
    valuesOnly: 1,
    everything: 2
  };
  var loggingLevel;

  var drawingControls = {
    pencil: 0,
    line: 1
  };
  var currentDrawingControl;

  function simpleImageEditorResetMouseInfo() {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorResetMouseInfo');
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
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorImageHandler');
    var hiddenImagePreview = document.getElementById('simple-image-editor-hidden-preview');
    hiddenImagePreview.setAttribute('src', e.target.result);
    imageRotationAngle = 0;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    var imageEditorSaveButton = document.getElementById('simple-image-editor-save-button');
    imageEditorSaveButton.removeAttribute('disabled');
  }

  function simpleImageEditorDrawImageToCanvas() {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorDrawImageToCanvas');

    var hiddenImagePreview = document.getElementById('simple-image-editor-hidden-preview');
    var imageProportionScale = hiddenImagePreview.width / canvas.width;
    var imageScaledHeight = hiddenImagePreview.height / imageProportionScale;
    var heightDifference = canvas.height - imageScaledHeight;
    var heightOffset = heightDifference > 0 && (imageRotationAngle === 90 || imageRotationAngle === 180) ? heightDifference : 0;
    if (loggingLevel && loggingLevel >= 1)
      console.log('heightDifference: ' + heightDifference, 'heightOffset: ' + heightOffset, 'imageProportionScale: ' + imageProportionScale, 'imageScaledHeight: ' + imageScaledHeight);

    canvasContext.drawImage(hiddenImagePreview, 0, heightOffset, canvas.width, imageScaledHeight);
  }

  function simpleImageEditorHandleRotateButtonClick(e) {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorHandleDrawingControlClick');

    //save current canvas transformation state.  (ie: origin is at 0,0 and like we intuitively know it with up being top, down being bottom, etc)
    canvasContext.save();
    imageRotationAngle = (imageRotationAngle + 90) % 360;
    var radianRotationAngle = imageRotationAngle * Math.PI / 180;
    if (loggingLevel && loggingLevel >= 1)
      console.log('imageRotationAngle: ' + imageRotationAngle, 'radianRotationAngle: ' + radianRotationAngle);

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    var xTranslation = imageRotationAngle === 90 || imageRotationAngle === 180 ? canvas.width : 0;
    var yTranslation = imageRotationAngle === 180 || imageRotationAngle === 270 ? canvas.height : 0;
    canvasContext.translate(xTranslation, yTranslation);
    canvasContext.rotate(radianRotationAngle);
    simpleImageEditorDrawImageToCanvas();
    canvasContext.rotate(-radianRotationAngle);
    canvasContext.translate(-xTranslation, yTranslation);

    //restore canvas transformation state from save so that future drawings will be the same expected behavior location 
    canvasContext.restore();
  }

  function simpleImageEditorLoadimage(e) {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorLoadimage');
    var file = e.target.files[0];
    var fileReader = new FileReader();
    fileReader.onload = simpleImageEditorImageHandler;
    fileReader.readAsDataURL(file);
    if (loggingLevel && loggingLevel >= 1)
      console.log('fileName: ' + file.name);

    var fileExtensionIndexStart = file.name.lastIndexOf('.');
    if (fileExtensionIndexStart != -1)
      uneditedImageFileNameNoExtension = file.name.substring(0, fileExtensionIndexStart);

    if (loggingLevel && loggingLevel >= 1)
      console.log('uneditedImageFileNameNoExtension: ' + uneditedImageFileNameNoExtension);

    var controls = document.getElementById('simple-image-editor-controls');
    controls.classList.remove('simple-image-editor-hidden');
    controls.classList.add('simple-image-editor-inline-block');
    simpleImageEditorInitializeImageEditorControlEventListeners();
  }

  function simpleImageEditorGetCurrentMouseX(e) {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorGetCurrentMouseX');
    return e.clientX - canvas.offsetLeft;
  }

  function simpleImageEditorGetCurrentMouseY(e) {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorGetCurrentMouseY');
    return e.clientY - canvas.offsetTop;
  }

  function simpleImageEditorSetMouseCoordinates(e) {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorSetMouseCoordinates');
    mouseInfo.pX = mouseInfo.X;
    mouseInfo.pY = mouseInfo.Y;
    mouseInfo.X = simpleImageEditorGetCurrentMouseX(e);
    mouseInfo.Y = simpleImageEditorGetCurrentMouseY(e);
    if (loggingLevel && loggingLevel >= 1)
      console.log('beginX: ' + mouseInfo.beginX, 'beginY: ' + mouseInfo.beginY, 'previousMouseX: ' + mouseInfo.pX, 'previousMouseY: ' + mouseInfo.pY, 'mouseX: ' + mouseInfo.X, 'mouseY: ' + mouseInfo.Y, 'endX: ' + mouseInfo.endX, 'endY: ' + mouseInfo.endY);
  }

  function simpleImageEditorDrawPathOnCanvas() {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorDrawPathOnCanvas');
    canvasContext.beginPath();
    canvasContext.moveTo(mouseInfo.pX, mouseInfo.pY);
    canvasContext.lineTo(mouseInfo.X, mouseInfo.Y);
    canvasContext.strokeStyle = canvasStrokeStyle;
    canvasContext.lineWidth = canvasStrokeLineWidth;
    canvasContext.stroke();
    canvasContext.closePath();
  }

  function simpleImageEditorDrawLineOnCanvas() {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorDrawLineOnCanvas');

    if (loggingLevel && loggingLevel >= 1)
      console.log('beginX: ' + mouseInfo.beginX, 'beginY: ' + mouseInfo.beginY, 'previousMouseX: ' + mouseInfo.pX, 'previousMouseY: ' + mouseInfo.pY, 'mouseX: ' + mouseInfo.X, 'mouseY: ' + mouseInfo.Y, 'endX: ' + mouseInfo.endX, 'endY: ' + mouseInfo.endY);
    canvasContext.beginPath();
    canvasContext.moveTo(mouseInfo.beginX, mouseInfo.beginY);
    canvasContext.lineTo(mouseInfo.endX, mouseInfo.endY);
    canvasContext.strokeStyle = canvasStrokeStyle;
    canvasContext.lineWidth = canvasStrokeLineWidth;
    canvasContext.stroke();
    canvasContext.closePath();
  }

  function simpleImageEditorHandleImageEditorMouseBegin(e) {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorHandleImageEditorMouseBegin');

    simpleImageEditorResetMouseInfo();
    mouseInfo.beginX = simpleImageEditorGetCurrentMouseX(e);
    mouseInfo.beginY = simpleImageEditorGetCurrentMouseY(e);
    simpleImageEditorSetMouseCoordinates(e);

    isDrawing = true;
    if (loggingLevel && loggingLevel >= 1)
      console.log('isDrawing: ' + isDrawing);
  }

  function simpleImageEditorHandleImageEditorMouseMove(e) {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorHandleImageEditorMouseMove');
    if (isDrawing) {
      simpleImageEditorSetMouseCoordinates(e);
      if (currentDrawingControl === drawingControls.pencil) {
        simpleImageEditorDrawPathOnCanvas();
      }
    }
  }

  function simpleImageEditorHandleImageEditorMouseEnd(e) {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorHandleImageEditorMouseEnd');

    mouseInfo.endX = simpleImageEditorGetCurrentMouseX(e);
    mouseInfo.endY = simpleImageEditorGetCurrentMouseY(e);
    if (isDrawing && currentDrawingControl === drawingControls.line)
      simpleImageEditorDrawLineOnCanvas();

    isDrawing = false;
    simpleImageEditorResetMouseInfo();

    if (loggingLevel && loggingLevel >= 1)
      console.log('isDrawing: ' + isDrawing);

  }

  function simpleImageEditorSetColorForImageEditor() {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorSetColorForImageEditor');
    var colorPickerElement = document.getElementById('simple-image-editor-color-picker');
    canvasStrokeStyle = colorPickerElement.value;
    if (loggingLevel && loggingLevel >= 1)
      console.log('canvasStrokeStyle: ' + canvasStrokeStyle);
  }

  function simpleImageEditorHandleImageEditorSave() {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorHandleImageEditorSave');

    var hiddenLink = document.getElementById('simple-image-editor-hidden-save-link');
    hiddenLink.setAttribute('download', uneditedImageFileNameNoExtension + '-edited.png');
    hiddenLink.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
    hiddenLink.click();
  }

  function simpleImageEditorHandleDrawingControlClick(e) {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorHandleDrawingControlClick');
    var drawingControls = document.getElementsByClassName('simple-image-editor-drawing-control');
    for (var key in drawingControls) {
      if (drawingControls.hasOwnProperty(key)) {
        var element = drawingControls[key];
        element.classList.remove('simple-image-editor-pressed-control');
        element.removeAttribute('disabled');
      }
    }
    currentDrawingControl = Number(e.target.dataset.value);
    if (loggingLevel && loggingLevel >= 1)
      console.log('currentDrawingControl: ' + currentDrawingControl);

    e.target.setAttribute('disabled', 'disabled');
    e.target.classList.add('simple-image-editor-pressed-control');
  }

  function simpleImageEditorSetLineWidthValueDisplay() {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorSetLineWidthValueDisplay');
    var lineWidthDisplayElement = document.getElementById('simple-image-editor-line-width-display');
    lineWidthDisplayElement.textContent = canvasStrokeLineWidth;
  }

  function simpleImageEditorHandleLineWidthChange(e) {
    if (loggingLevel && loggingLevel >= 2)
      console.log('entered function: simpleImageEditorHandleDrawingControlClick');

    canvasStrokeLineWidth = Number(e.target.value);
    simpleImageEditorSetLineWidthValueDisplay();

    if (loggingLevel && loggingLevel >= 1)
      console.log('canvasStrokeLineWidth: ' + canvasStrokeLineWidth);
  }

  function simpleImageEditorInitializeImageEditorControlEventListeners() {
    var rotateButtonElement = document.getElementById('simple-image-editor-rotate-button');
    rotateButtonElement.addEventListener('click', simpleImageEditorHandleRotateButtonClick, false);

    var lineWidthElement = document.getElementById('simple-image-editor-line-width');
    lineWidthElement.value = canvasStrokeLineWidth;
    lineWidthElement.addEventListener('change', simpleImageEditorHandleLineWidthChange, false);
    simpleImageEditorSetLineWidthValueDisplay();

    var colorPickerElement = document.getElementById('simple-image-editor-color-picker');
    colorPickerElement.addEventListener('change', simpleImageEditorSetColorForImageEditor, false);
    colorPickerElement.value = '#FF0000';
    simpleImageEditorSetColorForImageEditor();

    canvas.addEventListener('mousedown', simpleImageEditorHandleImageEditorMouseBegin, false);
    canvas.addEventListener('mousemove', simpleImageEditorHandleImageEditorMouseMove, false);
    canvas.addEventListener('mouseup', simpleImageEditorHandleImageEditorMouseEnd, false);
    canvas.addEventListener('mouseout', simpleImageEditorHandleImageEditorMouseEnd, false);

    var imageEditorSaveButton = document.getElementById('simple-image-editor-save-button');
    imageEditorSaveButton.addEventListener('click', simpleImageEditorHandleImageEditorSave, false);

    var drawingControls = document.getElementsByClassName('simple-image-editor-drawing-control');
    for (var key in drawingControls) {
      if (drawingControls.hasOwnProperty(key)) {
        var element = drawingControls[key];
        element.addEventListener('click', simpleImageEditorHandleDrawingControlClick, false);
      }
    }
    document.getElementById('simple-image-editor-controls').getElementsByClassName('simple-image-editor-drawing-control')[0].click();
  }

  function simpleImageEditorGenerateCss() {
    var generatedCSS = '<style>@@generatedCss</style>';
    return generatedCSS;
  }

  function simpleImageEditorGenerateHTML() {
    var generatedHTML = '@@generatedHTML';
    return generatedHTML;
  }

  var containerElement = document.getElementById(idSelector);
  containerElement.innerHTML = simpleImageEditorGenerateCss() + simpleImageEditorGenerateHTML();
  simpleImageEditorResetMouseInfo();
  var imageUploadElement = document.getElementById("simple-image-editor-upload");
  imageUploadElement.addEventListener('change', simpleImageEditorLoadimage, false);
  var imagePreview = document.getElementById('simple-image-editor-hidden-preview');
  imagePreview.addEventListener('load', simpleImageEditorDrawImageToCanvas, false);

  canvas = document.getElementById('simple-image-editor-canvas');
  canvas.width = 300;
  canvas.height = canvas.width;
  canvasContext = canvas.getContext('2d');

  loggingLevel = loggingLevels.none;
}