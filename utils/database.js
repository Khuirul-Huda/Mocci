/* eslint-disable no-unused-vars */
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, child, get } from 'firebase/database'
import { Config } from '../utils/configreader'
import { MocciLogging } from './moccilogger'



let initialized = false
const firebaseConfig = {
    apiKey: Config.FirebaseApiKey,
    authDomain: Config.FirebaseAuthDomain,
    databaseURL: Config.FirebaseDatabaseUrl,
    storageBucket: Config.FirebaseBucket
}
const app = initializeApp(firebaseConfig)
const init_db = getDatabase(app)

const db = getDatabase()
const dbRef = ref(getDatabase)

class FirebaseController {

    
    static isInitialized() {
        return initialized
    }

    static writeDatabase(value, path) {
        set(ref(db, path), value)
    }

    static queryDatabase(path) {
        get(child(dbRef, path)).then((snapshot) => {
            if (snapshot.exists) {
                return snapshot.val()
            } else {
                return
            }
        }).catch((error) => {
            MocciLogging.log(error, MocciLogging.CRITICAL)
        })
    }
    static updateValueDb(path) {
        // TODO 
    }
    
}

module.exports = {
    FirebaseController
}