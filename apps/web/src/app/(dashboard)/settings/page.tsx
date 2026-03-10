'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { User, Palette, Bell, Shield, Loader2, Trash2, Download } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type SettingsTab = 'account' | 'appearance' | 'notifications' | 'privacy';

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0 cursor-pointer group">
            <div className="flex-1 mr-4">
                <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{label}</p>
                {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
            </div>
            <div
                onClick={() => onChange(!checked)}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${checked ? 'bg-accent-primary' : 'bg-background-elevated border border-border-subtle'}`}
            >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
            </div>
        </label>
    );
}

export default function SettingsPage() {
    const { user, logout, loadSession } = useAuthStore();
    const [tab, setTab] = useState<SettingsTab>('account');

    // Account State
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [deleteStep, setDeleteStep] = useState(0);
    const [exporting, setExporting] = useState(false);

    // Preferences State
    const [prefs, setPrefs] = useState<Record<string, any>>({});

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            // Load preferences from profile
            const token = localStorage.getItem('sq-token');
            fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json())
                .then(data => {
                    if (data.preferences) setPrefs(data.preferences);
                    if (data.name) setName(data.name);
                })
                .catch(() => { });
        }
    }, [user]);

    const savePrefs = async (newPrefs: Record<string, any>) => {
        setPrefs(newPrefs);
        const token = localStorage.getItem('sq-token');
        await fetch(`${API_URL}/users/me`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ preferences: newPrefs }),
        });
    };

    const togglePref = (key: string, current: boolean) => {
        savePrefs({ ...prefs, [key]: !current });
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage('');
        try {
            const token = localStorage.getItem('sq-token');
            const body: any = {};
            if (username !== user?.username) body.username = username;
            if (name) body.name = name;

            const res = await fetch(`${API_URL}/users/me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.message || 'Erro');
            }
            setMessage('✅ Perfil atualizado!');
            loadSession();
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPw !== confirmPw) { setMessage('❌ As senhas não coincidem'); return; }
        if (newPw.length < 6) { setMessage('❌ Nova senha deve ter pelo menos 6 caracteres'); return; }
        setSaving(true);
        setMessage('');
        try {
            const token = localStorage.getItem('sq-token');
            const res = await fetch(`${API_URL}/users/me/password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.message || 'Erro');
            }
            setMessage('✅ Senha alterada!');
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('sq-token');
            const res = await fetch(`${API_URL}/users/me/data-export`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Erro ao exportar dados');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `studyquest_dados_${user?.username || 'export'}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setMessage('✅ Dados exportados com sucesso!');
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteStep < 2) { setDeleteStep(deleteStep + 1); return; }
        const token = localStorage.getItem('sq-token');
        await fetch(`${API_URL}/users/me`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        logout();
    };

    const tabs: { key: SettingsTab; label: string; icon: any }[] = [
        { key: 'account', label: 'Conta', icon: User },
        { key: 'appearance', label: 'Aparência', icon: Palette },
        { key: 'notifications', label: 'Notificações', icon: Bell },
        { key: 'privacy', label: 'Privacidade', icon: Shield },
    ];

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-cinzel)] mb-6">
                ⚙️ Configurações
            </h1>

            {/* Tab Strip */}
            <div className="flex gap-1 mb-6 bg-background-surface border border-border-subtle rounded-xl p-1">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => { setTab(t.key); setMessage(''); setDeleteStep(0); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.key
                            ? 'bg-accent-primary text-white shadow-md'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        <t.icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t.label}</span>
                    </button>
                ))}
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm text-center border ${message.startsWith('✅') ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'
                    }`}>
                    {message}
                </div>
            )}

            {/* Account Tab */}
            {tab === 'account' && (
                <div className="flex flex-col gap-6">
                    {/* Name & Username */}
                    <section className="bg-background-surface border border-border-subtle rounded-xl p-5">
                        <h3 className="text-sm font-bold text-text-primary mb-3">Informações do Perfil</h3>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Nome</label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Username</label>
                                <input
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving || (username === user?.username && !name)}
                            className="mt-3 px-4 py-2 bg-accent-primary text-white rounded-lg text-xs font-bold disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                        </button>
                    </section>

                    {/* Change Password */}
                    <section className="bg-background-surface border border-border-subtle rounded-xl p-5">
                        <h3 className="text-sm font-bold text-text-primary mb-3">Trocar Senha</h3>
                        <div className="flex flex-col gap-3">
                            <input
                                type="password" placeholder="Senha atual" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                                className="bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                            />
                            <input
                                type="password" placeholder="Nova senha" value={newPw} onChange={e => setNewPw(e.target.value)}
                                className="bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                            />
                            <input
                                type="password" placeholder="Confirmar nova senha" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                                className="bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                            />
                            <button
                                onClick={handleChangePassword}
                                disabled={saving || !currentPw || !newPw}
                                className="self-end px-4 py-2 bg-accent-primary text-white rounded-lg text-xs font-bold disabled:opacity-50"
                            >
                                Alterar Senha
                            </button>
                        </div>
                    </section>

                    {/* Data & Privacy */}
                    <section className="bg-background-surface border border-border-subtle rounded-xl p-5">
                        <h3 className="text-sm font-bold text-text-primary mb-2">Dados e Privacidade</h3>
                        <p className="text-xs text-text-muted mb-3">
                            Exporte todos os seus dados em formato JSON (LGPD). O arquivo conterá seu perfil, sessões de estudo, histórico de XP e publicações.
                        </p>
                        <button
                            onClick={handleExportData}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2 bg-background-elevated border border-border-subtle text-text-secondary rounded-lg text-xs font-bold hover:text-accent-primary hover:border-accent-primary transition-colors"
                        >
                            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            Exportar meus dados
                        </button>
                    </section>

                    {/* Delete Account */}
                    <section className="bg-background-surface border border-danger/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-danger mb-2">Zona de Perigo</h3>
                        <p className="text-xs text-text-muted mb-3">
                            Sua conta será marcada para exclusão com carência de 7 dias. Após esse período, todos os seus dados serão permanentemente removidos.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-danger/20 border border-danger/50 text-danger rounded-lg text-xs font-bold hover:bg-danger/30 transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {deleteStep === 0 && 'Excluir minha conta'}
                            {deleteStep === 1 && 'Tem certeza? Clique novamente'}
                            {deleteStep === 2 && 'CONFIRMAR EXCLUSÃO DEFINITIVA'}
                        </button>
                    </section>
                </div>
            )}

            {/* Appearance Tab */}
            {tab === 'appearance' && (
                <div className="bg-background-surface border border-border-subtle rounded-xl p-5">
                    <h3 className="text-sm font-bold text-text-primary mb-4">Aparência</h3>
                    <div className="flex flex-col">
                        {/* Theme switcher inline */}
                        <div className="py-3 border-b border-border-subtle">
                            <p className="text-sm font-medium text-text-primary mb-2">Tema</p>
                            <div className="flex gap-2 flex-wrap">
                                {[
                                    { key: 'dark-purple', label: '🟣 Roxo Escuro' },
                                    { key: 'dark-blue', label: '🔵 Azul Escuro' },
                                    { key: 'dark-yellow', label: '🟡 Dourado Escuro' },
                                    { key: 'light-purple', label: '🟣 Roxo Claro' },
                                    { key: 'light-blue', label: '🔵 Azul Claro' },
                                    { key: 'light-yellow', label: '🟡 Dourado Claro' },
                                ].map(theme => (
                                    <button
                                        key={theme.key}
                                        onClick={() => {
                                            document.documentElement.setAttribute('data-theme', theme.key);
                                            savePrefs({ ...prefs, theme: theme.key });
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${(prefs.theme || 'dark-purple') === theme.key
                                            ? 'border-accent-primary bg-accent-muted text-accent-primary'
                                            : 'border-border-subtle text-text-muted hover:text-text-primary'
                                            }`}
                                    >
                                        {theme.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Toggle
                            label="Animações"
                            description="Habilitar animações e transições na interface"
                            checked={prefs.animations !== false}
                            onChange={v => togglePref('animations', !v)}
                        />
                        <Toggle
                            label="Sons do Pomodoro"
                            description="Tocar som ao final de cada ciclo"
                            checked={prefs.pomodoroSounds !== false}
                            onChange={v => togglePref('pomodoroSounds', !v)}
                        />
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {tab === 'notifications' && (
                <div className="bg-background-surface border border-border-subtle rounded-xl p-5">
                    <h3 className="text-sm font-bold text-text-primary mb-4">Notificações</h3>
                    <div className="flex flex-col">
                        <Toggle label="Streak em risco" description="Avisar quando o streak vai ser perdido" checked={prefs.notifyStreak !== false} onChange={v => togglePref('notifyStreak', !v)} />
                        <Toggle label="Level-up" description="Notificar ao subir de nível" checked={prefs.notifyLevelUp !== false} onChange={v => togglePref('notifyLevelUp', !v)} />
                        <Toggle label="Conquistas" description="Avisar ao desbloquear conquistas" checked={prefs.notifyAchievements !== false} onChange={v => togglePref('notifyAchievements', !v)} />
                        <Toggle label="Respostas no Fórum" description="Notificar novas respostas aos seus posts" checked={prefs.notifyForumReplies !== false} onChange={v => togglePref('notifyForumReplies', !v)} />
                        <Toggle label="Solicitações de amizade" description="Avisar quando receber pedidos de amizade" checked={prefs.notifyFriendRequests !== false} onChange={v => togglePref('notifyFriendRequests', !v)} />
                        <Toggle label="Mensagens no chat" description="Notificar novas mensagens" checked={prefs.notifyChat !== false} onChange={v => togglePref('notifyChat', !v)} />
                    </div>
                </div>
            )}

            {/* Privacy Tab */}
            {tab === 'privacy' && (
                <div className="bg-background-surface border border-border-subtle rounded-xl p-5">
                    <h3 className="text-sm font-bold text-text-primary mb-4">Privacidade</h3>
                    <div className="flex flex-col">
                        <Toggle label="Perfil público" description="Permitir que outros visualizem seu perfil" checked={prefs.publicProfile !== false} onChange={v => togglePref('publicProfile', !v)} />
                        <Toggle label="Aparecer nos rankings" description="Mostrar sua posição nos rankings globais" checked={prefs.showInRankings !== false} onChange={v => togglePref('showInRankings', !v)} />
                        <Toggle label="Mostrar sessão ativa" description="Amigos podem ver quando você está estudando" checked={prefs.showActiveSession !== false} onChange={v => togglePref('showActiveSession', !v)} />
                    </div>
                </div>
            )}
        </div>
    );
}
