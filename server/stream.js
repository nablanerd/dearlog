
const s3 = require("./s3")
const fs = require('fs');

const filename = "2021_11_9_9_58_43_69.webm"

const stream = fs.createWriteStream(filename)

s3.getObject({Bucket: "dearlogbucket", Key: "2021_11_9_9_58_43_69.webm"})
.createReadStream()
.pipe(stream);


