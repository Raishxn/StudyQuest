import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  console.log('🏛️ Reading institutions from SISU dataset...');
  const sisuraw = fs.readFileSync(
    path.join(__dirname, '../../../banco_site_com_sisu.json'),
    'utf-8'
  );

  const sisuData = JSON.parse(sisuraw);

  // Deduplicar por CO_IES + NO_CAMPUS
  const seenInstitutionsAndCampus = new Set<string>();
  const institutions = [];
  const coursesToSeed = [];

  console.log('🏛️ Parsing and deduplicating...');
  for (const item of sisuData) {
    if (!item.CO_IES || !item.CURSOS || item.CURSOS.length === 0) continue;

    // A instituição pai
    const emecCode = String(item.CO_IES);
    const parentName = item.NOME_DA_IES;
    const parentShortName = item.SIGLA || null;
    const type = item.CATEGORIA_DA_IES?.toUpperCase() === 'PÚBLICA' ? 'FEDERAL' : 'PRIVADA'; // simplification

    for (const curso of item.CURSOS) {
      // Garantindo os dados do campus
      const campusName = curso.NO_CAMPUS || 'Campus Sede';
      const city = curso.NO_MUNICIPIO_CAMPUS || item.NO_MUNICIPIO_CAMPUS || 'Desconhecido';
      const state = item.UF || 'BR';

      const uniqueKey = `${emecCode}-${campusName}`;

      if (!seenInstitutionsAndCampus.has(uniqueKey)) {
        seenInstitutionsAndCampus.add(uniqueKey);
        institutions.push({
          emecCode,
          name: parentName,
          shortName: parentShortName,
          campus: campusName,
          type,
          state,
          city,
          active: true,
        });
      }

      coursesToSeed.push({
        name: curso.NO_CURSO,
        area: curso.DS_GRAU || 'Graduação',
        emecCode,
        campus: campusName
      });
    }
  }

  console.log(`🏛️ Seeding ${institutions.length} institutions (Unique Campuses)...`);

  const instMap = new Map();

  for (const inst of institutions) {
    const createdInst = await prisma.institution.upsert({
      where: { emecCode_campus: { emecCode: inst.emecCode, campus: inst.campus } },
      update: { city: inst.city, state: inst.state, name: inst.name, shortName: inst.shortName, type: inst.type },
      create: inst,
    });
    instMap.set(`${inst.emecCode}-${inst.campus}`, createdInst.id);
  }

  console.log('📚 Seeding courses (this might take a while)...');

  // Deduplicar os cursos dentro do mesmo campus para ignorar turnos diferentes etc.
  const seenCourses = new Set<string>();

  for (const course of coursesToSeed) {
    const parentId = instMap.get(`${course.emecCode}-${course.campus}`);
    if (!parentId) continue;

    const courseKey = `${parentId}-${course.name}`;
    if (seenCourses.has(courseKey)) continue;
    seenCourses.add(courseKey);

    const existing = await prisma.course.findFirst({
      where: { institutionId: parentId, name: course.name },
    });

    if (!existing) {
      await prisma.course.create({
        data: {
          name: course.name,
          area: course.area,
          institutionId: parentId,
        },
      });
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
