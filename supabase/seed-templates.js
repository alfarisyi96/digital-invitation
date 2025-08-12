#!/usr/bin/env node

/**
 * Template Seeder - Node.js version
 * Cross-platform template seeder for the invitation platform
 */

const { execSync, exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    dbHost: 'localhost',
    dbPort: '54322',
    dbUser: 'postgres',
    dbName: 'postgres',
    seedFile: 'supabase/seed.sql'
};

// Colors for console output
const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function checkSupabaseConnection() {
    return new Promise((resolve, reject) => {
        exec(`pg_isready -h ${config.dbHost} -p ${config.dbPort} -U ${config.dbUser}`, 
        (error, stdout, stderr) => {
            if (error) {
                reject(new Error('Supabase is not running'));
            } else {
                resolve(true);
            }
        });
    });
}

function runSeedFile() {
    return new Promise((resolve, reject) => {
        const command = 'psql';
        const args = [
            '-h', config.dbHost,
            '-p', config.dbPort,
            '-U', config.dbUser,
            '-d', config.dbName,
            '-f', config.seedFile
        ];

        const env = { ...process.env, PGPASSWORD: 'postgres' };
        
        const psql = spawn(command, args, { env, stdio: 'pipe' });
        
        let output = '';
        let errorOutput = '';
        
        psql.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        psql.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        psql.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`Seeding failed: ${errorOutput}`));
            }
        });
    });
}

function getSummary() {
    return new Promise((resolve, reject) => {
        const summaryQuery = `"SELECT 
            'Total Templates: ' || COUNT(*) as summary
        FROM templates
        UNION ALL
        SELECT 
            'Basic Templates: ' || COUNT(*) 
        FROM templates WHERE required_package = 'basic'
        UNION ALL
        SELECT 
            'Premium Templates: ' || COUNT(*) 
        FROM templates WHERE required_package = 'gold'
        UNION ALL
        SELECT 
            'Package Definitions: ' || COUNT(*) 
        FROM package_definitions;"`;

        const summaryCommand = `PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -c ${summaryQuery} -t`;
        const summaryResult = execSync(summaryCommand, { encoding: 'utf8' });

        log('📊 Seeding Summary:', colors.cyan);
        const lines = summaryResult.trim().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                log(`  ${line.trim()}`, colors.green);
            }
        });
    });
}

async function main() {
    try {
        log('🌱 Template Seeder Starting...', colors.cyan);
        
        // Check if seed file exists
        if (!fs.existsSync(config.seedFile)) {
            throw new Error(`Seed file not found: ${config.seedFile}`);
        }
        
        // Check Supabase connection
        log('📡 Checking Supabase connection...', colors.yellow);
        await checkSupabaseConnection();
        log('✅ Supabase is running', colors.green);
        
        // Run seeder
        log('🌱 Seeding templates...', colors.yellow);
        await runSeedFile();
        log('✅ Templates seeded successfully!', colors.green);
        
        // Show summary
        log('\n📊 Seeding Summary:', colors.cyan);
        const summary = await getSummary();
        summary.split('\n').forEach(line => {
            if (line.trim()) {
                log(`  ${line.trim()}`, colors.yellow);
            }
        });
        
        log('\n🎉 Seeding completed successfully!', colors.green);
        log('💡 Templates are now available in your application', colors.cyan);
        
    } catch (error) {
        log(`❌ Error: ${error.message}`, colors.red);
        if (error.message.includes('Supabase is not running')) {
            log('💡 Please start Supabase with: supabase start', colors.yellow);
        }
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main };
