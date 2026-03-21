import * as fs from 'fs';
import * as path from 'path';

const sourcePath = process.argv[2];
const targetPath = process.argv[3];

if (!sourcePath || !targetPath) {
    console.error('Usage: ts-node generate-relationship.ts <source-entity-path> <target-entity-path>');
    process.exit(1);
}

const resolveEntity = (entityPath: string) => {
    const fullPath = path.resolve(entityPath);
    if (!fs.existsSync(fullPath)) {
        console.error(`File not found: ${fullPath}`);
        process.exit(1);
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const match = content.match(/export class (\w+)Entity/);
    if (!match) {
        console.error(`Could not find entity class name in ${entityPath}`);
        process.exit(1);
    }
    const name = match[1];
    return {
        fullPath,
        name,
        camel: name.charAt(0).toLowerCase() + name.slice(1),
        kebab: name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
        filename: path.basename(fullPath, '.ts'),
        folder: path.basename(path.dirname(fullPath)),
        moduleDir: path.dirname(path.dirname(fullPath)), // assuming src/modules/modulename/feature
    };
};

const source = resolveEntity(sourcePath);
const target = resolveEntity(targetPath);

// Define Output Paths
const relationshipsDir = path.join(source.moduleDir, 'relationships', `${source.kebab}-${target.kebab}s`);
if (!fs.existsSync(relationshipsDir)) {
    fs.mkdirSync(relationshipsDir, { recursive: true });
}

// Read Templates
const templatesPath = path.resolve(__dirname, 'templates');
const serviceTemplate = fs.readFileSync(path.join(templatesPath, 'rel-service.template.txt'), 'utf-8');
const controllerTemplate = fs.readFileSync(path.join(templatesPath, 'rel-controller.template.txt'), 'utf-8');

// Replace Placeholders
const replacePlaceholders = (content: string) => {
    return content
        .replace(/__SourceEntity__/g, `${source.name}Entity`)
        .replace(/__source-filename__/g, source.filename)
        .replace(/__source-folder__/g, source.folder)
        .replace(/__Source__/g, source.name)
        .replace(/__sourceCamel__/g, source.camel)
        .replace(/__sourceKebab__/g, source.kebab)
        
        .replace(/__TargetEntity__/g, `${target.name}Entity`)
        .replace(/__target-filename__/g, target.filename)
        .replace(/__target-folder__/g, target.folder)
        .replace(/__Target__/g, target.name)
        .replace(/__targetCamel__/g, target.camel)
        .replace(/__targetKebab__/g, target.kebab)
        .replace(/__target-dto-filename__/g, `${target.kebab}.dto`)
        
        .replace(/__ApiTag__/g, `${source.name} ${target.name}s`);
};

// Generate DTO
const dtosDir = path.join(source.moduleDir, 'dtos');
if (!fs.existsSync(dtosDir)) fs.mkdirSync(dtosDir, { recursive: true });

const dtoFile = path.join(dtosDir, `${source.kebab}-${target.kebab}.dto.ts`);
const dtoContent = `import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class Associate${target.name}sDto {
    @ApiProperty({ type: [Number], description: 'List of ${target.camel} IDs to associate' })
    @IsArray()
    @IsInt({ each: true })
    ${target.camel}Ids: number[];
}
`;
if (!fs.existsSync(dtoFile)) {
    fs.writeFileSync(dtoFile, dtoContent);
    console.log(`✅ Generated DTO: ${dtoFile}`);
} else {
    console.log(`⚠️ DTO already exists: ${dtoFile}`);
}

// Generate Service
const serviceFile = path.join(relationshipsDir, `${source.kebab}-${target.kebab}s.service.ts`);
fs.writeFileSync(serviceFile, replacePlaceholders(serviceTemplate));
console.log(`✅ Generated Service: ${serviceFile}`);

// Generate Controller
const controllerFile = path.join(relationshipsDir, `${source.kebab}-${target.kebab}s.controller.ts`);
fs.writeFileSync(controllerFile, replacePlaceholders(controllerTemplate));
console.log(`✅ Generated Controller: ${controllerFile}`);

console.log(`\n🎉 Module files generated! Next steps:`);
console.log(`1. Create a module file: ${source.kebab}-${target.kebab}s.module.ts`);
console.log(`2. Register the generated Service and Controller.`);
console.log(`3. Ensure TypeOrmModule.forFeature([${source.name}Entity, ${target.name}Entity]) is imported.`);
