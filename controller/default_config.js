'use strict';
module.exports = {
	settings: {
		adminPath: 'p-admin',
		socketIoPort: '8785',
		adminIndexRedirectPath: 'dashboard',
		show_periodic_credit: true,
		send_cron_check_email: true,
		check_dependency_cron: '00 00 06 * * 1-5' //'*/15 * * * * 1-5'//
	},
	adminLoginPath: 'p-auth',
	use_separate_accounts: false,
	login_settings: {
		settings: {
			authLoginPath: '/p-auth/login',
			authLogoutPath: '/',
			authLoggedInHomepage: '/p-admin'
		},
		new_user_validation: {},
		passport: {},
		token: {},
		timeout: {},
		routes: {},
		login_csrf: true,
		login_social_buttons: {},
		complexitySettings: {}
	}
};
/* cron
	Seconds: 0-59
	Minutes: 0-59
	Hours: 0-23
	Day of Month: 1-31
	Months: 0-11
	Day of Week: 0-6
*/
