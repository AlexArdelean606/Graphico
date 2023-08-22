import React, {
    FC,
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { signInWithEmailAndPassword } from "firebase/auth"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { signOut } from "firebase/auth"
import { auth, db } from "../firebase"
import { DocumentData, doc, getDoc, setDoc } from "firebase/firestore"
import Banned from "scenes/banned"

const logIn = async (email :string, password :string) => {
  return signInWithEmailAndPassword(auth, email, password)
}

const logOut = async () => {
  return signOut(auth)
}

const signUp = async (email :string, password :string, username :string) => {
  const userCredentials = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  await setDoc(doc(db, "accounts", userCredentials.user.uid), {
    banned: false,
    cinemas: [],
    created_date: new Date(),
    first_name: "",
    last_name: "",
    phone_number: "",
    role: 1
  });

  await setDoc(doc(db, "users", userCredentials.user.uid), {
    username : username,
    status: 0,
    account_id: userCredentials.user.uid
  } );

  await setDoc(doc(db, "profiles", userCredentials.user.uid), {
    bio: "",
    title: "",
    profile_picture: "",
    account_id: userCredentials.user.uid
  } );
}

const userAuthContext = createContext({user:{} as User, userData:{} as DocumentData, accountData:{} as DocumentData, profileData:{} as DocumentData, logIn, signUp, logOut })

export const UserAuthContextProvider: FC<{children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>();

  const [userData, setUserData] = useState<DocumentData>();
  const [accountData, setAccountData] = useState<DocumentData>();
  const [profileData, setProfileData] = useState<DocumentData>();

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser as User);
        if (currentUser) {
            const docUser = await getDoc(doc(db, "users", currentUser.uid));
            setUserData(docUser.data() as DocumentData);

            const docAccount = await getDoc(doc(db, "accounts", currentUser.uid));
            setAccountData(docAccount.data() as DocumentData);

            const docProfile = await getDoc(doc(db, "profiles", currentUser.uid));
            setProfileData(docProfile.data() as DocumentData);
        }
        else {}
    })

    return unsubscribe;
  }, [])

  useEffect(() => {
    if (userData && accountData && profileData) {
        setLoading(false);
    }
    else{
        if (!user) {
            setLoading(false);
        }
    }
  }, [userData, accountData, profileData])

  const value = { user, userData, accountData, profileData, logIn, signUp, logOut };

  if (accountData?.['banned'] === true) return (
    <Banned />
  )

  return (
    // @ts-ignore
    <userAuthContext.Provider value={value}>
      {!loading && children}
    </userAuthContext.Provider>
  )
}

export const useUserAuth = () => {
  return useContext(userAuthContext)
}