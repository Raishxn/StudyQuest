import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Seed Institutions
  console.log('🏛️ Seeding institutions...');
  const institutionsData = [
    { emecCode: '1', name: 'Universidade de São Paulo', shortName: 'USP', type: 'ESTADUAL', state: 'SP', city: 'São Paulo' },
    { emecCode: '2', name: 'Universidade Federal de Minas Gerais', shortName: 'UFMG', type: 'FEDERAL', state: 'MG', city: 'Belo Horizonte' },
    { emecCode: '3', name: 'Universidade Estadual de Campinas', shortName: 'UNICAMP', type: 'ESTADUAL', state: 'SP', city: 'Campinas' },
    { emecCode: '4', name: 'Pontifícia Universidade Católica do Rio de Janeiro', shortName: 'PUC-Rio', type: 'PRIVADA', state: 'RJ', city: 'Rio de Janeiro' },
    { emecCode: '5', name: 'Universidade Federal do Rio de Janeiro', shortName: 'UFRJ', type: 'FEDERAL', state: 'RJ', city: 'Rio de Janeiro' },
    { emecCode: '6', name: 'Universidade Federal de São Paulo', shortName: 'UNIFESP', type: 'FEDERAL', state: 'SP', city: 'São Paulo' },
    { emecCode: '7', name: 'Universidade de Brasília', shortName: 'UNB', type: 'FEDERAL', state: 'DF', city: 'Brasília' },
    { emecCode: '8', name: 'Universidade Federal de Santa Catarina', shortName: 'UFSC', type: 'FEDERAL', state: 'SC', city: 'Florianópolis' },
    { emecCode: '9', name: 'Universidade Federal do Ceará', shortName: 'UFC', type: 'FEDERAL', state: 'CE', city: 'Fortaleza' },
    { emecCode: '10', name: 'Universidade Federal da Bahia', shortName: 'UFBA', type: 'FEDERAL', state: 'BA', city: 'Salvador' },
  ];

  const institutions = [];
  for (const data of institutionsData) {
    const institution = await prisma.institution.upsert({
      where: { emecCode: data.emecCode },
      update: {},
      create: data,
    });
    institutions.push(institution);
  }

  // 2. Seed Courses per Institution
  console.log('📚 Seeding courses...');
  const coursesTemplate = [
    { name: 'Engenharia de Software', area: 'Engenharias' },
    { name: 'Direito', area: 'Humanas' },
    { name: 'Medicina', area: 'Saúde' },
    { name: 'Administração', area: 'Sociais Aplicadas' },
    { name: 'Pedagogia', area: 'Linguística e Artes' },
  ];

  for (const institution of institutions) {
    for (const data of coursesTemplate) {
      // Find based on institution & name to prevent infinite duplicates
      const existing = await prisma.course.findFirst({
        where: { institutionId: institution.id, name: data.name },
      });

      if (!existing) {
        await prisma.course.create({
          data: {
            ...data,
            institutionId: institution.id,
          },
        });
      }
    }
  }

  // 3. Seed Achievements
  console.log('🏆 Seeding achievements...');
  const achievementsData = [
    { key: 'study_1h', name: 'Primeiros Passos', description: 'Estudou por 1 hora completa', iconEmoji: '🌱', xpReward: 50, category: 'STUDY_TIME' },
    { key: 'study_10h', name: 'Dedicação', description: 'Estudou por 10 horas completas', iconEmoji: '📘', xpReward: 150, category: 'STUDY_TIME' },
    { key: 'study_50h', name: 'Estudante Focado', description: 'Estudou por 50 horas', iconEmoji: '🔥', xpReward: 500, category: 'STUDY_TIME' },
    { key: 'study_100h', name: 'Sábio', description: 'Atingiu a marca de 100 horas de estudo', iconEmoji: '🧠', xpReward: 1000, category: 'STUDY_TIME' },
    { key: 'study_500h', name: 'Lenda Viva', description: 'Sua dedicação é inabalável: 500 horas', iconEmoji: '👑', xpReward: 5000, category: 'STUDY_TIME' },
    
    { key: 'subject_10h', name: 'Foco Inicial', description: '10 horas na mesma matéria', iconEmoji: '🎯', xpReward: 100, category: 'SUBJECT_MASTERY' },
    { key: 'subject_50h', name: 'Especialista', description: '50 horas na mesma matéria', iconEmoji: '🎓', xpReward: 500, category: 'SUBJECT_MASTERY' },
    { key: 'subject_100h', name: 'Mestre da Matéria', description: '100 horas estudando a mesma matéria', iconEmoji: '🌟', xpReward: 1000, category: 'SUBJECT_MASTERY' },
    { key: 'calculus_100h', name: 'Calculista', description: 'Passou 100 horas lutando contra o Cálculo', iconEmoji: '🧮', xpReward: 1500, category: 'SUBJECT_MASTERY' },

    { key: 'marathon', name: 'Maratonista', description: '8 horas de estudo em um único dia', iconEmoji: '🏃', xpReward: 300, category: 'CHALLENGE' },
    { key: 'night_owl', name: 'Insone', description: 'Estudou após meia-noite por 10 dias', iconEmoji: '🌙', xpReward: 250, category: 'CHALLENGE' },
    { key: 'early_bird', name: 'Madrugador', description: 'Começou a estudar antes das 6 da manhã 10 vezes', iconEmoji: '🌅', xpReward: 250, category: 'CHALLENGE' },

    { key: 'pomodoro_10', name: 'Foco no Tomate', description: 'Completou 10 ciclos Pomodoro', iconEmoji: '🍅', xpReward: 100, category: 'POMODORO' },
    { key: 'pomodoro_100', name: 'Máquina de Foco', description: 'Completou 100 ciclos Pomodoro', iconEmoji: '🦾', xpReward: 1000, category: 'POMODORO' },

    { key: 'first_upload', name: 'Contribuidor Iniciante', description: 'Enviou seu primeiro material ao banco', iconEmoji: '📤', xpReward: 100, category: 'COMMUNITY' },
    { key: 'upload_10', name: 'Ajudante', description: 'Enviou 10 materiais para o banco', iconEmoji: '📚', xpReward: 300, category: 'COMMUNITY' },
    { key: 'upload_50', name: 'Bibliotecário', description: 'Enviou 50 materiais! Você é uma lenda.', iconEmoji: '🏛️', xpReward: 1500, category: 'COMMUNITY' },

    { key: 'first_reply', name: 'Ajudando o Próximo', description: 'Respondeu uma dúvida no fórum', iconEmoji: '🤝', xpReward: 50, category: 'FORUM' },
    { key: 'accepted_5', name: 'Solucionador', description: 'Teve 5 repostas aceitas como solução', iconEmoji: '✅', xpReward: 200, category: 'FORUM' },
    { key: 'accepted_50', name: 'Professor', description: 'Teve 50 respostas marcadas como solução', iconEmoji: '🧑‍🏫', xpReward: 1500, category: 'FORUM' },

    { key: 'friends_1', name: 'Não Estamos Sós', description: 'Adicionou seu primeiro amigo', iconEmoji: '👥', xpReward: 50, category: 'SOCIAL' },
    { key: 'friends_10', name: 'Sociável', description: 'Tem 10 amigos na sua lista', iconEmoji: '🎉', xpReward: 200, category: 'SOCIAL' },

    { key: 'streak_3', name: 'Rotina', description: 'Estudou por 3 dias seguidos', iconEmoji: '🔄', xpReward: 50, category: 'STREAK' },
    { key: 'streak_7', name: 'Semana Perfeita', description: 'Estudou 7 dias seguidos!', iconEmoji: '📅', xpReward: 200, category: 'STREAK' },
    { key: 'streak_30', name: 'Hábito de Ferro', description: 'Um mês inteiro sem falhar (30 dias seguidos)', iconEmoji: '⚔️', xpReward: 1000, category: 'STREAK' },
    { key: 'streak_100', name: 'Imparável', description: '100 dias seguidos de puro foco', iconEmoji: '🚀', xpReward: 5000, category: 'STREAK' },

    { key: 'rank_top100', name: 'Elite 100', description: 'Alcançou o top 100 no ranking global', iconEmoji: '💯', xpReward: 500, category: 'RANKING' },
    { key: 'rank_top10', name: 'Top 10', description: 'A elite da elite: top 10 global', iconEmoji: '🎖️', xpReward: 2000, category: 'RANKING' },
    { key: 'rank_1', name: 'O Melhor', description: 'Alcançou o Top 1 Global!', iconEmoji: '🏆', xpReward: 5000, category: 'RANKING' },
  ];

  for (const data of achievementsData) {
    await prisma.achievement.upsert({
      where: { key: data.key },
      update: data,
      create: data,
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
