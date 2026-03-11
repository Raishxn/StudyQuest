import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const missions = [
    // CATEGORIA: ESTUDO GERAL (25 missões)
    { title: "Primeiro Passo", description: "Estude por pelo menos 30 minutos", target: 30, unit: "minutes", xpReward: 50, category: "GERAL" },
    { title: "Hora do Saber", description: "Complete 1 hora de estudo", target: 60, unit: "minutes", xpReward: 80, category: "GERAL" },
    { title: "Bloco de Estudo", description: "Complete 3 horas de estudo esta semana", target: 180, unit: "minutes", xpReward: 150, category: "GERAL" },
    { title: "Meio Dia de Foco", description: "Acumule 6 horas de estudo", target: 360, unit: "minutes", xpReward: 250, category: "GERAL" },
    { title: "Dia Inteiro de Conhecimento", description: "Acumule 8 horas de estudo", target: 480, unit: "minutes", xpReward: 320, category: "GERAL" },
    { title: "Maratona Acadêmica", description: "Estude 12 horas nesta semana", target: 720, unit: "minutes", xpReward: 450, category: "GERAL" },
    { title: "Estudante Elite", description: "Atinja 20 horas de estudo", target: 1200, unit: "minutes", xpReward: 700, category: "GERAL" },
    { title: "Consistência é Poder", description: "Estude ao menos 1 hora por dia, 3 dias seguidos", target: 3, unit: "consecutive_days", xpReward: 200, category: "GERAL" },
    { title: "Semana Sem Falhas", description: "Registre uma sessão de estudo todos os 7 dias", target: 7, unit: "study_days", xpReward: 400, category: "GERAL" },
    { title: "Sessão Rápida", description: "Inicie e conclua 3 sessões de estudo diferentes", target: 3, unit: "sessions", xpReward: 120, category: "GERAL" },
    { title: "Multi-Sessão", description: "Complete 5 sessões de estudo", target: 5, unit: "sessions", xpReward: 180, category: "GERAL" },
    { title: "Dez Sessões", description: "Complete 10 sessões esta semana", target: 10, unit: "sessions", xpReward: 300, category: "GERAL" },
    { title: "Ritmo Constante", description: "Faça pelo menos 1 sessão por dia por 5 dias", target: 5, unit: "study_days", xpReward: 280, category: "GERAL" },
    { title: "Foco Matinal", description: "Inicie uma sessão antes das 9h da manhã", target: 1, unit: "morning_sessions", xpReward: 100, category: "GERAL" },
    { title: "Estudo Noturno", description: "Complete uma sessão após as 20h", target: 1, unit: "night_sessions", xpReward: 100, category: "GERAL" },
    { title: "Foco das 6", description: "Inicie uma sessão antes das 7h", target: 1, unit: "early_sessions", xpReward: 150, category: "GERAL" },
    { title: "Variedade de Matérias", description: "Estude ao menos 3 matérias diferentes", target: 3, unit: "unique_subjects", xpReward: 200, category: "GERAL" },
    { title: "Especialização", description: "Dedique 5 horas a uma única matéria", target: 300, unit: "minutes_single_subject", xpReward: 220, category: "GERAL" },
    { title: "Duas Frentes", description: "Estude pelo menos 2 horas em 2 matérias diferentes", target: 2, unit: "subjects_2h_each", xpReward: 250, category: "GERAL" },
    { title: "XP Semanal Básico", description: "Ganhe 200 XP esta semana", target: 200, unit: "xp", xpReward: 100, category: "GERAL" },
    { title: "XP Intermediário", description: "Ganhe 500 XP esta semana", target: 500, unit: "xp", xpReward: 200, category: "GERAL" },
    { title: "XP Avançado", description: "Ganhe 1000 XP nesta semana", target: 1000, unit: "xp", xpReward: 400, category: "GERAL" },
    { title: "Sem Pausas Longas", description: "Complete uma sessão de 1h sem pausar", target: 60, unit: "minutes_no_pause", xpReward: 180, category: "GERAL" },
    { title: "Sessão de Resistência", description: "Complete uma sessão contínua de 2 horas", target: 120, unit: "minutes_no_pause", xpReward: 280, category: "GERAL" },
    { title: "Explorador de Horários", description: "Faça sessões em 3 períodos distintos (manhã, tarde, noite)", target: 3, unit: "time_periods", xpReward: 220, category: "GERAL" },

    // CATEGORIA: POMODORO (15 missões)
    { title: "Primeiro Tomate", description: "Complete 1 ciclo Pomodoro", target: 1, unit: "pomodoros", xpReward: 60, category: "POMODORO" },
    { title: "Colheita de Tomates", description: "Complete 5 ciclos Pomodoro", target: 5, unit: "pomodoros", xpReward: 150, category: "POMODORO" },
    { title: "Granja de Foco", description: "Complete 10 ciclos Pomodoro", target: 10, unit: "pomodoros", xpReward: 250, category: "POMODORO" },
    { title: "Forno de Pomodoro", description: "Complete 15 ciclos Pomodoro", target: 15, unit: "pomodoros", xpReward: 350, category: "POMODORO" },
    { title: "Pomodoro Mestre", description: "Complete 20 ciclos Pomodoro nesta semana", target: 20, unit: "pomodoros", xpReward: 450, category: "POMODORO" },
    { title: "Quatro Rodadas", description: "Complete um ciclo completo de 4 Pomodoros seguidos", target: 4, unit: "consecutive_pomodoros", xpReward: 200, category: "POMODORO" },
    { title: "Dia de Pomodoros", description: "Complete 8 Pomodoros em um único dia", target: 8, unit: "pomodoros_single_day", xpReward: 300, category: "POMODORO" },
    { title: "Técnica Perfeita", description: "Complete 3 ciclos sem pular a pausa", target: 3, unit: "full_pomodoro_cycles", xpReward: 180, category: "POMODORO" },
    { title: "Tomate Duplo", description: "Complete Pomodoros em 2 matérias diferentes", target: 2, unit: "pomodoro_subjects", xpReward: 160, category: "POMODORO" },
    { title: "Tomate Triplo", description: "Complete Pomodoros em 3 matérias diferentes", target: 3, unit: "pomodoro_subjects", xpReward: 220, category: "POMODORO" },
    { title: "Madrugada Pomodoro", description: "Complete um Pomodoro antes das 8h", target: 1, unit: "morning_pomodoros", xpReward: 130, category: "POMODORO" },
    { title: "Pomodoro Noturno", description: "Complete um Pomodoro após as 22h", target: 1, unit: "late_pomodoros", xpReward: 130, category: "POMODORO" },
    { title: "Sequência de Foco", description: "Complete Pomodoros por 3 dias seguidos", target: 3, unit: "pomodoro_days", xpReward: 240, category: "POMODORO" },
    { title: "Semana do Tomate", description: "Complete ao menos 1 Pomodoro todos os dias da semana", target: 7, unit: "pomodoro_days", xpReward: 380, category: "POMODORO" },
    { title: "Desafio dos 25", description: "Complete 25 ciclos Pomodoro", target: 25, unit: "pomodoros", xpReward: 550, category: "POMODORO" },

    // CATEGORIA: COMUNIDADE (20 missões)
    { title: "Compartilhe seu Saber", description: "Envie 1 material ao banco de provas", target: 1, unit: "uploads", xpReward: 100, category: "COMUNIDADE" },
    { title: "Doador de Conhecimento", description: "Envie 3 materiais ao banco", target: 3, unit: "uploads", xpReward: 220, category: "COMUNIDADE" },
    { title: "Contribuidor da Semana", description: "Envie 5 materiais ao banco", target: 5, unit: "uploads", xpReward: 350, category: "COMUNIDADE" },
    { title: "Pergunta no Fórum", description: "Crie 1 post no fórum", target: 1, unit: "forum_posts", xpReward: 80, category: "COMUNIDADE" },
    { title: "Ativo no Fórum", description: "Crie 3 posts no fórum", target: 3, unit: "forum_posts", xpReward: 180, category: "COMUNIDADE" },
    { title: "Responda e Ajude", description: "Responda 1 pergunta no fórum", target: 1, unit: "forum_replies", xpReward: 70, category: "COMUNIDADE" },
    { title: "Ajudante da Semana", description: "Responda 5 perguntas no fórum", target: 5, unit: "forum_replies", xpReward: 250, category: "COMUNIDADE" },
    { title: "Mentor em Ação", description: "Tenha 1 resposta aceita como solução", target: 1, unit: "accepted_solutions", xpReward: 150, category: "COMUNIDADE" },
    { title: "Novo Aliado", description: "Adicione 1 amigo", target: 1, unit: "new_friends", xpReward: 80, category: "COMUNIDADE" },
    { title: "Faça Amigos", description: "Adicione 3 amigos", target: 3, unit: "new_friends", xpReward: 180, category: "COMUNIDADE" },
    { title: "Upvote Generoso", description: "Dê upvote em 5 materiais do banco", target: 5, unit: "upvotes_given", xpReward: 60, category: "COMUNIDADE" },
    { title: "Curador do Banco", description: "Avalie 10 materiais do banco", target: 10, unit: "upvotes_given", xpReward: 100, category: "COMUNIDADE" },
    { title: "Comentarista", description: "Comente em 3 materiais do banco", target: 3, unit: "bank_comments", xpReward: 90, category: "COMUNIDADE" },
    { title: "Visita ao Banco", description: "Acesse o banco de provas e visualize 5 materiais", target: 5, unit: "bank_views", xpReward: 50, category: "COMUNIDADE" },
    { title: "Explorador do Fórum", description: "Leia e vote em 10 posts do fórum", target: 10, unit: "forum_interactions", xpReward: 70, category: "COMUNIDADE" },
    { title: "Solicitação de Amizade", description: "Envie 2 solicitações de amizade", target: 2, unit: "friend_requests_sent", xpReward: 60, category: "COMUNIDADE" },
    { title: "Engajamento Total", description: "Faça 1 post, 1 resposta e 1 upload na mesma semana", target: 3, unit: "community_actions", xpReward: 300, category: "COMUNIDADE" },
    { title: "Parceria de Estudos", description: "Troque mensagens com 3 amigos diferentes", target: 3, unit: "chat_contacts", xpReward: 120, category: "COMUNIDADE" },
    { title: "Semana Social", description: "Interaja com o fórum por 5 dias diferentes", target: 5, unit: "forum_active_days", xpReward: 280, category: "COMUNIDADE" },
    { title: "Grande Contribuidor", description: "Some 5 uploads + 5 respostas no fórum", target: 10, unit: "total_contributions", xpReward: 400, category: "COMUNIDADE" },

    // CATEGORIA: DESAFIO ESPECIAL (20 missões — mais difíceis, mais XP)
    { title: "Dia Lendário", description: "Estude por 10 horas em um único dia", target: 600, unit: "minutes_single_day", xpReward: 500, category: "DESAFIO" },
    { title: "Noite de Gala", description: "Complete 3 horas de estudo após as 22h", target: 180, unit: "late_night_minutes", xpReward: 350, category: "DESAFIO" },
    { title: "Amanhecer do Guerreiro", description: "Estude 2 horas antes das 8h em um mesmo dia", target: 120, unit: "early_morning_minutes", xpReward: 350, category: "DESAFIO" },
    { title: "Domínio da Matéria", description: "Passe 8 horas estudando a mesma matéria nesta semana", target: 480, unit: "minutes_single_subject", xpReward: 500, category: "DESAFIO" },
    { title: "XP Semanal Máximo", description: "Atinja o cap diário de XP em 3 dias diferentes", target: 3, unit: "cap_days", xpReward: 600, category: "DESAFIO" },
    { title: "Enciclopédia Viva", description: "Envie materiais de 3 matérias diferentes", target: 3, unit: "upload_subjects", xpReward: 400, category: "DESAFIO" },
    { title: "O Infalível", description: "Estude todos os 7 dias E complete 5 Pomodoros", target: 2, unit: "dual_challenge", xpReward: 600, category: "DESAFIO" },
    { title: "Guru do Fórum", description: "Tenha 3 respostas aceitas como solução na mesma semana", target: 3, unit: "accepted_solutions", xpReward: 500, category: "DESAFIO" },
    { title: "Desafio do Centurião", description: "Ganhe 1000 XP apenas de sessões de estudo", target: 1000, unit: "session_xp", xpReward: 700, category: "DESAFIO" },
    { title: "Polímata", description: "Estude 5 matérias diferentes nesta semana", target: 5, unit: "unique_subjects", xpReward: 450, category: "DESAFIO" },
    { title: "Sessão Épica", description: "Complete uma sessão contínua de 3 horas", target: 180, unit: "minutes_no_pause", xpReward: 400, category: "DESAFIO" },
    { title: "Combo Perfeito", description: "Faça upload, post no fórum e 8 Pomodoros", target: 3, unit: "combo_actions", xpReward: 550, category: "DESAFIO" },
    { title: "Rei dos Tomates", description: "Complete 30 Pomodoros em uma semana", target: 30, unit: "pomodoros", xpReward: 650, category: "DESAFIO" },
    { title: "Monge Estudante", description: "Estude por 4 horas seguidas sem pausas", target: 240, unit: "minutes_no_pause", xpReward: 500, category: "DESAFIO" },
    { title: "Lenda Semanal", description: "Ganhe 2000 XP nesta semana", target: 2000, unit: "xp", xpReward: 800, category: "DESAFIO" },
    { title: "Desafio da Madrugada", description: "Complete 2 horas após meia-noite", target: 120, unit: "midnight_minutes", xpReward: 300, category: "DESAFIO" },
    { title: "Produtividade Máxima", description: "Complete sessões nos 3 períodos do dia (manhã/tarde/noite) no mesmo dia", target: 3, unit: "day_periods", xpReward: 350, category: "DESAFIO" },
    { title: "Inquebrável", description: "Não perca nenhuma missão semanal por 3 semanas seguidas", target: 3, unit: "perfect_weeks", xpReward: 750, category: "DESAFIO" },
    { title: "Ascensão", description: "Suba de nível esta semana", target: 1, unit: "level_ups", xpReward: 600, category: "DESAFIO" },
    { title: "Lendário da Semana", description: "Seja o 1º do ranking semanal ao fim da semana", target: 1, unit: "weekly_rank_1", xpReward: 1000, category: "DESAFIO" }
];

async function main() {
    console.log('Seeding missions...');
    await prisma.mission.deleteMany({});

    // reset current mission sets
    await prisma.weeklyMissionSet.deleteMany({});

    // reset current user missions
    await prisma.userMissionProgress.deleteMany({});

    await prisma.mission.createMany({
        data: missions,
    });
    console.log('Missions seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
