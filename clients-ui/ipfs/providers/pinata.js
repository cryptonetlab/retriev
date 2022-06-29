import FormData from 'form-data'
import rfs from 'recursive-fs'
import fs from 'fs'
import basePathConverter from 'base-path-converter'
import got from 'got'

export const pinDirectoryToPinata = async () => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const src = "../dist";
    var status = 0;
    try {
        const { dirs, files } = await rfs.read(src);
        let data = new FormData();
        for (const file of files) {
            data.append(`file`, fs.createReadStream(file), {
                filepath: basePathConverter(src, file),
            });
        }
        const response = await got(url, {
            method: 'POST',
            headers: {
                "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
                "Authorization": "Bearer " + process.env.PINATA_KEY
            },
            body: data
        })
            .on('uploadProgress', progress => {
                console.log(progress);
            });
        console.log('--')
        console.log("Uploaded at: " + process.env.PINATA_ENDPOINT + JSON.parse(response.body).IpfsHash);
    } catch (error) {
        console.log(error);
    }
};