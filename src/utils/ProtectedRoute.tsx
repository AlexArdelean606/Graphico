import { Navigate } from "react-router"
import { useUserAuth } from "../contexts/AuthContext";
import { BANNED, HOME } from "../scenes/types"
import React from "react";

interface ProtectedRouteProps {
    role?: number,
    children: React.ReactNode
}

export const ProtectedRoute = ({role = 0, children } :ProtectedRouteProps) => {

    const { user, accountData } = useUserAuth()

    if (!user || accountData?.["role"] < role) return (
        <Navigate to={HOME}/>
    )

  return <>{children}</>
}
