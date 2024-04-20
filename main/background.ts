import path from "path"
import fs from "fs"
import { app, dialog, ipcMain, net, protocol } from "electron"
import { exec } from "child_process"
import serve from "electron-serve"
import { createWindow } from "./helpers"

const isProd = process.env.NODE_ENV === "production"

if (isProd) {
  serve({ directory: "app" })
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`)
}

;(async () => {
  protocol.registerSchemesAsPrivileged([
    { scheme: "atom", privileges: { secure: true } },
  ])

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

async function startProcess(event: Electron.IpcMainEvent, value: any) {
  if (event) {
    /*
      'parentDir' is used to get this folder -> /Applications/<youApp>.app/Contents/ 
      so that we can run our .sh file which will also launch the Python or Rust script.
      So the script folder will be moved into parentDir/ in prod mode.
      Note: this will only work if the target mahcine have Python or Rust installed.
    */
    let scriptPath
    if (isProd) {
      const parentDir = path.dirname(path.dirname(path.dirname(__dirname)))
      scriptPath = path.join(parentDir, "scripts/runner.sh")
    } else {
      scriptPath = path.join(__dirname, "../scripts/runner.sh")
    }
    // console.log(`DEBUG: scriptPath: ${scriptPath}`)
    const cmd = `sh "${scriptPath}" ${value}`

    exec(cmd, (error, stdout) => {
      if (error) {
        console.error(`ERROR: Error executing post-install script: ${error}`) // will be seen only dev mode, not in prod mode
        event.sender.send("log", error.message) // will be seen in both dev and prod mode (in the frontend)
        return
      }
      event.sender.send("log", "Python script executed successfully")
      event.sender.send("message", stdout)
    })

    // ~/.yourApp.log will be helpfull to log process in production mode
  }
}

ipcMain.on("run-sh", async (event, value) => {
  console.log("DEBUG: starting process") // for dev mode
  event.sender.send("log", "Running...") // for prod mode
  await startProcess(event, value)
})

const CONVERT_IMAGE_FOLDER_NAME = "converted_images"
const IMAGE_FOLDER_NAME = "images_data"
const LABEL_FOLDER_NAME = "labels_data"

// const folderPath = path.join(directoryPath, CONVERT_IMAGE_FOLDER_NAME)
// if (!fs.existsSync(folderPath)) {
//   fs.mkdirSync(folderPath)
// }

const isImageFile = (fileName: string) => {
  const lowerCaseFileName = fileName.toLowerCase()
  return [".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"].some(ext =>
    lowerCaseFileName.endsWith(ext)
  )
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
        fs.readdir(directoryPath, async (err, files) => {
          if (err) {
            console.error("Error fetching files:", err)
            event.reply("selected-directory", [])
            return
          }
          const filteredImageFiles = files
            .filter(file => {
              return isImageFile(path.extname(file))
            })
            .map(file => path.join(directoryPath, file))

          const originalDicomFiles = files
            .filter(file => {
              return isDicomFile(path.extname(file))
            })
            .map(file => path.join(directoryPath, file))

          event.reply("selected-directory", [
            ...filteredImageFiles,
            ...originalDicomFiles,
          ])
        })
      }
    })
    .catch(err => {
      console.error("Error opening dialog:", err)
    })
})

ipcMain.on(
  "save-image-json",
  (event, values: { data: any[]; fileName: string; path: string }) => {
    const { data, fileName, path: realPath } = values
    const userDataPath = isProd ? app.getPath("userData") : app.getAppPath()
    const folderPath = path.join(userDataPath, IMAGE_FOLDER_NAME)
    const filePath = path.join(
      folderPath,
      path.basename(fileName, path.extname(fileName)) + ".json"
    )

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    event.reply("saved-image-json", "success")
  }
)

ipcMain.on(
  "save-label-json",
  (event, values: { data: any[]; fileName: string; path: string }) => {
    const { data, fileName, path: realPath } = values
    const userDataPath = isProd ? app.getPath("userData") : app.getAppPath()
    const folderPath = path.join(userDataPath, LABEL_FOLDER_NAME)
    const filePath = path.join(
      folderPath,
      path.basename(fileName, path.extname(fileName)) + ".json"
    )

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    event.reply("saved-label-json", "success")
  }
)

ipcMain.on(
  "read-json",
  (
    event,
    params: { fileName: string; folderName: "images_data" | "labels_data" }
  ) => {
    const { fileName, folderName } = params
    const userDataPath = isProd ? app.getPath("userData") : app.getAppPath()
    const folderPath = path.join(userDataPath, folderName)
    const filePath = path.join(
      folderPath,
      path.basename(fileName, path.extname(fileName)) + ".json"
    )
    try {
      const data = fs.readFileSync(filePath, "utf8")
      if (folderName === "images_data") {
        event.reply("readed-image-json", JSON.parse(data), "success")
      } else if (folderName === "labels_data") {
        event.reply("readed-label-json", JSON.parse(data), "success")
      }
    } catch (err) {
      if (folderName === "images_data") {
        event.reply("readed-image-json", [], "error")
      } else if (folderName === "labels_data") {
        event.reply("readed-label-json", [], "error")
      }
    }
  }
)
