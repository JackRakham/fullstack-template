"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/src/stores/auth.store";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Camera, Loader2, CheckCircle2 } from "lucide-react";
import { storageControllerUploadFile } from "@/src/api/generated/storage/storage/storage";
import { usersControllerUpdateProfile } from "@/src/api/generated/identity/identity/identity";
import Image from "next/image";

export function ProfileForm() {
  const { user, setAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const response = await storageControllerUploadFile({ file });
      const media = response as any; // MediaResponseDto

      // Update profile with new avatar_id
      const updatedUser = await usersControllerUpdateProfile({
        avatar_id: media.id,
      });

      setAuth(updatedUser);
      setStatus("success");
    } catch (error) {
      console.error("Upload failed", error);
      setStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const response = await usersControllerUpdateProfile({ name });
      setAuth(response);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Save failed", error);
      setStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const avatarSrc = user.avatar?.url || user.avatar_url;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-950 rounded-xl border shadow-sm">
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="h-32 w-32 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={user.name}
                width={128}
                height={128}
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            ) : (
              <span className="text-4xl font-bold text-zinc-400">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-md hover:scale-110 transition-transform"
            disabled={isUploading}
          >
            <Camera className="h-5 w-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Haz clic en la cámara para subir una nueva foto de perfil
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre Completo</label>
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
            className="bg-zinc-50 dark:bg-zinc-900"
          />
        </div>

        <div className="space-y-2 text-zinc-400">
          <label className="text-sm font-medium">Correo Electrónico (No editable)</label>
          <Input 
            value={user.email}
            disabled
            className="bg-zinc-100 dark:bg-zinc-800 opacity-60 cursor-not-allowed"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {status === "success" && (
              <span className="flex items-center gap-1 text-sm text-green-600 animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="h-4 w-4" />
                Cambios guardados
              </span>
            )}
            {status === "error" && (
              <span className="text-sm text-red-600 animate-in fade-in">
                Ocurrió un error al guardar
              </span>
            )}
          </div>
          
          <Button type="submit" disabled={isSaving || isUploading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
