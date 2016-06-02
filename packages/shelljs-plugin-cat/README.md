# shelljs-plugin-cat
## `cat` for ShellJS

## Installation

See [Using ShellJS Plugins](https://github.com/shelljs/shelljs/wiki/Using-ShellJS-Plugins).

## Usage

### cat(file [, file ...])
### cat(file_array)

Examples:

```javascript
var str = cat('file*.txt');
var str = cat('file1', 'file2');
var str = cat(['file1', 'file2']); // same as above
```

Returns a string containing the given file, or a concatenated string
containing the files if more than one file is given (a new line character is
introduced between each file).

