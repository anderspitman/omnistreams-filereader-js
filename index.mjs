import { Producer } from './node_modules/omnistreams/index.mjs'

// Implementation is based off of this one:
// https://gist.github.com/alediaferia/cfb3a7503039f9278381
export class FileReadProducer extends Producer {

  constructor(file, options) {
    super()

    const opts = options ? options : {}

    this._file = file
    this._offset = 0
    this._chunkSize = opts.chunkSize ? opts.chunkSize : 1024*1024
    this._paused = true 
    this._stop = false
  }

  _demandChanged() {
    if (this._paused) {
      this._readChunk()
    }
  }

  _readChunk() {

    if (this._stop) {
      return
    }

    if (this._offset < this._file.size) {

      this._paused = false

      const reader = new FileReader()

      reader.onload = (event) => {
        if (this._stop) {
          return
        }

        const data = new Uint8Array(event.target.result)

        this._dataCallback(data)

        this._demand--
        this._offset += data.byteLength

        if (this._demand > 0) {
          this._readChunk()
        }
        else {
          this._paused = true
        }

        if (this._offset >= this._file.size) {
          //console.log("end file stream: " + this.id)
          this._endCallback()
        }
      }

      const slice = this._file.slice(this._offset, this._offset + this._chunkSize)
      reader.readAsArrayBuffer(slice)
      //reader.readAsText(slice)
    }
  }

  _terminate() {
    this._stop = true
  }
}
