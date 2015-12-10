'use strict';
module.exports = {
	settings: {
		adminPath: 'p-admin',
		socketIoPort: '8785',
		adminIndexRedirectPath: 'dashboard',
		show_periodic_credit: true,
		send_cron_check_email: true,
		check_dependency_cron: '00 00 06 * * 1-5' //'*/15 * * * * 1-5'//
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
