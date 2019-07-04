const dropboxStream = require('dropbox-stream');
const authToken = process.env.DROPBOX_AUTH_TOKEN;
const baseFolder = '/apps/';
const fetch = require('isomorphic-fetch');
const path = require('path');
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.DROPBOX_AUTH_TOKEN, fetch: fetch });

class DropboxService {
  uploadFiles(mediaItems, name) {
    const saveOperations = mediaItems.map(mediaItem => this.save(mediaItem, name));

    return Promise.all(saveOperations);
  }

  save(mediaItem, name) {
    return new Promise(async (resolve) => {
      const { mediaUrl, extension } = mediaItem;
      const up = dropboxStream.createDropboxUploadStream({
        token: authToken,
        path: baseFolder + path.basename(`${name}.${extension}`),
        chunkSize: 1000 * 1024,
        autorename: true,
        mode: 'add'
      })
        .on('metadata', async metadata => {
          const link = await dbx.sharingCreateSharedLink({ path: metadata.path_display });
          resolve(link.url)
        });

      const response = await fetch(mediaUrl);

      return response.body.pipe(up);
    });
  }
}

module.exports = new DropboxService();