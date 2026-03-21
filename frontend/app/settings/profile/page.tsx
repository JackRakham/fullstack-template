import { ProfileForm } from "@/src/components/common/profile-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Perfil - Trucking App",
  description: "Gestiona tu información personal y foto de perfil",
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Perfil</h1>
          <p className="text-zinc-500 mt-2">
            Personaliza cómo te ven los demás en la plataforma.
          </p>
        </div>
        
        <ProfileForm />
      </div>
    </div>
  );
}
