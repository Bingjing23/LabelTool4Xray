import path from "path"
import fs from "fs"
import { app, dialog, ipcMain, net, protocol } from "electron"
import serve from "electron-serve"
import { createWindow } from "./helpers"

const isProd = process.env.NODE_ENV === "production"

if (isProd) {
  serve({ directory: "app" })
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`)
}

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow("main", {
    width: 1500,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  })

  protocol.handle("atom", (request: any) => {
    return net.fetch("file://" + request.url.slice("atom://".length))
  })
  if (isProd) {
    await mainWindow.loadURL("app://./home")
    mainWindow.menuBarVisible = false
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on("window-all-closed", () => {
  app.quit()
})

ipcMain.on("message", async (event, arg) => {
  event.reply("message", `${arg} World!`)
})
const FOLDER_NAME = "images_data"

const isImageFile = (fileName: string) => {
  const lowerCaseFileName = fileName.toLowerCase()
  return [
    ".dcm",
    ".dicom",
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
    ".tif",
    ".tiff",
  ].some(ext => lowerCaseFileName.endsWith(ext))
}

const isDicomFile = (fileName: string) => {
  const lowerCaseFileName = fileName.toLowerCase()
  return [".dcm", ".dicom"].some(ext => lowerCaseFileName.endsWith(ext))
}

ipcMain.on("open-directory-dialog", event => {
  dialog
    .showOpenDialog({
      properties: ["openDirectory"],
    })
    .then(result => {
      if (!result.canceled && result.filePaths.length > 0) {
        const directoryPath = result.filePaths[0]
        fs.readdir(directoryPath, (err, files) => {
          if (err) {
            console.error("Error fetching files:", err)
            event.reply("selected-directory", [])
            return
          }
          const filteredFiles = files
            .filter(file => {
              return (
                isImageFile(path.extname(file)) ||
                isDicomFile(path.extname(file))
              )
            })
            .map(file => path.join(directoryPath, file))
          event.reply("selected-directory", filteredFiles)
        })
      }
    })
    .catch(err => {
      console.error("Error opening dialog:", err)
    })
})

ipcMain.on(
  "save-json",
  (event, values: { data: any[]; fileName: string; path: string }) => {
    const { data, fileName, path: realPath } = values
    const userDataPath = app.getAppPath()
    const folderPath = path.join(userDataPath, FOLDER_NAME)
    const filePath = path.join(
      folderPath,
      path.basename(fileName, path.extname(fileName)) + ".json"
    )

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    console.log("🦄 ~ filePath:", filePath)
    event.reply("saved-json", "success")
  }
)

ipcMain.on("read-json", (event, fileName: string) => {
  const userDataPath = app.getAppPath()
  const folderPath = path.join(userDataPath, FOLDER_NAME)
  const filePath = path.join(
    folderPath,
    path.basename(fileName, path.extname(fileName)) + ".json"
  )
  console.log("🦄 ~ ipcMain.on ~ filePath:", filePath)
  try {
    const data = fs.readFileSync(filePath, "utf8")
    event.reply("readed-json", JSON.parse(data), "success")
  } catch (err) {
    event.reply("readed-json", [], "error")
  }
})
