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
    }

    onChunk(callback) {
      this._onChunk = callback;
    }

    start() {

      const maxOffset = this._file.size - this._chunkSize + 1;

      const readChunk = () => {

        const reader = new FileReader();

        const slice = this._file.slice(this._offset, this._offset + this._chunkSize);

        reader.onload = (event) => {

          const data = event.target.result;
          this._onChunk(data);

          this._offset += this._chunkSize;

          if (this._offset >= this._file.size) {
            return;
          }
          else {
            readChunk();
          }
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
  }

  return {
    FileChunker,
  };
}));
