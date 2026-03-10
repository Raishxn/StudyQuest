'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onSuccess: () => void;
}

export function EditProfileModal({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) {
    const [name, setName] = useState(user?.name || '');
    const [username, setUsername] = useState(user?.username || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [unidade, setUnidade] = useState(user?.unidade || '');
    const [semester, setSemester] = useState(user?.semester || 1);
    const [shift, setShift] = useState(user?.shift || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('sq-token');
            const res = await fetch(`${API_URL}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, username, avatarUrl, unidade, semester, shift }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Falha ao atualizar perfil');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-background-surface border border-border-subtle rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-lg font-bold text-text-primary font-[family-name:var(--font-cinzel)] mb-6">
                    Editar Perfil
                </h2>

                {error && (
                    <div className="bg-danger/20 text-danger border border-danger/50 p-2 rounded-lg text-xs text-center mb-4">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Seu nome completo"
                            className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">URL do Avatar</label>
                        <input
                            type="text"
                            value={avatarUrl}
                            onChange={e => setAvatarUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Unidade/Campus</label>
                        <input
                            type="text"
                            value={unidade}
                            onChange={e => setUnidade(e.target.value)}
                            className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Período</label>
                            <input
                                type="number"
                                min={1}
                                max={14}
                                value={semester}
                                onChange={e => setSemester(parseInt(e.target.value) || 1)}
                                className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Turno</label>
                            <select
                                value={shift}
                                onChange={e => setShift(e.target.value)}
                                className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                            >
                                <option value="">Selecione</option>
                                <option value="MORNING">Manhã</option>
                                <option value="AFTERNOON">Tarde</option>
                                <option value="NIGHT">Noite</option>
                                <option value="FULL">Integral</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-6 w-full py-2.5 bg-accent-primary hover:bg-accent-secondary disabled:bg-accent-muted text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Alterações'}
                </button>
            </div>
        </div>
    );
}
