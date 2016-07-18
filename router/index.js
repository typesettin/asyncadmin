'use strict';

// const path = require('path');
const cosigner = require('./cosigner');
const verification = require('./verification');
const documents = require('./document');

module.exports = function (resources) {
	const ilsRouter = resources.express.Router();
	ilsRouter.use('/document',documents(resources));
	ilsRouter.use('/cosigners', cosigner(resources));
	ilsRouter.use('/verification', verification(resources));

	return ilsRouter;
};
