"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EnterpriseLogo, EnterpriseName } from "../helper/helper";
import { LockKeyholeOpen, Smartphone, User } from "lucide-react";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);


  const handleLogin = (e) => {
    e.preventDefault();

    if (user === "admin" && password === "admin") {
      // Marca login no localStorage
      localStorage.setItem("isLoggedIn", "true");
      router.push("/dashboard");
    } else {
      setError("Usuário ou senha incorretos");
    }
  };

  return (
    <section
  className="h-screen w-full flex items-center justify-center p-4 z-0"
  style={{
    backgroundImage: `
      repeating-linear-gradient(45deg, rgba(255, 0, 100, 0.1) 0, rgba(255, 0, 100, 0.1) 1px, transparent 1px, transparent 20px),
      repeating-linear-gradient(-45deg, rgba(255, 0, 100, 0.1) 0, rgba(255, 0, 100, 0.1) 1px, transparent 1px, transparent 20px)
    `,
    backgroundSize: "40px 40px",
  }}
>
  <div className="w-[90%] max-w-[400px] p-8 sm:p-10 bg-black/90 shadow-[0_15px_25px_rgba(0,0,0,0.6)] rounded-xl">

        <div className="flex  items-center justify-center font-semibold mb-7 text-white gap-2 text-3xl">
          <EnterpriseLogo size={40} />
          <h1>{EnterpriseName}</h1>
        </div>

        <form onSubmit={handleLogin}>
          <div className="relative mb-7">
            <input
              required
              type="text"
              id="user"
              className="w-full border-b border-white bg-transparent text-white text-base py-2 outline-none peer"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
            <label
              htmlFor="user" className="absolute left-0 top-2 text-white text-base transition-all duration-500 peer-focus:-top-5 peer-focus:text-sm peer-valid:-top-5 peer-valid:text-sm">
              Usuário
            </label>


          </div>

          <div className="relative mb-7 ">
            <input
              required
              id="senha"
              type="password"
              className="w-full border-b border-white bg-transparent text-white text-base py-2 outline-none peer"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label
              htmlFor="senha"
              className="absolute left-0 top-2 text-white text-base transition-all duration-500 peer-focus:-top-5 peer-focus:text-sm peer-valid:-top-5 peer-valid:text-sm"
            >
              Senha
            </label>
          </div>


          <div className="flex justify-center ">
            <button
              type="submit"
              className="relative cursor-pointer inline-block px-5 py-2 mt-10 text-white font-bold text-base uppercase tracking-widest overflow-hidden transition-colors duration-500 hover:bg-white hover:text-[#272727] rounded"
            >
              <span className="absolute block w-full h-[2px] top-0 left-[-100%] bg-gradient-to-r from-transparent to-white btn-span1"></span>
              <span className="absolute block w-[2px] h-full top-[-100%] right-0 bg-gradient-to-b from-transparent to-white btn-span2"></span>
              <span className="absolute block w-full h-[2px] bottom-0 right-[-100%] bg-gradient-to-l from-transparent to-white btn-span3"></span>
              <span className="absolute block w-[2px] h-full bottom-[-100%] left-0 bg-gradient-to-t from-transparent to-white btn-span4"></span>
              Login
            </button>
          </div>

          {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
        </form>

        <p className="text-gray-400 text-sm mt-5 text-center relative group">
          Não tem conta?{" "}
          <span className="text-white cursor-not-allowed relative">
            Cadastre-se!
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Desativado
              <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></span>
            </span>
          </span>
        </p>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg shadow-lg animate-bounce"
        >
          Leia-me
        </button>
      </div>

      {isOpen && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 w-[90%] max-w-[400px]">
      {/* Botão Fechar */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-3 right-3 text-white hover:text-gray-400"
      >
        ✕
      </button>

      {/* Título */}
      <h2 className="text-xl font-bold text-white mb-4 text-center">
        Sobre o Projeto
      </h2>

      {/* Texto inicial */}
      <p className="text-gray-300 text-sm leading-relaxed text-center mb-4">
        Esse é um Projeto FullStack simples, usando banco de dados barato/grátis,
        permitindo que o usuário acesse seus dados em qualquer lugar.
      </p>

      {/* Informações de Login */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-white">
          <User className="w-5 h-5 text-pink-400" />
          <p>Usuário: <span className="font-semibold">admin</span></p>
        </div>

        <div className="flex items-center gap-2 text-white">
          <LockKeyholeOpen className="w-5 h-5 text-pink-400" />
          <p>Senha: <span className="font-semibold">admin</span></p>
        </div>

        <div className="flex items-center gap-2 text-yellow-400 text-sm">
          <Smartphone className="w-5 h-5 flex-shrink-0" />
          <p className="text-gray-300">
            Apesar de funcionar em smartphones, o projeto <span className="text-red-500 font-semibold">ainda não é totalmente responsivo</span>.
          </p>
        </div>
      </div>
    </div>
  </div>
)}

    </section>

  );
}
