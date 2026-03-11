'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, ImagePlus } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ImageUploaderProps {
    type: 'avatar' | 'banner';
    currentUrl: string | null;
    onSuccess: (newUrl: string) => void;
}

export function ImageUploader({ type, currentUrl, onSuccess }: ImageUploaderProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limite de 5MB
        if (file.size > 5 * 1024 * 1024) {
            setError('Arquivo muito grande! Máximo de 5MB.');
            return;
        }

        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimes.includes(file.type)) {
            setError('Formato inválido. Use JPG, PNG ou WEBP.');
            return;
        }

        setError('');

        // Preview local
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('sq-token');
            const res = await fetch(`${API_URL}/users/me/${type}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Falha no upload');
            }

            const data = await res.json();
            const newUrl = type === 'avatar' ? data.avatarUrl : data.bannerUrl;

            setPreviewUrl(newUrl);
            onSuccess(newUrl);

            // Invalidar queries no global state se necessário ou apenas via onSuccess call
            useAuthStore.getState().loadSession();
        } catch (err: any) {
            setError(err.message);
            setPreviewUrl(currentUrl); // Reverter preview em caso de erro
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Limpar input
            }
        }
    };

    const isAvatar = type === 'avatar';

    return (
        <div className="flex flex-col gap-2">
            {error && <p className="text-xs text-danger">{error}</p>}

            <div className={`relative overflow-hidden group border-2 border-dashed ${error ? 'border-danger/50' : 'border-border-subtle hover:border-accent-primary'} bg-background-elevated transition-colors cursor-pointer flex items-center justify-center ${isAvatar ? 'w-24 h-24 rounded-full mx-auto' : 'w-full h-32 rounded-xl'
                }`} onClick={() => !isUploading && fileInputRef.current?.click()}>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />

                {previewUrl ? (
                    <>
                        <img src={previewUrl} alt={type} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                            {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Upload className="w-6 h-6 text-white" />}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-1 opacity-50 text-text-muted">
                        {isAvatar ? <Camera className="w-6 h-6" /> : <ImagePlus className="w-6 h-6" />}
                        <span className="text-[10px] font-bold">Upload</span>
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-background-base">
                        <div className="h-full bg-accent-primary animate-pulse w-full" />
                    </div>
                )}
            </div>
        </div>
    );
}
