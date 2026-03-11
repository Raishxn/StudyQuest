'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ImageUploader } from './ImageUploader';

import { useQuery } from '@tanstack/react-query';

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
    const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl || '');
    const [unidade, setUnidade] = useState(user?.unidade || '');
    const [semester, setSemester] = useState(user?.semester || 1);
    const [shift, setShift] = useState(user?.shift || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [useExternalAvatar, setUseExternalAvatar] = useState(false);
    const [useExternalBanner, setUseExternalBanner] = useState(false);

    if (!isOpen) return null;

    const [instSearch, setInstSearch] = useState('');
    const [selectedInst, setSelectedInst] = useState<any>(
        user?.institution ? { id: user.institution.id, name: user.institution.name, shortName: user.institution.shortName, campus: user.institution.campus, city: user.institution.city, state: user.institution.state } : null
    );
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(instSearch), 300);
        return () => clearTimeout(handler);
    }, [instSearch]);

    const { data: institutions, isLoading: loadingInst, isError: instError, refetch: refetchInst } = useQuery<any[]>({
        queryKey: ['institutionsEdit', debouncedSearch],
        queryFn: async () => {
            const qsArr = [];
            if (debouncedSearch.length >= 2) qsArr.push(`search=${encodeURIComponent(debouncedSearch)}`);
            const qs = qsArr.length > 0 ? `?${qsArr.join('&')}` : '';
            const res = await fetch(`${API_URL}/institutions${qs}`);
            if (!res.ok) throw new Error('Falha ao carregar instituições');
            return res.json();
        },
        staleTime: 60000,
    });

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
                body: JSON.stringify({ name, username, avatarUrl, bannerUrl, semester, shift, institutionId: selectedInst?.id }),
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

                <h2 className="text-lg font-bold text-text-primary font-display mb-6">
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
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-text-secondary">Avatar</label>
                            <button
                                onClick={() => setUseExternalAvatar(!useExternalAvatar)}
                                className="text-[10px] text-accent-primary hover:underline font-bold"
                            >
                                {useExternalAvatar ? 'Fazer upload local' : 'Usar URL externa'}
                            </button>
                        </div>
                        {useExternalAvatar ? (
                            <input
                                type="text"
                                value={avatarUrl}
                                onChange={e => setAvatarUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                            />
                        ) : (
                            <ImageUploader
                                type="avatar"
                                currentUrl={avatarUrl}
                                onSuccess={(url) => setAvatarUrl(url)}
                            />
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-text-secondary">Banner</label>
                            <button
                                onClick={() => setUseExternalBanner(!useExternalBanner)}
                                className="text-[10px] text-accent-primary hover:underline font-bold"
                            >
                                {useExternalBanner ? 'Fazer upload local' : 'Usar URL externa'}
                            </button>
                        </div>
                        {useExternalBanner ? (
                            <input
                                type="text"
                                value={bannerUrl}
                                onChange={e => setBannerUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                            />
                        ) : (
                            <ImageUploader
                                type="banner"
                                currentUrl={bannerUrl}
                                onSuccess={(url) => setBannerUrl(url)}
                            />
                        )}
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-medium text-text-secondary mb-1">Instituição de Ensino</label>
                        {!selectedInst ? (
                            <div className="relative">
                                {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" /> */}
                                <input
                                    type="text"
                                    placeholder="Buscar ex: USP, FATEC, Federal..."
                                    value={instSearch} onChange={e => setInstSearch(e.target.value)}
                                    className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                />

                                <div className="absolute z-10 w-full mt-1 bg-background-elevated border border-border-subtle rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {loadingInst && <div className="p-3 text-center text-sm text-text-muted"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>}
                                    {instError && <div className="p-3 text-center text-sm text-danger">Erro ao carregar. <button type="button" onClick={() => refetchInst()} className="underline font-bold">Tentar novamente</button></div>}
                                    {!loadingInst && !instError && institutions?.length === 0 && <div className="p-3 text-center text-sm text-text-muted">Nenhuma encontrada.</div>}
                                    {!loadingInst && institutions?.map(inst => (
                                        <button
                                            type="button"
                                            key={inst.id}
                                            onClick={() => setSelectedInst(inst)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-background-surface border-b border-border-subtle last:border-0 truncate"
                                        >
                                            <span className="font-bold text-text-primary mr-2">{inst.shortName || inst.name}</span>
                                            <span className="text-text-muted text-xs">— {inst.campus} ({inst.city}/{inst.state})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-background-base px-3 py-2 rounded-lg border border-border-subtle">
                                <div className="truncate pr-4">
                                    <p className="text-sm font-bold text-text-primary truncate">{selectedInst.name}</p>
                                    <p className="text-xs text-text-muted m-0">{selectedInst.campus} • {selectedInst.city}/{selectedInst.state}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedInst(null); setInstSearch(''); }}
                                    className="text-xs text-accent-primary hover:underline whitespace-nowrap"
                                >
                                    Trocar
                                </button>
                            </div>
                        )}
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
