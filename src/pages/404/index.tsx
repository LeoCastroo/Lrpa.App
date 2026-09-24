import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center pt-13 h-screen">
      <img src={"/assets/404-error.svg"} alt="404 image" className="max-w-[320px]" />
      <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight text-balance">
        Página não encontrada!
      </h1>

      <Button
        className="mt-6"
        onClick={() => {
          navigate("/", { replace: true });
        }}
      >
        Voltar
      </Button>
    </div>
  );
}
