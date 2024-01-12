const utils = require("../utils/responseBuilder.js");

module.exports = {
  inapGralAll: async (req, res) => {
    try {
      console.log(req.body.tipo);
      const result = await utils.executeQuery("CALL sp_inapgral_CRUD(?)", [
        req.body.tipo,
      ]);

      if (result.length) {
        const data = result;
        console.log("data[0] " + JSON.stringify(data[0]));
        console.log("data[1] " + JSON.stringify(data[1]));

        if (data[0][0].Respuesta !== 200) {
          throw new Error(data[2][0].Mensaje);
        }

        const responseData = utils.buildResponse(
          data[1],
          true,
          200,
          data[0][0].Mensaje
        );
        res.status(200).json(responseData);
      } else {
        const responseData = utils.buildResponse(
          [],
          true,
          200,
          "¡Sin Información!"
        );
        res.status(409).json(responseData);
      }
    } catch (error) {
      const responseData = utils.buildResponse(null, false, 500, error.message);
      res.status(500).json(responseData);
    }
  },
};
