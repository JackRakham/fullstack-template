import * as fs from 'fs';
import * as path from 'path';

const entityPath = process.argv[2];

if (!entityPath) {
    console.error('Usage: ts-node generate-crud.ts <path-to-entity>');
    process.exit(1);
}

const fullPath = path.resolve(entityPath);
if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
}

const entityContent = fs.readFileSync(fullPath, 'utf-8');

// Helper to convert PascalCase to camelCase
const toCamel = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
// Helper to convert PascalCase to kebab-case
const toKebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// Extract Entity Name
const entityMatch = entityContent.match(/export class (\w+)Entity/);
if (!entityMatch) {
    console.error('Could not find entity class name. Expected "export class NameEntity"');
    process.exit(1);
}
const entityName = entityMatch[1];
const entityFilename = toKebab(entityName);
const entityNameCamel = toCamel(entityName);
const moduleDir = path.dirname(fullPath);
const moduleName = path.basename(path.dirname(moduleDir)); // assuming src/modules/modulename/entityname/entity.ts

// Extract Fields
const fields: { name: string, type: string, isManyToOne: boolean, relatedEntity?: string }[] = [];
const lines = entityContent.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('@Column') || line.includes('@ManyToOne')) {
        const isManyToOne = line.includes('@ManyToOne');
        let relatedEntity = '';
        if (isManyToOne) {
            const relMatch = line.match(/\(\) => (\w+)Entity/);
            if (relMatch) relatedEntity = relMatch[1];
        }

        // Find the property name and type on the next lines
        for (let j = i + 1; j < i + 5 && j < lines.length; j++) {
            const propLine = lines[j].trim();
            const propMatch = propLine.match(/^(\w+):\s*(\w+)/);
            if (propMatch) {
                fields.push({ 
                    name: propMatch[1], 
                    type: isManyToOne ? 'number' : propMatch[2], 
                    isManyToOne, 
                    relatedEntity 
                });
                break;
            }
        }
    }
}

// Templates path
const templatesPath = path.resolve(__dirname, 'templates');
const serviceTemplate = fs.readFileSync(path.join(templatesPath, 'service.template.txt'), 'utf-8');
const controllerTemplate = fs.readFileSync(path.join(templatesPath, 'controller.template.txt'), 'utf-8');
const dtoTemplate = fs.readFileSync(path.join(templatesPath, 'dto.template.txt'), 'utf-8');

// Generate DTO fields (Zod)
const zodCreateFields = fields.filter(f => !f.isManyToOne).map(f => {
    let schema = 'z.string().min(1)';
    if (f.type === 'number') schema = 'z.number()';
    if (f.type === 'boolean') schema = 'z.boolean()';
    if (f.type === 'Date') schema = 'z.date()';
    
    return `    ${f.name}: ${schema},`;
}).join('\n');

const responseFields = fields.map(f => {
    return `    @ApiProperty()\n    @Expose()\n    ${f.name}: ${f.type};`;
}).join('\n\n');

// Search methods and endpoints
const searchMethods: string[] = [];
const searchEndpoints: string[] = [];

fields.filter(f => f.isManyToOne).forEach(f => {
    const capName = f.name.charAt(0).toUpperCase() + f.name.slice(1);
    searchMethods.push(`
    async search_by_${f.name}(${f.name}_id: number, pagination: PaginationDto): Promise<PaginatedResponseDto<${entityName}ResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;
        const cacheKey = \`\${this.CACHE_KEY_PREFIX}by-${f.name}:\${${f.name}_id}:page:\${page}:size:\${page_size}\`;

        const cached = await this.cacheService.get<PaginatedResponseDto<${entityName}ResponseDto>>(cacheKey);
        if (cached) return cached;

        const [items, total] = await this.${entityNameCamel}Repository.findAndCount({
            where: { ${f.name}: { id: ${f.name}_id } } as any,
            skip: (page - 1) * page_size,
            take: page_size,
            order: { created_at: 'DESC' } as any
        });

        const dtos = plainToInstance(${entityName}ResponseDto, items, { excludeExtraneousValues: true });
        const result = { items: dtos, total };

        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);
        return result;
    }`);

    searchEndpoints.push(`
    @Get('search-by-${f.name}/:${f.name}_id')
    @ApiOperation({ summary: 'Search ${entityNameCamel}s by ${f.name}' })
    @ApiResponse({ status: 200, type: [${entityName}ResponseDto] })
    search_by_${f.name}(
        @Param('${f.name}_id', ParseIntPipe) ${f.name}_id: number,
        @Query() pagination: PaginationDto
    ): Promise<PaginatedResponseDto<${entityName}ResponseDto>> {
        return this.${entityNameCamel}sService.search_by_${f.name}(${f.name}_id, pagination);
    }`);
});

// Replacer function
const replacePlaceholders = (content: string) => {
    return content
        .replace(/__EntityName__/g, entityName)
        .replace(/__entity-filename__/g, entityFilename)
        .replace(/__entityNameCamel__/g, entityNameCamel)
        .replace(/__entity-name-kebab__/g, toKebab(entityName))
        .replace(/__entityNameLower__/g, entityName.toLowerCase())
        .replace(/__ApiTag__/g, entityName + 's')
        .replace(/__route__/g, toKebab(entityName) + 's')
        .replace(/\/\/ __SEARCH_METHODS_PLACEHOLDER__/g, searchMethods.join('\n'))
        .replace(/\/\/ __SEARCH_ENDPOINTS_PLACEHOLDER__/g, searchEndpoints.join('\n'))
        .replace(/\/\/ __ZOD_CREATE_FIELDS__/g, zodCreateFields)
        .replace(/\/\/ __RESPONSE_FIELDS__/g, responseFields);
};

// Write DTOs
const dtosPath = path.join(path.dirname(moduleDir), 'dtos', `${entityFilename}.dto.ts`);
if (!fs.existsSync(path.dirname(dtosPath))) fs.mkdirSync(path.dirname(dtosPath), { recursive: true });
fs.writeFileSync(dtosPath, replacePlaceholders(dtoTemplate));
console.log(`✅ Generated DTOs: ${dtosPath}`);

// Fill Service
const servicePath = path.join(moduleDir, `${entityFilename}s.service.ts`);
if (fs.existsSync(servicePath)) {
    fs.writeFileSync(servicePath, replacePlaceholders(serviceTemplate));
    console.log(`✅ Populated Service: ${servicePath}`);
} else {
    console.warn(`⚠️ Service file not found: ${servicePath}`);
}

// Fill Controller
const controllerPath = path.join(moduleDir, `${entityFilename}s.controller.ts`);
if (fs.existsSync(controllerPath)) {
    fs.writeFileSync(controllerPath, replacePlaceholders(controllerTemplate));
    console.log(`✅ Populated Controller: ${controllerPath}`);
} else {
    console.warn(`⚠️ Controller file not found: ${controllerPath}`);
}
