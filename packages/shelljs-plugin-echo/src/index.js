export default function plugin($, utils) {
	function echo(...messages) {
    console.log(messages.join(' '));
    return new $.ShellString(messages.join(' '), '', 0);
	}

	utils.plugin($, 'echo', echo, {}, { parseOptions: false });
};

