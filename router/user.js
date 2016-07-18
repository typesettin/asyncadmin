'use strict';

module.exports = function (resources) {
	const documentRouter = resources.express.Router();
	const documentController = resources.app.themeconfig.controller.document;
	const applicationRequests = resources.app.controller.extension.pds_request.applications;
  const pdsController = require('../controller/pds_controller')(resources);


	//Pages
	documentRouter.post('/make_application/:id',
		applicationRequests.findApplications, // => req.controllerData.document
		documentController.make_loan_application,
		pdsController.handleControllerDataResponse);

	return documentRouter;
};
