// 

const sharp = require("sharp");
const path = require("path");

module.exports = {
  cropImage: async (imagePaths) => {
    try {
      for (const imagePath of imagePaths) {
        const filename = path.basename(imagePath); // Extract the filename from the image path
        const outputDirectory = path.join(__dirname, "../public/images/sharpImages"); // Specify the output directory
        
        // Crop the image and specify the output filename
        await sharp(imagePath)
          .extract({ left: 0, width: 200, height: 200, top: 0 })
          .toFile(path.join(outputDirectory, filename)); // Retain the original filename
        
        console.log(`Image ${filename} cropped successfully`);
      }
      console.log('All images cropped successfully');
    } catch (error) {
      console.error(error);
    }
  },
};
