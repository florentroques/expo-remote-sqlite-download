import { NativeModules } from 'react-native';
import { Asset, SQLite } from 'expo';

Asset.prototype.downloadAsyncTo = async function(path) {
  if (this.downloaded) {
    return;
  }
  if (this.downloading) {
    await new Promise((resolve, reject) =>
      this.downloadCallbacks.push({ resolve, reject })
    );
    return;
  }
  this.downloading = true;

  try {
    let exists, md5, uri;
    ({
      exists,
      md5,
      uri,
    } = await NativeModules.ExponentFileSystem.getInfoAsync(path, {
      // cache: true,
      md5: true,
    }));
    if (!exists
      // || md5 !== this.hash
    ) {
      ({
        md5,
        uri,
      } = await NativeModules.ExponentFileSystem.downloadAsync(
        this.uri,
        path,
        {
          // md5: true,
        }
      ));
      // if (md5 !== this.hash) {
      //   throw new Error(
      //     `Downloaded file for asset '${this.name}.${this.type}' ` +
      //       `failed MD5 integrity check`
      //   );
      // }
    }
    this.localUri = uri;
    this.downloaded = true;
    this.downloadCallbacks.forEach(({ resolve }) => resolve());
  } catch (e) {
    this.downloadCallbacks.forEach(({ reject }) => reject(e));
    throw e;
  } finally {
    this.downloading = false;
    this.downloadCallbacks = [];
  }
}

export { Asset };
