import React, { useState, useEffect } from 'react';
import UIPuzzle from '../components/organism/UIPuzzle';

const saveUser = async (username, email, password) => {
    let users = JSON.parse(localStorage.getItem("users")) || {};

    // Verificar si el usuario ya existe
    const userExists = Object.values(users).some(user => user.data.username === username);
    if (userExists) {
        return false; // Usuario ya registrado
    }

    // Crear un ID único para el usuario
    const userId = Date.now().toString(); // Genera un ID basado en timestamp

    // Guardar usuario en localStorage
    users[userId] = {
        data: { username, email, password },
        puzzleProgress: {} // Se inicia vacío
    };

    localStorage.setItem("users", JSON.stringify(users));
    return userId; // Retorna el ID del usuario registrado
};

const validateLogin = async (username, password) => {
    let users = JSON.parse(localStorage.getItem("users")) || {};

    // Buscar usuario por username
    const userEntry = Object.entries(users).find(([id, user]) => user.data.username === username);
    if (!userEntry) return 'no_user'; // No encontrado

    const [userId, userData] = userEntry;
    
    // Validar contraseña
    if (userData.data.password === password) {
        localStorage.setItem("currentUserId", userId); // Guardamos el ID del usuario autenticado
        return 'success';
    } else {
        return 'wrong_password';
    }
};

const loadUserProgress = () => {
    const userId = localStorage.getItem("currentUserId");
    if (!userId) return {};

    const users = JSON.parse(localStorage.getItem("users")) || {};
    return users[userId]?.puzzleProgress || {};
};

const saveUserProgress = (updatedProgress) => {
    const userId = localStorage.getItem("currentUserId");
    if (!userId) return;

    let users = JSON.parse(localStorage.getItem("users")) || {};
    
    if (users[userId]) {
        users[userId].puzzleProgress = updatedProgress;
        localStorage.setItem("users", JSON.stringify(users));
    }
};

