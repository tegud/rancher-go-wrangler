const images = require('../agent_images.json');

function findByName(name) {
    const remainingImages = [...images];
    let currentImage;

    while(currentImage = remainingImages.shift()) {
        if(currentImage.name === name) {
            return currentImage;
        }
    }
}

module.exports = {
    listAll: () => images,
    findByName: name => findByName(name)
};
