import fs from "fs"
import path from "path"
import dicomParser from "dicom-parser"
import canvas from "canvas"

function generateLinearVOILUT(windowWidth, windowCenter) {
  return function (modalityLutValue) {
    return ((modalityLutValue - windowCenter) / windowWidth + 0.5) * 255.0
  }
}

/**
 * Generate a non-linear volume of interest lookup table
 *
 * @param {LUT} voiLUT Volume of Interest Lookup Table Object
 * @param {Boolean} roundModalityLUTValues Do a Math.round of modality lut to compute non linear voilut
 *
 * @returns {VOILUTFunction} VOI LUT mapping function
 * @memberof VOILUT
 */
function generateNonLinearVOILUT(voiLUT, roundModalityLUTValues) {
  // We don't trust the voiLUT.numBitsPerEntry, mainly thanks to Agfa!
  const bitsPerEntry = Math.max(...voiLUT.lut).toString(2).length
  const shift = bitsPerEntry - 8
  const minValue = voiLUT.lut[0] >> shift
  const maxValue = voiLUT.lut[voiLUT.lut.length - 1] >> shift
  const maxValueMapped = voiLUT.firstValueMapped + voiLUT.lut.length - 1

  return function (modalityLutValue) {
    if (modalityLutValue < voiLUT.firstValueMapped) {
      return minValue
    } else if (modalityLutValue >= maxValueMapped) {
      return maxValue
    }
    if (roundModalityLUTValues) {
      return (
        voiLUT.lut[Math.round(modalityLutValue) - voiLUT.firstValueMapped] >>
        shift
      )
    }

    return voiLUT.lut[modalityLutValue - voiLUT.firstValueMapped] >> shift
  }
}

/**
 * Retrieve a VOI LUT mapping function given the current windowing settings
 * and the VOI LUT for the image
 *
 * @param {Number} windowWidth Window Width
 * @param {Number} windowCenter Window Center
 * @param {LUT} [voiLUT] Volume of Interest Lookup Table Object
 * @param {Boolean} roundModalityLUTValues Do a Math.round of modality lut to compute non linear voilut
 *
 * @return {VOILUTFunction} VOI LUT mapping function
 * @memberof VOILUT
 */
//export default function (windowWidth, windowCenter, voiLUT, roundModalityLUTValues) {
function getVOILUT(windowWidth, windowCenter, voiLUT, roundModalityLUTValues) {
  if (voiLUT) {
    return generateNonLinearVOILUT(voiLUT, roundModalityLUTValues)
  }

  return generateLinearVOILUT(windowWidth, windowCenter)
}

export const getLut = (
  data: Uint16Array,
  windowWidth: number,
  windowCenter: number,
  invert: boolean,
  voiLUT: any
) => {
  let minPixelValue = 0
  let maxPixelValue = 0
  for (let i = 0, len = data.length; i < len; i++) {
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

/**
 * 生成刚导入的DICOM文件的IMAGES
 * @param fileList DICOM文件列表
 * @returns
 */
export const createImages = async (
  directoryPath: string,
  fileName: string,
  saveFolderPath: string
) => {
  const name = fileName.split(".")[0]
  const filePath = path.join(directoryPath, fileName)
  const dicomFileAsBuffer = fs.readFileSync(filePath)
  const dataSet = dicomParser.parseDicom(dicomFileAsBuffer)
  const tags = dicomParser.explicitDataSetToJS(dataSet) //所有TAG
  //生成PNG图片
  const pngFilePath = path.join(saveFolderPath, name + ".png")
  createImage(dataSet, tags, dicomFileAsBuffer, pngFilePath)
}

export const createImage = (
  dataSet: any,
  tags: any,
  dicomFileAsBuffer: any,
  pngFilePath: string
) => {
  const w = parseInt(tags["x00280011"]) //图片宽度
  const h = parseInt(tags["x00280010"]) //图片高度
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
  const cv = canvas.createCanvas(w, h) //创建画布
  createPngAsync(
    cv,
    pngFilePath,
    pixelDataBuffer,
    w,
    h,
    windowWidth,
    windowCenter,
    invert
  )
}

export const createPngAsync = (
  cv: canvas.Canvas,
  pngFilePath: string,
  pixelDataBuffer: any,
  w: number,
  h: number,
  windowWidth: number,
  windowCenter: number,
  invert: boolean
) => {
  let stream: NodeJS.ReadableStream
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
  const image = canvas.createImageData(uint8, w, h)
  ctx.putImageData(image, 0, 0)
  stream = cv.createPNGStream({
    compressionLevel: 9,
    filters: cv.PNG_FILTER_NONE,
  })
  //stream.pipe(fs.createWriteStream(filePath));
  fs.writeFileSync(pngFilePath, stream.read())
}
