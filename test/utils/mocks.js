function Mocks() {
  this._stdout = '';
  this._stderr = '';
  this.oldStdoutWrite = process.stdout.write;
  this.oldStderrWrite = process.stderr.write;
  process.stdout.write = function stdoutWrite(val) {
    this._stdout += val;
    return true;
  }.bind(this);
  process.stderr.write = function stderrWrite(val) {
    this._stderr += val;
    return true;
  }.bind(this);
}

Mocks.prototype.stdout = function stdout() {
  return this._stdout;
};

Mocks.prototype.stderr = function stderr() {
  return this._stderr;
};

Mocks.prototype.restore = function restore() {
  process.stdout.write = this.oldStdoutWrite;
  process.stderr.write = this.oldStderrWrite;
};

module.exports = Mocks;
