import { RegisterForm } from '../../../components/auth/RegisterForm';
import { Swords } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background-base flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        
        {/* Branding */}
        <div className="flex flex-col items-center justify-center mb-8 text-accent-primary">
          <div className="w-16 h-16 bg-background-surface border border-accent-muted rounded-2xl flex items-center justify-center shadow-lg mb-4">
             <Swords className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-cinzel)] uppercase tracking-widest drop-shadow-sm">
            StudyQuest
          </h1>
          <p className="text-text-muted mt-2 text-center text-sm">
            Sua jornada acadêmica transformada em uma aventura épica.
          </p>
        </div>

        {/* Card */}
        <div className="bg-background-surface border border-border-subtle rounded-2xl shadow-xl overflow-hidden">
           <div className="p-6">
              <h2 className="text-xl font-bold text-text-primary text-center mb-6">Criar nova conta</h2>
              <RegisterForm />
           </div>
           
           <div className="p-4 bg-background-elevated border-t border-border-subtle text-center">
              <p className="text-sm text-text-secondary">
                 Já tem uma conta? <Link href="/login" className="text-accent-primary font-bold hover:underline">Entre aqui</Link>
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
