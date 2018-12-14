import { ConsumerStream } from 'omnistreams'
import { FileReadStream } from 'omnistreams-filereader'
//const { FileReadStream } = require('omnistreams-filereader')

class LogStream extends ConsumerStream {
  _write(data) {
    console.log("data")
    console.log(data)
    this._onRequestCallback(data.byteLength)
  }
}

const file = new File([new Uint8Array(1024*1024).fill(1)], "og.txt", {
  type: "text/plain",
});

const stream = new FileReadStream(file)
const bufSize = 1024

//stream.onData((data) => {
//  console.log("data");
//  stream.request(bufSize)
//});
//
//stream.onEnd(() => {
//  console.log("done");
//});
//
//stream.request(bufSize)

const logStream = new LogStream({ bufferSize: 1000 })

logStream.onEnd(() => {
  console.log("done")
})

logStream.onError((err) => {
  throw err
})

stream.pipe(logStream)
