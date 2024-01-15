const utils = require("../utils/responseBuilder.js");
module.exports = {
  Login: async (req, res) => {
    try {
      console.log(req.body.tipo);
      const result = await utils.executeQuery("CALL sp_login(?,?)", [
        req.body.P_Usuario,
        req.body.P_Password,
      ]);

      if (result.length > 2) {
        const data = result;
        //console.log("data[0] " + JSON.stringify(data[0]));
        //console.log("data[1] " + JSON.stringify(data[1]));
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
