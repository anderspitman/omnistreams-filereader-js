(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return (root.fileChunker = factory());
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.fileChunker = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // Implementation is based off of this one:
  // https://gist.github.com/alediaferia/cfb3a7503039f9278381

  class FileChunker {

    constructor(file, options) {
      const opts = options ? options : {};

      this._file = file;
      // default to 1MB chunks
      this._chunkSize = opts.chunkSize ? options.chunkSize : 1024*1024;
      this._binary = opts.binary ? opts.binary : false;
      this._offset = 0;
      this._onEnd = () => {};
    }

    onChunk(callback) {
      this._onChunk = callback;
    }

    onEnd(callback) {
      this._onEnd = callback;
    }

    read() {

      const readChunk = () => {

        const reader = new FileReader();

        const slice = this._file.slice(this._offset, this._offset + this._chunkSize);

        reader.onload = (event) => {

          const data = event.target.result;

          const readyForAnother = () => {
            this._offset += this._chunkSize;

            if (this._offset >= this._file.size) {
              this._onEnd();
              return;
            }
            else {
              if (!this._cancel) {
                readChunk();
              }
              else {
                return;
              }
            }
          }

          this._onChunk(data, readyForAnother);
        };

        if (this._binary) {
          reader.readAsArrayBuffer(slice);
        }
        else {
          reader.readAsText(slice);
        }
      }

      readChunk();
    }

    cancel() {
      this._cancel = true;
    }
  }

  return {
    FileChunker,
  };
}));
