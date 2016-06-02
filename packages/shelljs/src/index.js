export default function plugin($, utils) {
	function shelljs(opts, arg) {
		// Do Something
	}

	utils.plugin($, 'shelljs', shelljs, { 'a': 'arg1' }, {});
};

