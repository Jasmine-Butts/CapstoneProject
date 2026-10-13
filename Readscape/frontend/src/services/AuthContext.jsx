import {
    createContext,
    useContext,
    useState
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children}) {
    const [user, setUser] = useState(() => {
        const saved = sessionStorage.getItem("user");

        try {
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const login = (userData, token) => {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}