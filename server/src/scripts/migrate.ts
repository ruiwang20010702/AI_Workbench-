import pool from '../config/database';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    console.log('开始运行数据库迁移...');
    
    // 运行todos表迁移
    const todosMigrationPath = path.join(__dirname, 'migrate-todos.sql');
    if (fs.existsSync(todosMigrationPath)) {
      const todosSql = fs.readFileSync(todosMigrationPath, 'utf8');
      console.log('执行todos表迁移...');
      await pool.query(todosSql);
    }

    // 运行projects表迁移
    const projectsMigrationPath = path.join(__dirname, 'migrate-projects-add-tags.sql');
    if (fs.existsSync(projectsMigrationPath)) {
      const projectsSql = fs.readFileSync(projectsMigrationPath, 'utf8');
      console.log('执行projects表迁移...');
      await pool.query(projectsSql);
    }

    // 运行其他迁移文件
    const migrationsDir = path.join(__dirname, '../../database');
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'));
      
      for (const file of migrationFiles) {
        const migrationPath = path.join(migrationsDir, file);
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        console.log(`执行迁移文件: ${file}`);
        await pool.query(migrationSql);
      }
    }
    
    console.log('✅ 数据库迁移完成');
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runMigrations();
}

export default runMigrations;