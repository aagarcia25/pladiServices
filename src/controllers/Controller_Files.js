const utils = require("../utils/responseBuilder.js");
const fs = require("fs").promises;
const path = require("path");
const dayjs = require("dayjs");
const { v4: uuidv4 } = require("uuid");
const ruta = process.env.APP_ROUTE_FILE;
const xlsx = require("xlsx");
const pdf = require("pdf-parse");

const ListadoGlobalFiles = async (folderPath) => {
  try {
    const archivosPDF = [];

    const content = await fs.readdir(folderPath);

    for (const elemento of content) {
      const rutaElemento = path.join(folderPath, elemento);
      const stats = await fs.stat(rutaElemento);

      if (stats.isDirectory()) {
        // Si es una carpeta, llamamos recursivamente a la función para explorar subcarpetas
        const archivosSubcarpeta = await ListadoGlobalFiles(rutaElemento);
        archivosPDF.push(...archivosSubcarpeta);
      } else if (stats.isFile() && elemento.toLowerCase().endsWith(".pdf")) {
        // Si es un archivo PDF, lo agregamos a la lista
        archivosPDF.push(rutaElemento);
      }
    }

    return archivosPDF;
  } catch (error) {
    throw new Error(
      "Error al obtener el listado global de archivos PDF: " + error.message
    );
  }
};

const createFolderIfNotExists = async (folderPath) => {
  try {
    await fs.access(folderPath);
  } catch (error) {
    await fs.mkdir(folderPath, { recursive: true });
  }
};

const createfolder = async (req, res) => {
  try {
    const folder = req.body.P_ROUTE; // Asegúrate de obtener el nombre del folder de la solicitud
    console.log(req.body);
    if (!folder) {
      throw new Error(
        "No se proporcionó ningún nombre de carpeta en la solicitud."
      );
    }

    const folderPath = `${ruta}/${folder}`;
    await createFolderIfNotExists(folderPath);

    const responseData = utils.buildResponse([], true, 200, "Exito");
    res.status(200).json(responseData);
  } catch (error) {
    const responseData = utils.buildResponse(null, false, 500, error.message);
    res.status(500).json(responseData);
  }
};

