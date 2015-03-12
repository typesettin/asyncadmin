'use strict';
var navlinks,
	PushMenu = require('stylie.pushmenu'),
	// classie = require('classie'),
	StyliePushMenu,
	mtpms,
	closeMenuElements,
	menuElement,
	menuTriggerElement,
	nav_header;

var navlinkclickhandler = function (e) {
	// console.log('e', e);
	var etarget = e.target,
		etargethref = etarget.getAttribute('data-href'),
		anchorlink,
		anchorlinkTop;

	if (etargethref && etargethref.charAt(0) === '#') {
		anchorlink = document.querySelector('a[name="' + etargethref + '"]');
		if (anchorlink) {
			anchorlinkTop = anchorlink.getBoundingClientRect().top;
			// console.log('anchorlinkTop', anchorlinkTop);
			// console.log('document.querySelector("main.ts-pushmenu-scroller").scrollTop', document.querySelector('main.ts-pushmenu-scroller').scrollTop);
			// console.log('mtpms.scrollY', mtpms.scrollTop);
			mtpms.scrollTop = (anchorlinkTop + mtpms.scrollTop);
			StyliePushMenu._resetMenu();
		}
	}

};

var closeNavMenu = function () {
	StyliePushMenu._resetMenu();
};



window.addEventListener('load', function () {
	navlinks = document.querySelector('#ts-pushmenu-mp-menu');
	menuElement = document.getElementById('ts-pushmenu-mp-menu');
	menuTriggerElement = document.getElementById('trigger');
	closeMenuElements = document.querySelectorAll('.closemenu');
	nav_header = document.querySelector('#nav-header');
	mtpms = document.querySelector('main.ts-pushmenu-scroller');


	for (var x = 0; x < closeMenuElements.length; x++) {
		closeMenuElements[x].addEventListener('click', closeNavMenu, false);
	}
	if (navlinks) {
		navlinks.addEventListener('mousedown', navlinkclickhandler, false);
	}
	StyliePushMenu = new PushMenu({
		el: menuElement,
		trigger: menuTriggerElement,
		type: 'overlap', // 'overlap', // 'cover',
		// position: 'right'
	});
	window.StyliePushMenu = StyliePushMenu;
});
