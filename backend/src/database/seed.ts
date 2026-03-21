import 'reflect-metadata';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.prestai_host || 'localhost',
  port: parseInt(process.env.prestai_port || '5432', 10),
  username: process.env.prestai_user || '',
  password: process.env.prestai_password || '',
  database: process.env.prestai_database || '',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();



  await dataSource.destroy();
}

seed()
  .then(() => {
    console.log('Seed completed');
  })
  .catch((err) => {
    console.error('Seed failed', err);
  });