const saveFile = async (req, res) => {
  try {
    await createFolderIfNotExists(ruta);

    if (!req.file) {
      throw new Error("No se proporcionó ningún archivo en la solicitud.");
    }

    const contenido = req.file.buffer;
    const nombreArchivo = req.body.nombreArchivo;
    const rutacarpeta = req.body.ruta;

    if (!nombreArchivo) {
      throw new Error(
        "El nombre del archivo no está especificado en la solicitud."
      );
    }
    const rutaArchivo = `${ruta}/${rutacarpeta}/${nombreArchivo}`;
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
    if (!req.body.P_ROUTE) {
      throw new Error("No se proporcionó la ruta del archivo");
    }

    if (!req.body.P_NOMBRE) {
      throw new Error("No se proporcionó el nombre del archivo");
    }
    const fileExtension = path.extname(req.body.P_NOMBRE);
    const filePath = `${ruta}/${req.body.P_ROUTE}/${req.body.P_NOMBRE}`;
    const fileContent = await fs.readFile(filePath, { encoding: "base64" });

    const responseData = utils.buildResponse(
      { FILE: fileContent, TIPO: fileExtension },
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

const getFileBusqueda = async (req, res) => {
  try {
    if (!req.body.P_ROUTE) {
      throw new Error("No se proporcionó la ruta del archivo");
    }

    const fileExtension = req.body.P_TIPO;
    const filePath = req.body.P_ROUTE;

    const fileContent = await fs.readFile(filePath, { encoding: "base64" });

    const responseData = utils.buildResponse(
      { FILE: fileContent, TIPO: fileExtension },
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

const migrafile = async (req, res) => {
  try {
    if (!req.body.P_TIPO) {
      throw new Error("No se proporcionó el Tipo");
    }

    if (!req.file) {
      throw new Error("No se proporcionó ningún archivo en la solicitud.");
    }
    const codigo = req.body.P_TIPO;
    const contenido = req.file.buffer;
    const workbook = xlsx.read(contenido, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Convertir el contenido de la hoja de cálculo a un objeto JavaScript

    const jsonData = xlsx.utils.sheet_to_json(sheet, {
      dateNF: "YYYY-MM-DD", // Formato de fecha (puedes ajustar según el formato de tu archivo)
      raw: false, // Establecer en true si quieres que las fechas se mantengan como números
      cellDates: true, // Habilitar para convertir automáticamente las fechas en objetos Date
    });

    jsonData.forEach(async (row, index) => {
      console.log(`Fila ${index + 1}:`, row);
      // Aquí puedes realizar acciones con cada fila del archivo Excel
      if (codigo == 0) {
        const result = await utils.executeQuery(
          "CALL sp_inapgral_CRUD(?,?,?,?,?,?)",
          [
            1,
            null,
            req.body.P_CreadoPor || null,
            row.FECHA_INICIO || null,
            row.FECHA_INICIO || null,
            row.CONVENIO || null,
          ]
        );
      } else if (codigo == 1) {
        try {
          const result = await utils.executeQuery(
            "CALL sp_inapgral_01_CRUD(?,?,?,?,?,?,?,?,?,?)",
            [
              1,
              null,
              req.body.P_ID,
              req.body.P_CreadoPor,
              dayjs(row.FECHA_INICIAL, "MM/DD/YY").format("YYYY-MM-DD"),
              dayjs(row.FECHA_FIN, "MM/DD/YY").format("YYYY-MM-DD"),
              row.NOMBRE,
              row.OBJETIVO,
              row.MONTO,
              dayjs(row.FECHA_FINIQUITO, "MM/DD/YY").format("YYYY-MM-DD"),
            ]
          );
          console.log(result);
        } catch (error) {
          console.log(error.message);
        }
      } else if (codigo == 2) {
        try {
          /* const fechaInsertar = row.FECHA
            ? dayjs(row.FECHA, "MM/DD/YY").format("YYYY-MM-DD")
            : null;

          const result = await utils.executeQuery(
            "INSERT INTO ppi (  ModificadoPor, CreadoPor,  Noficio, Fecha, TipoOficio, Dependencia, Descripcion, Importe) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
              req.body.P_CreadoPor,
              req.body.P_CreadoPor,
              row.OFICIO,
              fechaInsertar,
              row.TIPO ? row.TIPO : null,
              row.DEPENDENCIA ? row.DEPENDENCIA : null,
              row.DESCRIPCION ? row.DESCRIPCION : null,
              row.IMPORTE,
            ]
          );
          console.log("Insert successful:", result);*/
        } catch (error) {
          console.log(error.message);
        }
      } else if (codigo == 3) {
        try {
          const fecha1 = row.ROW8
            ? dayjs(row.ROW8, "MM/DD/YY").format("YYYY-MM-DD")
            : null;
          const fecha2 = row.ROW9
            ? dayjs(row.ROW9, "MM/DD/YY").format("YYYY-MM-DD")
            : null;

          const fecha3 = row.ROW10
            ? dayjs(row.ROW10, "MM/DD/YY").format("YYYY-MM-DD")
            : null;

          const fecha4 = row.ROW11
            ? dayjs(row.ROW11, "MM/DD/YY").format("YYYY-MM-DD")
            : null;

          const fecha5 = row.ROW14
            ? dayjs(row.ROW14, "MM/DD/YY").format("YYYY-MM-DD")
            : null;

          const fecha6 = row.ROW17
            ? dayjs(row.ROW17, "MM/DD/YY").format("YYYY-MM-DD")
            : null;

          const fecha7 = row.ROW18
            ? dayjs(row.ROW18, "MM/DD/YY").format("YYYY-MM-DD")
            : null;

          const query = `
    INSERT INTO auditoria (
        Folio,
        OficioDependencia,
        Secretaria,
        Dependencia,
        TipoGasto,
        Responsable,
        TipoSolicitud,
        FechaOficio,
        FechaRecepcion,
        FechaElaboracion,
        FechaVencimiento,
        Monto,
        Comentarios,
        FechaTurno,
        ObservacionesEstatus,
        NumOficioContestacion,
        FechaTurnada,
        FechaTerminada,
        ObsTerminada,
        AutNoAut
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

          const result = await utils.executeQuery(query, [
            row.ROW1 ? row.ROW1 : null,
            row.ROW2 ? row.ROW2 : null,
            row.ROW3 ? row.ROW3 : null,
            row.ROW4 ? row.ROW4 : null,
            row.ROW5 ? row.ROW5 : null,
            row.ROW6 ? row.ROW6 : null,
            row.ROW7 ? row.ROW7 : null,
            fecha1,
            fecha2,
            fecha3,
            fecha4,
            row.ROW12 ? row.ROW12 : null,
            row.ROW13 ? row.ROW13 : null,
            fecha5,
            row.ROW15 ? row.ROW15 : null,
            row.ROW16 ? row.ROW16 : null,
            fecha6,
            fecha7,
            row.ROW19 ? row.ROW19 : null,
            row.ROW20 ? row.ROW20 : null,
          ]);
          //console.log("Insert successful:", result);
        } catch (error) {
          console.log(error.message);
        }
      }
    });

    const responseData = utils.buildResponse(
      "Migracion Completa",
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

const getListFiles = async (req, res) => {
  try {
    if (!req.body.P_ROUTE) {
      throw new Error("No se proporcionó la ruta del archivo");
    }

    const folder = req.body.P_ROUTE;
    const filePath = path.join(ruta, folder);

    await createFolderIfNotExists(filePath);

    const content = await fs.readdir(filePath);

    const filesAndDirectories = await Promise.all(
      content.map(async (item) => {
        const itemPath = path.join(filePath, item);
        const stat = await fs.stat(itemPath);
        return {
          id: uuidv4(),
          name: item,
          isFile: stat.isFile(),
          isDirectory: stat.isDirectory(),
        };
      })
    );
    filesAndDirectories.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

    const responseData = utils.buildResponse(
      filesAndDirectories,
      true,
      200,
      "Éxito"
    );
    res.status(200).json(responseData);
  } catch (error) {
    const responseData = utils.buildResponse(null, false, 500, error.message);
    res.status(500).json(responseData);
  }
};

const deletedFile = async (req, res) => {
  try {
    if (!req.body.P_ROUTE) {
      throw new Error("No se proporcionó la ruta del archivo");
    }

    if (!req.body.P_NOMBRE) {
      throw new Error("No se proporcionó el nombre del archivo");
    }

    const filePath = `${ruta}/${req.body.P_ROUTE}/${req.body.P_NOMBRE}`;
    await fs.unlink(filePath); // Elimina el archivo

    const responseData = utils.buildResponse([], true, 200, "Exito");
    res.status(200).json(responseData);
  } catch (error) {
    const responseData = utils.buildResponse(null, false, 500, error.message);
    res.status(500).json(responseData);
  }
};

const deletedFolder = async (req, res) => {
  try {
    if (!req.body.P_ROUTE) {
      throw new Error("No se proporcionó la ruta del archivo");
    }

    const filePath = `${ruta}/${req.body.P_ROUTE}`;
    const exists = await fs.stat(filePath);
    if (exists.isDirectory()) {
      await removeFolderRecursive(filePath);
    } else {
      throw new Error("La ruta proporcionada no es un directorio.");
    }

    const responseData = utils.buildResponse([], true, 200, "Exito");
    res.status(200).json(responseData);
  } catch (error) {
    const responseData = utils.buildResponse(null, false, 500, error.message);
    res.status(500).json(responseData);
  }
};

// Función para eliminar directorios de manera recursiva
const removeFolderRecursive = async (dir) => {
  const contents = await fs.readdir(dir);

  for (const content of contents) {
    const contentPath = path.join(dir, content);
    const stat = await fs.lstat(contentPath);

    if (stat.isDirectory()) {
      // Si es un directorio, llamar a la función recursivamente
      await removeFolderRecursive(contentPath);
    } else {
      // Si es un archivo, eliminarlo
      await fs.unlink(contentPath);
    }
  }

  // Después de eliminar el contenido, eliminar el directorio en sí
  await fs.rmdir(dir);
};

const busquedaGeneral = async (req, res) => {
  try {
    if (!req.body.SEARCH) {
      throw new Error("No se proporcionó palabra búsqueda");
    }

    //const content = await fs.readdir(ruta);

    const arrayfiles = await ListadoGlobalFiles(ruta);

    //console.log("Listado de Archivo");
    //console.log(arrayfiles);

    const results = await Promise.all(
      arrayfiles.map(async (archivoPDF) => {
        const dataBuffer = await fs.readFile(archivoPDF);
        const data = await pdf(dataBuffer);
        const pdfText = data.text;

        const searchTermRegex = new RegExp(req.body.SEARCH, "gi");
        const matches = pdfText.match(searchTermRegex);

        if (matches) {
          return {
            id: uuidv4(),
            type: "pdf",
            name: path.basename(archivoPDF),
            path: archivoPDF,
            matches,
          };
        }
        return null; // Si no hay coincidencias, retorna null
      })
    );

    const filteredResults = results.filter((result) => result !== null);

    const responseData = utils.buildResponse(
      filteredResults,
      true,
      200,
      "Éxito"
    );
    res.status(200).json(responseData);
  } catch (error) {
    const responseData = utils.buildResponse(null, false, 500, error.message);
    res.status(500).json(responseData);
  }
};

module.exports = {
  saveFile,
  getFile,
  migrafile,
  createfolder,
  getListFiles,
  deletedFile,
  deletedFolder,
  busquedaGeneral,
  getFileBusqueda,
};
