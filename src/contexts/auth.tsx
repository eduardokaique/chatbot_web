import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
    id: string;
    name: string;
    login: string;
    avatar_url: string;
}

type AuthContextData = {
   user: User | null; 
   signInUrl: string;
   signOut: () => void;
}

export const AuthContext = createContext({} as AuthContextData);

type AuthProvider  = {
    children: ReactNode;
}

type AuthResponse = {
    token: string;
    user: {
        id: string;
        avatar_url: string;
        name: string;
        login: string
    }
}

export function AuthProvider(props: AuthProvider){

    const [user, setUser] = useState<User | null>(null)

    const signInUrl = 'https://github.com/login/oauth/authorize?scope=user&client_id=0847d1ae83d144ae07b0'

    async function signIn(githubCode: string) {
        const response = await api.post<AuthResponse>('authenticate', {
            code: githubCode,
        })

        const  {token, user} = response.data;

        localStorage.setItem('@doWhile:token', token);

        api.defaults.headers.common.authorization = `Bearer ${token}`

        setUser(user)

    }

function signOut(){
    setUser(null)
    localStorage.removeItem('@doWhile:token')
}

    useEffect(() =>{
        const token = localStorage.getItem('@doWhile:token')

        if(token) {

            api.defaults.headers.common.authorization = `Bearer ${token}`

            api.get<User>('profile').then(response => {
                setUser(response.data)

        })}
    }, [])

    useEffect(()=> {
        const url = window.location.href;
        const hasGithubCode = url.includes('?code=');

        if(hasGithubCode) {
            const [urlWithoutCode, gihubCode] = url.split('?code=');

            window.history.pushState({}, '', urlWithoutCode);

            signIn(gihubCode)
        }
    }, [])
    
    return (
        <AuthContext.Provider value={{ signInUrl, user, signOut }}>
            {props.children}
        </AuthContext.Provider>
    )
}