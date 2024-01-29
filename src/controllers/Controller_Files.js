const utils = require("../utils/responseBuilder.js");
const fs = require("fs").promises;
const path = require("path");

const ruta = process.env.APP_ROUTE_FILE;

const createFolderIfNotExists = async (folderPath) => {
  try {
    await fs.access(folderPath);
  } catch (error) {
    await fs.mkdir(folderPath, { recursive: true });
    console.log("Carpeta creada exitosamente:", folderPath);
  }
};

const saveFile = async (req, res) => {
  try {
    const nombreCarpeta = "test";
    const rutaCarpeta = path.join(ruta, nombreCarpeta);

    await createFolderIfNotExists(rutaCarpeta);

    if (!req.file) {
      throw new Error("No se proporcionó ningún archivo en la solicitud.");
    }

    const contenido = req.file.buffer;
    const nombreArchivo = req.body.nombreArchivo;

    if (!nombreArchivo) {
      throw new Error(
        "El nombre del archivo no está especificado en la solicitud."
      );
    }

    const rutaArchivo = path.join(rutaCarpeta, nombreArchivo);

    await fs.writeFile(rutaArchivo, contenido);

    const responseData = utils.buildResponse(
      { rutaArchivo, nombreArchivo },
      true,
      "001",
      "Exito"
    );
    res.status(200).json(responseData);
  } catch (error) {
    const responseData = utils.buildResponse(null, false, 500, error.message);
    res.status(500).json(responseData);
  }
};

module.exports = { saveFile };
