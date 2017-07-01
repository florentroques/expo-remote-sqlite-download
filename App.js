import Expo, { SQLite } from 'expo';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Asset } from './enhancedAsset';

export default class App extends React.Component {
  state = {
    appIsReady: false,
    firstRow: '',
  }

  componentWillMount() {
    this.loadDB();
  }

  //creates a dummy SQLite DB to create the SQLite folder
  async makeSQLiteDirAsync() {
    const dbTest = SQLite.openDatabase('dummy.db');

    try {
      await dbTest.transaction(tx => tx.executeSql(''));
    } catch(e) {
        console.log('error while executing SQL in dummy DB');
        console.log(e.message);
    }
  }

  async loadDB() {
    const dbAsset = new Asset({
      'name': 'my_database',
      'type': 'db',
      // 'hash': '70c1c7e28cb655995950a34c7ccd71b8', // calculate md5 hash here
      'uri': 'https://github.com/florentroques/expo-remote-sqlite-download/blob/master/Chinook_Sqlite.sqlite?raw=true', // path to the file somewhere on the internet
    });

    const dbAssetFullName = `${dbAsset.name}.${dbAsset.type}`;

    try {
      await this.makeSQLiteDirAsync();
      await dbAsset.downloadAsyncTo(`SQLite/${dbAssetFullName}`);
      console.log('dbAsset');
      console.log(dbAsset);

      const db = SQLite.openDatabase(dbAssetFullName);
      console.log('db');
      console.log(db);

      await db.transaction(tx => {
        tx.executeSql(
          'select * from Album LIMIT 0, 1',
          [],
          (_, { rows }) => {
            this.setState({ firstRow: JSON.stringify(rows) });
            console.log(JSON.stringify(rows));
          }
        );
      });

      this.setState({ appIsReady: true });

    } catch (e) {
      console.log('error while loading DB');
      console.log(e.message);
    }
  }

  render() {
    if (!this.state.appIsReady) {
      return <Expo.AppLoading />;
    }

    return (
      <View style={styles.container}>
        <Text>first row from SQLite file</Text>
        <Text>{this.state.firstRow}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
