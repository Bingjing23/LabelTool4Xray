import fs from "fs"
import path from "path"
import dicomParser from "dicom-parser" //DICOM解析
import canvas from "canvas"
import { getVOILUT } from "./getVOILut"

const CONVERT_IMAGE_FOLDER_NAME = "converted_images"

/**
 * 生成刚导入的DICOM文件的IMAGES
 * @param fileList DICOM文件列表
 * @returns
 */
export const createImages = async (
  filePaths: string[],
  directoryPath: string
) => {
  const folderPath = path.join(directoryPath, CONVERT_IMAGE_FOLDER_NAME)
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath)
  }
  const res = []
  try {
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i]
      const fileName = path.basename(filePath)
      //读取文件
      const dicomFileAsBuffer = fs.readFileSync(filePath)
      const dataSet = dicomParser.parseDicom(dicomFileAsBuffer)
      const tags = dicomParser.explicitDataSetToJS(dataSet) //所有TAG

      //生成PNG和JPG图片
      await createImage(fileName, dataSet, tags, dicomFileAsBuffer, folderPath)
      res.push(path.join(folderPath, fileName + ".png"))
    }
    return res
  } catch (e) {
    console.error(e)
    return []
  }
}

/**
 * 生成PNG和JPG图片
 * @param fileName
 * @param dataSet
 * @param tags
 * @param dicomFileAsBuffer
 */
const createImage = async (
  fileName: string,
  dataSet: dicomParser.DataSet,
  tags: any,
  dicomFileAsBuffer: Buffer,
  folderPath: string
) => {
  const pngFileName = fileName + ".png"
  const jpegFileName = fileName + ".jpg"
  const pngFilePath = path.join(folderPath, pngFileName)
  const jpegFilePath = path.join(folderPath, jpegFileName)

  const width = parseInt(tags["x00280011"]) //图片宽度
  const height = parseInt(tags["x00280010"]) //图片高度
  const invert = tags["x00280004"] === "MONOCHROME1" ? true : false //图像是否被反转显示
  const windowCenter = parseInt(tags["x00281050"]) //窗口中心
  const windowWidth = parseInt(tags["x00281051"]) //窗口宽度

  const pixelData = dataSet.elements.x7fe00010
  const pixelDataBuffer = dicomParser.sharedCopy(
    dicomFileAsBuffer,
    pixelData.dataOffset,
    pixelData.length
  )
  //生成PNG
  const cv = canvas.createCanvas(width, height) //创建画布
  createPngAsync(
    cv,
    pngFilePath,
    pixelDataBuffer,
    width,
    height,
    windowWidth,
    windowCenter,
    invert,
    jpegFilePath
  )
}

/**
 * 生成PNG
 * @param cv
 * @param filePath
 * @param pixelDataBuffer
 * @param width
 * @param height
 * @param windowWidth
 * @param windowCenter
 * @param invert
 * @param jpegFilePath
 */
const createPngAsync = (
  cv: canvas.Canvas,
  filePath: string,
  pixelDataBuffer: any,
  width: number,
  height: number,
  windowWidth: number,
  windowCenter: number,
  invert: boolean,
  jpegFilePath?: string
) => {
  let stream: canvas.PNGStream
  const ctx = cv.getContext("2d", { pixelFormat: "A8" }) //灰度图
  const uint16 = new Uint16Array(
    pixelDataBuffer.buffer,
    pixelDataBuffer.byteOffset,
    pixelDataBuffer.byteLength / Uint16Array.BYTES_PER_ELEMENT
  ) //获取uint16的像素数组
  let voiLUT
  const lut = getLut(uint16, windowWidth, windowCenter, invert, voiLUT) //获取灰度数组
  const uint8 = new Uint8ClampedArray(uint16.length) //八位灰度像素数组
  //替换对应像素点为灰度
  for (let i = 0; i < uint16.length; i++) {
    uint8[i] = lut.lutArray[uint16[i]]
  }
  const image = canvas.createImageData(uint8, width, height)
  ctx.putImageData(image, 0, 0)
  stream = cv.createPNGStream({
    compressionLevel: 9,
    filters: cv.PNG_FILTER_NONE,
  })
  //stream.pipe(fs.createWriteStream(filePath));
  fs.writeFileSync(filePath, stream.read())

  //   saveMinImage(filePath)
  //   if (jpegFilePath) {
  //     //生成JPG
  //     createJpegAsync(cv, jpegFilePath)
  //   }
}

// /**
//  * PNG转JPG
//  * @param cv
//  * @param filePath
//  * @returns
//  */
// const createJpegAsync = (cv: canvas.Canvas, filePath: string) => {
//   const  stream
//   const  u = cv.toDataURL()
//   const Image = canvas.Image
//   const img = new Image()
//   img.onload = () => {
//     const  ca = canvas.createCanvas(img.width, img.height)
//     const  ctx = ca.getContext("2d")
//     ctx.drawImage(img, 0, 0)
//     stream = ca.createJPEGStream()
//     //stream.pipe(fs.createWriteStream(filePath));
//     fs.writeFileSync(filePath, stream.read())
//     saveMinImage(filePath)
//   }
//   img.onerror = err => {
//     throw err
//   }
//   img.src = u
// }

// /**
//  * 保存优化的图片
//  * @param filePath
//  */
// const saveMinImage = (filePath: string) => {
//   filePath = filePath.replace(/\\/g, "/")
//   const  newPath = getMinPath(filePath)
//   imagemin([filePath], {
//     destination: newPath,
//     plugins: [
//       imageminJpegtran(),
//       imageminPngquant({
//         speed: 11,
//         quality: [0.1, 0.1], //压缩质量（0,1）
//       }),
//     ],
//   })
//     .then(() => {
//       console.log("压缩成功====", filePath)
//     })
//     .catch(err => {
//       console.log("压缩失败：" + err)
//     })
// }

/**
 * 获取灰度数组
 * @param data
 * @param windowWidth
 * @param windowCenter
 * @param invert
 * @param voiLUT
 * @returns
 */
const getLut = (
  data: Uint16Array,
  windowWidth: number,
  windowCenter: number,
  invert: boolean,
  voiLUT: any
) => {
  let minPixelValue = 0
  let maxPixelValue = 0
  for (let i = 0; i < data.length; i++) {
    if (minPixelValue > data[i]) {
      minPixelValue = data[i]
    }
    if (maxPixelValue < data[i]) {
      maxPixelValue = data[i]
    }
  }
  const offset = Math.min(minPixelValue, 0)
  const lutArray = new Uint8ClampedArray(maxPixelValue - offset + 1)
  const vlutfn = getVOILUT(windowWidth, windowCenter, voiLUT, true)
  if (invert === true) {
    for (
      let storedValue = minPixelValue;
      storedValue <= maxPixelValue;
      storedValue++
    ) {
      lutArray[storedValue + -offset] = 255 - vlutfn(storedValue)
    }
  } else {
    for (
      let storedValue = minPixelValue;
      storedValue <= maxPixelValue;
      storedValue++
    ) {
      lutArray[storedValue + -offset] = vlutfn(storedValue)
    }
  }
  return {
    minPixelValue: minPixelValue,
    maxPixelValue: maxPixelValue,
    lutArray: lutArray,
  }
}
