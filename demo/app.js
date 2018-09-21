var settings = {
    containerId: 'simple-image-editor',
    exportImageFileType: 'png',
    width: 900,
    showSaveButton: true,
    showDownloadButton: true,
    defaultDrawingControl: 'arrow',
    defaultDrawingColor: '#ffff00',
    defaultDrawingThickness: 4
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