import { ProducerStream } from 'omnistreams'

// Implementation is based off of this one:
// https://gist.github.com/alediaferia/cfb3a7503039f9278381
export class FileReadStream extends ProducerStream {

  constructor(file, options) {
    super()

    const opts = options ? options : {}

    this._file = file
    this._offset = 0
    this._chunkSize = opts.chunkSize ? opts.chunkSize : 1024*1024
    this._paused = true 
  }

  _demandChanged() {
    if (this._paused) {
      this._readChunk()
    }
  }

  _readChunk() {

    if (this._terminated) {
      return
    }

    if (this._offset < this._file.size) {

      this._paused = false

      const reader = new FileReader()

      reader.onload = (event) => {
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
          console.log("end file stream: " + this.id)
          this._endCallback()
        }
      }

      const slice = this._file.slice(this._offset, this._offset + this._chunkSize)
      reader.readAsArrayBuffer(slice)
      //reader.readAsText(slice)
    }
  }
}
