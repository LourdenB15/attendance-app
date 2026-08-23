// apps/web/src/context/AuthContext.js
import { createContext } from "react";

export const AuthContext = createContext(null);
export { useAuth } from "./useAuth";
