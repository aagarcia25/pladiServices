const utils = require("../utils/responseBuilder.js");
module.exports = {
  AUDITORIA: async (req, res) => {
    try {
      const result = await utils.executeQuery("CALL sp_auditorias(?,?)", [
        req.body.TIPO,
        req.body.BUSQUEDA || "",
      ]);

      if (result.length > 2) {
        const data = result;
        const responseData = utils.buildResponse(
          data[0],
          true,
          data[1][0].Respuesta,
          data[1][0].Mensaje
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
  },
};
