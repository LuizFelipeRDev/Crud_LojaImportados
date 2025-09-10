"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

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
    <section className=" h-screen inset-0 z-0 "
      style={{
        backgroundImage: `
          repeating-linear-gradient(45deg, rgba(255, 0, 100, 0.1) 0, rgba(255, 0, 100, 0.1) 1px, transparent 1px, transparent 20px),
        repeating-linear-gradient(-45deg, rgba(255, 0, 100, 0.1) 0, rgba(255, 0, 100, 0.1) 1px, transparent 1px, transparent 20px)
        `,
        backgroundSize: "40px 40px",
      }}>


      <div   className="absolute top-1/2 left-1/2 w-[400px] p-10 m-5 -translate-x-1/2 -translate-y-[55%] bg-black/90 shadow-[0_15px_25px_rgba(0,0,0,0.6)] rounded-xl box-border">
      <div className="flex flex-col items-center mb-7">
        <Truck className="w-12 h-12 text-white mb-2" />
        <p className="text-white text-center text-2xl font-bold tracking-wide">DashImportados</p>
      </div>

      <form onSubmit={handleLogin}>
        <div className="relative mb-7">
          <input
            required
            type="text"
            className="w-full border-b border-white bg-transparent text-white text-base py-2 outline-none peer"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <label className="absolute left-0 top-2 text-white text-base transition-all duration-500 peer-focus:-top-5 peer-focus:text-sm peer-valid:-top-5 peer-valid:text-sm">
            Usuário
          </label>
        </div>

        <div className="relative mb-7">
          <input
            required
            type="password"
            className="w-full border-b border-white bg-transparent text-white text-base py-2 outline-none peer"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="absolute left-0 top-2 text-white text-base transition-all duration-500 peer-focus:-top-5 peer-focus:text-sm peer-valid:-top-5 peer-valid:text-sm">
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
    </section>
    
  );
}
