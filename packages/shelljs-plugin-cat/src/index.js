export default function plugin($, utils) {
  function cat(opts, ...files) {
    var cat = utils.readFromPipe(this);
    if (!files && !cat) common.error('No paths given!', 2);
    files.forEach(file => {
      if (!fs.existsSync(file)) common.error(`No such file or directory: ${file}`, 3);
      cat += fs.readFileSync(file, 'utf8');
      return cat;
    });
  }

  utils.plugin($, 'cat', cat);
};

