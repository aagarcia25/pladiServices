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

    const result = await utils.executeQuery("CALL sp_files(?,?,?,?,?,?)", [
      1,
      req.body.P_IDOWNER || null,
      req.body.P_CreadoPor || null,
      nombreArchivo || null,
      rutaArchivo || null,
      null,
    ]);

    if (result.length > 2) {
      const responseData = utils.buildResponse(
        result[0],
        true,
        result[1][0].Respuesta,
        result[1][0].Mensaje
      );

      res.status(200).json(responseData);
    } else {
      const responseData = utils.buildResponse(
        [],
        true,
        result[0][0].Respuesta,
        result[0][0].Mensaje
      );
      res.status(200).json(responseData);
    }
  } catch (error) {
    const responseData = utils.buildResponse(null, false, 500, error.message);
    res.status(500).json(responseData);
  }
};

const getFile = async (req, res) => {
  try {
    console.log(req.body);
    if (!req.body.P_ROUTE) {
      throw new Error("No se proporcionó la ruta del archivo");
    }

    if (!req.body.P_NOMBRE) {
      throw new Error("No se proporcionó el nombre del archivo");
    }

    const filePath = path.join(req.body.P_ROUTE);

    const fileContent = await fs.readFile(filePath, { encoding: "base64" });

    const responseData = utils.buildResponse(
      { FILE: fileContent, TIPO: ".pdf" },
      true,
      200,
      "Exito"
    );
    res.status(200).json(responseData);
  } catch (error) {
    const responseData = utils.buildResponse(null, false, 500, error.message);
    res.status(500).json(responseData);
  }
};

module.exports = { saveFile, getFile };
