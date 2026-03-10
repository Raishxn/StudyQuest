'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Building, GraduationCap } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Institution {
  id: string;
  name: string;
  shortName: string | null;
  state: string;
}

interface Course {
  id: string;
  name: string;
  area: string;
}

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Combobox States
  const [instSearch, setInstSearch] = useState('');
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [unidade, setUnidade] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch Institutions with debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(instSearch), 300);
    return () => clearTimeout(handler);
  }, [instSearch]);

  const { data: institutions, isLoading: loadingInst } = useQuery<Institution[]>({
    queryKey: ['institutions', debouncedSearch],
    queryFn: async () => {
      const qs = debouncedSearch.length >= 2 ? `?search=${encodeURIComponent(debouncedSearch)}` : '';
      const res = await fetch(`${API_URL}/institutions${qs}`);
      if (!res.ok) throw new Error('Falha ao carregar instituições');
      return res.json();
    },
    staleTime: 60000,
  });

  // Fetch Courses when Institution is selected
  const { data: courses, isLoading: loadingCourses } = useQuery<Course[]>({
    queryKey: ['courses', selectedInst?.id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/institutions/${selectedInst?.id}/courses`);
      if (!res.ok) throw new Error('Falha ao carregar cursos');
      return res.json();
    },
    enabled: !!selectedInst?.id,
    staleTime: 60000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInst || !selectedCourse || !unidade) {
      setError('Selecione sua faculdade, curso e digite sua unidade para continuar.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Phase 1: User Account
      const phase1Res = await fetch(`${API_URL}/auth/register/phase1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });

      if (!phase1Res.ok) {
        const errorData = await phase1Res.json();
        throw new Error(errorData.message || 'Falha no cadastro (Fase 1)');
      }

      const { accessToken } = await phase1Res.json();
      localStorage.setItem('sq-token', accessToken);

      // Phase 2: Academic Profile
      const phase2Res = await fetch(`${API_URL}/auth/register/phase2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          institutionId: selectedInst.id,
          courseId: selectedCourse.id,
          unidade: unidade,
          // Defaults for optional fields
          semester: 1,
          shift: 'M',
        })
      });

      if (!phase2Res.ok) {
        // We don't rollback user creation, but we warn them. Or we just proceed.
        console.warn('Falha ao salvar perfil acadêmico na Fase 2.');
      }

      window.location.href = '/dashboard';

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md mx-auto">
      {error && (
        <div className="bg-danger/20 text-danger border border-danger/50 p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          className="w-full bg-background-surface border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Nome de Usuário</label>
        <input
          type="text" required minLength={3} value={username} onChange={e => setUsername(e.target.value)}
          className="w-full bg-background-surface border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Senha</label>
        <input
          type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
          className="w-full bg-background-surface border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-primary"
        />
      </div>

      {/* Institution Selection */}
      <div className="relative border border-border-strong rounded-xl p-4 mt-2 bg-background-surface/50">
        <h4 className="text-sm font-bold text-accent-primary mb-3 flex items-center gap-2">
          <Building className="w-4 h-4" /> Qual é a sua Faculdade?
        </h4>

        {!selectedInst ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar ex: USP, FATEC, Federal..."
              value={instSearch} onChange={e => setInstSearch(e.target.value)}
              className="w-full bg-background-base border border-border-subtle rounded-lg py-2 pl-9 pr-4 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
            />

            {/* Dropdown Options */}
            <div className="absolute z-10 w-full mt-1 bg-background-elevated border border-border-subtle rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {loadingInst && <div className="p-3 text-center text-sm text-text-muted"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>}
              {!loadingInst && institutions?.length === 0 && <div className="p-3 text-center text-sm text-text-muted">Nenhuma faculdade encontrada.</div>}
              {!loadingInst && institutions?.map(inst => (
                <button
                  type="button"
                  key={inst.id}
                  onClick={() => setSelectedInst(inst)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-background-surface border-b border-border-subtle last:border-0 truncate"
                >
                  <span className="font-bold text-text-primary mr-2">{inst.shortName || inst.name}</span>
                  <span className="text-text-muted text-xs">{inst.name} ({inst.state})</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-background-base p-3 rounded-lg border border-border-subtle">
            <div className="truncate pr-4">
              <p className="text-sm font-bold text-text-primary truncate">{selectedInst.name}</p>
              <p className="text-xs text-text-muted">{selectedInst.state} • {selectedInst.shortName}</p>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedInst(null); setSelectedCourse(null); setInstSearch(''); }}
              className="text-xs text-accent-primary hover:underline whitespace-nowrap"
            >
              Trocar
            </button>
          </div>
        )}
      </div>

      {/* Course Selection */}
      <AnimatePresenceWrapper>
        {selectedInst && (
          <div className="relative border border-border-strong rounded-xl p-4 bg-background-surface/50">
            <h4 className="text-sm font-bold text-accent-primary mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Qual é o seu Curso?
            </h4>

            {loadingCourses ? (
              <div className="flex items-center gap-2 text-sm text-text-muted p-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando cursos...</div>
            ) : (
              <select
                required
                value={selectedCourse?.id || ''}
                onChange={e => {
                  const course = courses?.find(c => c.id === e.target.value);
                  setSelectedCourse(course || null);
                }}
                className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
              >
                <option value="" disabled>Selecione um curso...</option>
                {courses?.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </AnimatePresenceWrapper>

      {/* Unidade Selection */}
      <AnimatePresenceWrapper>
        {selectedCourse && (
          <div className="relative border border-border-strong rounded-xl p-4 bg-background-surface/50 mt-2">
            <h4 className="text-sm font-bold text-accent-primary mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" /> Qual é a sua Unidade/Campus?
            </h4>
            <input
              type="text"
              required
              placeholder="Ex: Campus I, EAD, Centro..."
              value={unidade}
              onChange={e => setUnidade(e.target.value)}
              className="w-full bg-background-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        )}
      </AnimatePresenceWrapper>

      <button
        type="submit"
        disabled={isSubmitting || !selectedInst || !selectedCourse || !unidade}
        className="mt-4 w-full py-3 bg-accent-primary hover:bg-accent-secondary disabled:bg-accent-muted disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar minha conta RPG'}
      </button>
    </form>
  );
}

function AnimatePresenceWrapper({ children }: { children: React.ReactNode }) {
  // Minimal wrapper since framer-motion AnimatePresence is heavy for simple tasks
  return <div className="animate-in fade-in zoom-in duration-300">{children}</div>;
}
