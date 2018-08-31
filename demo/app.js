var settings = {
    containerId: 'simple-image-editor',
    exportImageFileType: 'png',
    width: 300,
    showSaveButton: true,
    showDownloadButton: true,
    defaultDrawingControl: 'line',
    defaultDrawingColor: '#FFFFFF',
    defaultDrawingThickness: 7
};
var imageEditor = simpleImageEditor(settings);

// var loadedImage = document.getElementById('loaded-image');
// loadedImage.addEventListener('load', loadImageIntoPlugin, false);

// function loadImageIntoPlugin() {
//     var img = new Image();
//     img.onload = function () {
//         imageEditor.loadImage(img);
//     };
//     img.src = loadedImage.src;
// }