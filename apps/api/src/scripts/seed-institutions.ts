import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting eMEC Institutions Seed...');

  // Path to the JSON file
  const jsonPath = path.resolve(__dirname, '../../../../banco_site_com_sisu.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON file not found at: ${jsonPath}`);
    process.exit(1);
  }

  console.log('📖 Reading JSON file (this might take a moment)...');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);
  console.log(`✅ Loaded ${data.length} institutions from JSON.`);

  // Chunking configuration
  const CHUNK_SIZE = 500;
  
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    console.log(`⏳ Processing chunk ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(data.length / CHUNK_SIZE)}...`);

    for (const item of chunk) {
      if (!item.CODIGO_DA_IES) continue; // Skip invalid entries

      const emecCode = item.CODIGO_DA_IES.toString();
      
      try {
        const institution = await prisma.institution.upsert({
          where: { emecCode },
          update: {
             name: item.NOME_DA_IES?.trim() || 'Desconhecida',
             shortName: item.SIGLA?.trim() || null,
             type: item.CATEGORIA_DA_IES?.trim() || 'Desconhecida',
             state: item.UF?.trim() || 'ND',
             city: item.CO_IES ? 'Desconhecida' : 'Desconhecida', // The API doesn't seem to provide city strings consistently, leaving blank/default
             active: true,
          },
          create: {
             emecCode,
             name: item.NOME_DA_IES?.trim() || 'Desconhecida',
             shortName: item.SIGLA?.trim() || null,
             type: item.CATEGORIA_DA_IES?.trim() || 'Desconhecida',
             state: item.UF?.trim() || 'ND',
             city: 'N/A', // Assuming N/A since it's not present in the root payload directly, except occasionally nested
             active: true,
          },
        });

        // Insert Courses if any exist
        if (item.CURSOS && Array.isArray(item.CURSOS) && item.CURSOS.length > 0) {
            
          // Deduplicate courses by name and turn (sometimes SISU lists identical names)
          const uniqueCourses = new Map();
          for (const c of item.CURSOS) {
              if (c.NO_CURSO) {
                  const key = c.NO_CURSO.trim().toUpperCase();
                  if (!uniqueCourses.has(key)) {
                      uniqueCourses.set(key, c);
                  }
              }
          }

          const coursesToInsert = Array.from(uniqueCourses.values()).map(c => ({
              name: c.NO_CURSO.trim(),
              area: c.DS_GRAU?.trim() || 'Geral', // Reusing degree as area if real area metadata is missing
              institutionId: institution.id
          }));

          // Prisma createMany ignores duplicates if we use skipDuplicates
          if (coursesToInsert.length > 0) {
              await prisma.course.createMany({
                 data: coursesToInsert,
                 skipDuplicates: true
              });
          }
        }
      } catch (err) {
        console.error(`❌ Error processing IES ${emecCode}:`, err);
      }
    }
  }

  console.log('✅ Institutions and Courses Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
