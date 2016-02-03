module.exports = {
	model_name:'account',
	load_model_population:'assets coverimages primaryasset coverimage userroles contenttypes tags categories',
	load_multiple_model_population:'assets coverimages primaryasset coverimage userroles',
	docnamelookup : 'username',
	searchfields : ['username','firstname','lastname','email'],
	use_full_data:true
};
