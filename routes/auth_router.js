'use strict';

var AccountModel;

var authRouter = function(resources){
	AccountModel = resources.mongoose.model('Account');
	let passport = resources.app.controller.extension.login.auth.passport;
	let authenticationRoutes = resources.express.Router();
	let authRouter = resources.express.Router();
	let userRouter = resources.express.Router();
	let	userController = require('../../periodicjs.ext.login/controller/user')(resources,AccountModel);// periodic.app.controller.extension.login.auth,
	let authController = resources.app.controller.extension.asyncadmin.authController;

	let accountController = resources.app.controller.native.account;
	let uacController = require('../../periodicjs.ext.user_access_control/controller/uac')(resources, AccountModel, accountController); //periodic.app.controller.extension.user_access_control.uac
	let loginExtSettings = resources.app.controller.extension.login.auth.loginExtSettings;
	let socialPassportController = require('../../periodicjs.ext.login/controller/social_controller')(resources, 
			{
				passport: passport,
				loginExtSettings: resources.app.controller.extension.login.auth.loginExtSettings
			},
		AccountModel);
	let tokenController = require('../../periodicjs.ext.login/controller/token_controller')(resources, 
			{
				passport: passport,
				loginExtSettings: resources.app.controller.extension.login.auth.loginExtSettings
			},
			AccountModel);
	let mfa_controller = resources.app.controller.extension.login_mfa;


	authRouter.use(function(req,res,next){
		res.locals.adminPostRoute = resources.app.controller.extension.asyncadmin.admin.adminExtSettings.adminLoginPath;
		next();
	});
	if (resources.app.controller.extension.login.loginExtSettings.login_csrf) {
		var csrf = require('csurf');
		authRouter.use(csrf());
		userRouter.use(csrf());
		authRouter.use(function (req, res, next) {
			res.locals.token = req.csrfToken();
			next();
		});
		userRouter.use(function (req, res, next) {
			res.locals.token = req.csrfToken();
			next();
		});
	}


	authRouter.get('/login', userController.login);
	authRouter.post('/login', authController.login);
	authRouter.get('/logout', authController.logout);
	//token controller & router
	authRouter.get('/' + loginExtSettings.routes.forgot_password.default, userController.forgot);
	authRouter.post('/' + loginExtSettings.routes.forgot_password.default, tokenController.forgot);
	authRouter.get('/reset/:token', tokenController.get_token, tokenController.reset);
	authRouter.post('/reset/:token', tokenController.get_token, tokenController.token);

	// activate_middleware = [tokenController.get_user_activation_token,authController.ensureAuthenticated];

	// if they have token then render page otherwise
	userRouter.get('/activate/', tokenController.create_user_activation_token, tokenController.update_user_activation_token, authController.get_activation);
	userRouter.post('/activate', authController.activate_user);

	//social controller & router
	authRouter.get('/facebook', socialPassportController.facebook);
	authRouter.get('/facebook/callback', socialPassportController.facebookcallback);
	authRouter.get('/instagram', socialPassportController.instagram);
	authRouter.get('/instagram/callback', socialPassportController.instagramcallback);
	authRouter.get('/twitter', socialPassportController.twitter);
	authRouter.get('/twitter/callback', socialPassportController.twittercallback);

	userRouter.get('/new|/register', userController.newuser);
	userRouter.get('/finishregistration', authController.ensureAuthenticated, userController.finishregistration);

	userRouter.post('/new', tokenController.create_user_activation_token, userController.create);
	userRouter.post('/finishregistration', authController.ensureAuthenticated, userController.updateuserregistration);


	for (var x in resources.settings.extconf.extensions) {
		if (resources.settings.extconf.extensions[x].name === 'periodicjs.ext.login_mfa') {
			authRouter.get('/login-mfa', 
				global.CoreCache.disableCache, 
				mfa_controller.ensureAuthenticated, 
				uacController.loadUserRoles, 
				uacController.check_user_access, 
				accountController.loadAccountsWithCount, 
				accountController.loadAccountsWithDefaultLimit, 
				accountController.loadAccounts, 
				mfa_controller.userEditor);
			authRouter.post('/login-mfa/account/:id/:set_mfa_status', 
				global.CoreCache.disableCache, 
				mfa_controller.ensureAuthenticated, 
				uacController.loadUserRoles, 
				uacController.check_user_access, 
				accountController.loadAccount,
				function(req,res,next){
					req.controllerData = req.controllerData ||{}
					req.controllerData.login_mfa_user_variable = 'account';
					next();
				},
				mfa_controller.set_mfa_status,
				accountController.update);
		}
	}
	authenticationRoutes.use('/', authRouter);
	authenticationRoutes.use('/user', userRouter);
	return authenticationRoutes;
};

module.exports = authRouter;