const UISwitchAuth = ({ onAuthSuccess }) => {
    const [authMode, setAuthMode] = useState('login');
    const [dataUser, setDataUser] = useState('');
    const [dataEmail, setDataEmail] = useState('');
    const [dataVerifyEmail, setDataVerifyEmail] = useState('');
    const [dataPassword, setDataPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [touched, setTouched] = useState({ user: false, email: false, verifyEmail: false, password: false });

    useEffect(() => {
        const storedAuthMode = localStorage.getItem('authMode');
        if (storedAuthMode) setAuthMode(storedAuthMode);
    }, []);

    // Validaciones
    const isUserValid = dataUser.length >= 6;
    const isEmailValid = dataEmail.length > 0 && dataEmail === dataVerifyEmail;
    const isLongEnough = dataPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(dataPassword);
    const hasNumberOrSpecial = /[0-9!@#$%^&*]/.test(dataPassword);
    const isPasswordValid = isLongEnough && hasUpperCase && hasNumberOrSpecial;

    // Habilitar botón solo si todos los datos son correctos
    const isFormValid = authMode === 'login'
        ? isUserValid && dataPassword
        : isUserValid && isEmailValid && dataPassword && isPasswordValid;

    const toggleAuthMode = () => {
        setAuthMode(authMode === 'login' ? 'register' : 'login');
        setError('');
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (authMode === 'register') {
            if (!isEmailValid) {
                setError('Los correos no coinciden.');
                return;
            }
            if (!isPasswordValid) {
                setError('La contraseña no cumple con los requisitos.');
                return;
            }

            const userSaved = await saveUser(dataUser, dataEmail, dataPassword);
            if (userSaved) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('currentUser', dataUser);
                onAuthSuccess();
            } else {
                setError('El usuario ya existe.');
            }
        } else {
            const loginResult = await validateLogin(dataUser, dataPassword);

            if (loginResult === 'success') {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('currentUser', dataUser);
                onAuthSuccess();
            } else if (loginResult === 'no_user') {
                setShowRegisterModal(true); // Mostrar modal de registro
            } else {
                setError('Usuario o contraseña incorrectos.');
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gray-700">
            <div className="relative w-[11.6rem] h-14 bg-gray-300 rounded-full flex items-center p-1 cursor-pointer shadow-lg" onClick={toggleAuthMode}>
                <div className={`absolute w-20 h-12 bg-violet-600 rounded-full transition-transform duration-300 shadow-md ${authMode === 'login' ? 'translate-x-0' : 'translate-x-24'
                    }`}></div>
                <span className={`absolute left-6 text-sm font-bold transition-all ${authMode === 'login' ? 'text-white' : 'text-gray-700'}`}>
                    Login
                </span>
                <span className={`absolute right-5 text-sm font-bold transition-all ${authMode === 'register' ? 'text-white' : 'text-gray-700'}`}>
                    Unirme
                </span>
            </div>

            <form className="flex flex-col mt-6 justify-around w-full max-w-md h-[35rem] p-6 bg-gray-300 shadow-lg rounded-lg border border-gray-200" onSubmit={handleSubmit}>

                <h1 className="text-center text-[3rem] font-bold mb-1">{authMode === 'login' ? 'Inicia Sesión' : 'Regístrate'}</h1>

                <label className="text-sm font-semibold mb-1">Usuario</label>
                <input
                    type="text"
                    className={`p-2 border rounded-md mb-3 focus:ring-2 outline-none ${!touched.user ? 'border-gray-300' : isUserValid ? 'border-green-500' : 'border-red-500'
                        }`}
                    value={dataUser}
                    onChange={(e) => setDataUser(e.target.value)}
                    onBlur={() => handleBlur('user')}
                    required
                />

                {authMode === 'register' && (
                    <>
                        <label className="text-sm font-semibold mb-1">Correo</label>
                        <input
                            type="email"
                            className={`p-2 border rounded-md mb-3 focus:ring-2 outline-none ${!touched.email ? 'border-gray-300' : isEmailValid ? 'border-green-500' : 'border-red-500'
                                }`}
                            value={dataEmail}
                            onChange={(e) => setDataEmail(e.target.value)}
                            onBlur={() => handleBlur('email')}
                            required
                        />

                        <label className="text-sm font-semibold mb-1">Confirmar Correo</label>
                        <input
                            type="email"
                            className={`p-2 border rounded-md mb-3 focus:ring-2 outline-none ${!touched.verifyEmail ? 'border-gray-300' : isEmailValid ? 'border-green-500' : 'border-red-500'
                                }`}
                            value={dataVerifyEmail}
                            onChange={(e) => setDataVerifyEmail(e.target.value)}
                            onBlur={() => handleBlur('verifyEmail')}
                            required
                        />
                    </>
                )}

                <label className="text-sm font-semibold mb-1">Contraseña</label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className={`p-2 w-full border rounded-md focus:ring-2 outline-none ${!touched.password ? 'border-gray-300' : isPasswordValid ? 'border-green-500' : 'border-red-500'
                            }`}
                        value={dataPassword}
                        onChange={(e) => setDataPassword(e.target.value)}
                        onBlur={() => handleBlur('password')}
                        required
                    />
                    <div
                        className="absolute right-3 top-3 cursor-pointer text-sm text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? 'Ocultar' : 'Mostrar'}
                    </div>
                </div>

                {/* Validación de contraseña con ❌ o ✅ */}
                {authMode === 'register' && (
                    <div className="text-sm text-gray-600 mt-2">
                        <p>{isLongEnough ? '✅' : '❌'} Mínimo 8 caracteres</p>
                        <p>{hasUpperCase ? '✅' : '❌'} Al menos 1 mayúscula</p>
                        <p>{hasNumberOrSpecial ? '✅' : '❌'} Al menos 1 número o carácter especial</p>
                    </div>
                )}

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <button
                    type="submit"
                    className={`mt-4 px-6 py-2 rounded-md transition-all ${isFormValid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        }`}
                    disabled={!isFormValid}
                >
                    {authMode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                </button>
            </form>
            
             {/* Modal de usuario no encontrado */}
             {showRegisterModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-lg font-bold mb-4">Usuario no encontrado</h2>
                        <p>¿Deseas registrarte con este usuario?</p>
                        <div className="mt-4 flex justify-center gap-4">
                            <button onClick={() => { setAuthMode('register'); setShowRegisterModal(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                                Registrarme
                            </button>
                            <button onClick={() => setShowRegisterModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded-md">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default function PageTesting () {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const storedAuthStatus = localStorage.getItem('isAuthenticated');
        if (storedAuthStatus === 'true') setIsAuthenticated(true);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
        setIsAuthenticated(false);
    };

    return (
        <div className={`${!isAuthenticated ? "flex items-center justify-center w-screen h-screen bg-gray-100" : ""}`}>

            {!isAuthenticated ? (
                <UISwitchAuth onAuthSuccess={() => setIsAuthenticated(true)} />
            ) : (
                <div className={`${!isAuthenticated ? "flex flex-col items-center" : ""} relative`}>
                    {/* Botón arriba de UIPuzzleGame */}
                    <button
                        onClick={handleLogout}
                        className="absolute top-10 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all shadow-md z-10"
                    >
                        Cerrar Sesión
                    </button>

                    <UIPuzzle loadUserProgress={loadUserProgress} saveUserProgress={saveUserProgress} />
                </div>
            )}
        </div>
    );
};
