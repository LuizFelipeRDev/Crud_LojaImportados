"use client";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AcessoRestrito() {
  const router = useRouter();

  return (
<section className="absolute inset-0 z-0 "
      style={{
        backgroundImage: `
          repeating-linear-gradient(45deg, rgba(255, 0, 100, 0.1) 0, rgba(255, 0, 100, 0.1) 1px, transparent 1px, transparent 20px),
        repeating-linear-gradient(-45deg, rgba(255, 0, 100, 0.1) 0, rgba(255, 0, 100, 0.1) 1px, transparent 1px, transparent 20px)
        `,
        backgroundSize: "40px 40px",
      }}>

  <div className="absolute top-1/2 left-1/2 w-[400px] p-10 m-5 -translate-x-1/2 -translate-y-[55%] bg-black/90 shadow-[0_15px_25px_rgba(0,0,0,0.6)] rounded-xl box-border text-center">
      <div className="flex flex-col items-center mb-7">
        <Lock className="w-12 h-12 text-white mb-2" />
        <p className="text-white text-2xl font-bold tracking-wide">Acesso Restrito</p>
      </div>

      <p className="text-gray-300 mb-7">
        Você não tem permissão para acessar esta página.
      </p>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Voltar ao Login
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Fechar
        </button>
      </div>
    </div>
</section>

    
  );
}
