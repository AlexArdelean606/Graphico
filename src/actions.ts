import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where, deleteDoc, DocumentData, WhereFilterOp } from 'firebase/firestore';
import { StorageReference, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';

export const add = async (collectionName :string, data :object) => {
  return addDoc(collection(db, collectionName), data).then((docRef) => {
    return { ...data, id: docRef.id };
  })
}

export const sortBy = (data :DocumentData[], field :string | number, direction :'asc'|'desc' = 'asc') => {
    return data.sort((a, b) => {
        if (direction === 'asc')
            return a[field] > b[field] ? 1 : -1;

        return a[field] < b[field] ? 1 : -1;
    })
}

export const whereQuery = async (collectionName :string, field :string, value: string | boolean | string[] | number, operator :WhereFilterOp = '==') => {
  return getDocs(
    query(
      collection(db, collectionName),
      where(field, operator, value)
    )
  ).then(querySnapshot => {
    let results :DocumentData[] = [];
    querySnapshot.forEach(doc => {
      let data = doc.data();
      if (data) {
        data = { ...data, id: doc.id };
      }

      results.push(data);
    })
    return results;
  })
}

export const get = async (collectionName :string, documentId :string) => {
  return getDoc(doc(db, collectionName, documentId)).then(docSnap => {
    return docSnap.data()
  })
}


export const set = async (collectionName :string, documentId :string, data :Object) => {
  return setDoc(doc(db, collectionName, documentId), data, {
    merge: true
  }).then(() => {
    return
  })
}

export const remove = async (collectionName :string, documentId :string) => {
  return deleteDoc(doc(db, collectionName, documentId))
}

export const upload = async (file :File, existingRef :string|undefined = undefined) => {
  const imageRef = existingRef || `${file.name.split('.')[0]}-${Date.now()}`
  const storageRef = ref(storage, `cinema_pictures/${imageRef}`)
  return uploadBytes(storageRef, file).then(snapshot => {
    return getDownloadURL(snapshot.ref).then(downloadURL => {
      return {
        url: downloadURL,
        ref: imageRef
      }
    })
  })
}

export const uploadMovie = async (file :File, existingRef :string|undefined = undefined) => {
    const imageRef = existingRef || `${file.name.split('.')[0]}-${Date.now()}`
    const storageRef = ref(storage, `movie_images/${imageRef}`)
    return uploadBytes(storageRef, file).then(snapshot => {
      return getDownloadURL(snapshot.ref).then(downloadURL => {
        return {
          url: downloadURL,
          ref: imageRef
        }
      })
    })
  }

export const getAll = async (collectionName :string) => {

    return getDocs(collection(db, collectionName)).then(querySnapshot => {
        let results :DocumentData[] = [];

        querySnapshot.forEach( doc => {
        let data = doc.data();
        if (data) {
            Object.assign(data, { id: doc.id });
        }
        results.push(data);
        } )

        return results;
    } )
}

export const banAccount = async (id :string) => {
    return setDoc(doc(db, "accounts", id), {
        banned: true
    },
    { merge: true }
    ).then(() => {
        return
    })
}

export const unbanAccount = async (id :string) => {
    return setDoc(doc(db, "accounts", id), {
        banned: false
    },
    { merge: true }
    ).then(() => {
        return
    })
}


export const getFilePath = async (path :string) :Promise<string> => {
    const imageRef :StorageReference = ref(storage, path);

    const url :string = await getDownloadURL(imageRef);

    return url;
}