import path from "path"
import fs from "fs"
import { app, dialog, ipcMain, net, protocol, globalShortcut } from "electron"
import { exec } from "child_process"
import serve from "electron-serve"
import { createWindow } from "./helpers"
import { platform } from "process"
import util from "util"

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
    width: 1200,
    height: 900,
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

// app.on("browser-window-focus", function () {
//   globalShortcut.register("CommandOrControl+R", () => {
//     console.log("CommandOrControl+R is pressed: Shortcut Disabled")
//   })
// })

// app.on("browser-window-blur", function () {
//   globalShortcut.unregister("CommandOrControl+R")
// })

async function startProcess(value: any) {
  if (value) {
    /*
      'parentDir' is used to get this folder -> /Applications/<youApp>.app/Contents/ 
      so that we can run our .sh file which will also launch the Python or Rust script.
      So the script folder will be moved into parentDir/ in prod mode.
      Note: this will only work if the target mahcine have Python or Rust installed.
    */
    let scriptPath
    if (isProd) {
      const parentDir = path.dirname(path.dirname(path.dirname(__dirname)))
      scriptPath = path.join(
        parentDir,
        `scripts/runner.${platform === "win32" ? "bat" : "sh"}`
      )
    } else {
      scriptPath = path.join(
        __dirname,
        `../scripts/runner.${platform === "win32" ? "bat" : "sh"}`
      )
    }
    // console.log(`DEBUG: scriptPath: ${scriptPath}`)
    const cmd =
      platform === "win32"
        ? `cmd /c "${scriptPath}" ${value}`
        : `sh "${scriptPath}" ${value}`

    const execAsync = util.promisify(exec)

    try {
      const { stdout } = await execAsync(cmd)
      console.log(stdout) // 输出脚本执行结果
    } catch (error) {
      console.error(`ERROR: Error executing script: ${error}`) // will be seen only dev mode, not in prod mode
      throw error
    }

    // ~/.yourApp.log will be helpfull to log process in production mode
  }
}

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

ipcMain.on("open-directory-dialog", event => {
  dialog
    .showOpenDialog({
      properties: ["openDirectory"],
    })
    .then(async result => {
      console.log("🦄 ~ startProcess ~ platform:", platform)
      if (!result.canceled && result.filePaths.length > 0) {
        const directoryPath = result.filePaths[0]
        await startProcess(directoryPath)
        const outputDirectoryPath = path.join(
          path.dirname(directoryPath),
          `${path.basename(directoryPath)}_output`
        )
        const convertedDirectoryPath = path.join(
          outputDirectoryPath,
          `${path.basename(directoryPath)}_preprocessing`
        )
        fs.readdir(convertedDirectoryPath, (err, files) => {
          if (err) {
            console.error("Error fetching files:", err)
            event.reply("selected-directory", [])
            return
          }

          const filteredImageFiles = files
            .filter(file => {
              return isImageFile(path.extname(file))
            })
            .map(file => path.join(convertedDirectoryPath, file))

          event.reply(
            "selected-directory",
            filteredImageFiles,
            outputDirectoryPath
          )
        })
      }
      event.reply("selected-directory", [])
    })
    .catch(err => {
      event.reply("selected-directory", [])
      console.error("Error opening dialog:", err)
    })
})

ipcMain.on(
  "save-image-json",
  (
    event,
    values: {
      fileDirectory: string
      data: any[]
      fileName: string
      path: string
    }
  ) => {
    const { fileDirectory, data, fileName, path: realPath } = values
    const folderPath = path.join(fileDirectory, IMAGE_FOLDER_NAME)
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
  (
    event,
    values: {
      fileDirectory: string
      data: any[]
      fileName: string
      path: string
    }
  ) => {
    const { fileDirectory, data, fileName, path: realPath } = values
    const folderPath = path.join(fileDirectory, LABEL_FOLDER_NAME)
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
    params: {
      fileDirectory: string
      fileName: string
      folderName: "images_data" | "labels_data"
    }
  ) => {
    const { fileDirectory, fileName, folderName } = params
    const folderPath = path.join(fileDirectory, folderName)
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
