import { QueryBuilder } from '../query.builder.ts';

describe('QueryBuilder', () => {
    let queryBuilder: QueryBuilder;

    beforeEach(() => {
        queryBuilder = new QueryBuilder('START');
    });

    test('should initialize with the correct base query', () => {
        const result = queryBuilder.getFinalQuery();
        expect(result).toBe(encodeURI('START'));
    });

    test('should build AND query correctly', () => {
        const result = queryBuilder.and('color = "red"', 'size = "large"').getFinalQuery();
        expect(result).toBe(encodeURI('(START AND (color = "red" AND size = "large"))'));
    });

    test('should build OR query correctly', () => {
        const result = queryBuilder.or('status = "active"', 'priority = "high"').getFinalQuery();
        expect(result).toBe(encodeURI('(START OR (status = "active" OR priority = "high"))'));
    });

    test('should build NOT query correctly', () => {
        const result = queryBuilder.not('type = "premium"', 'region = "US"').getFinalQuery();
        expect(result).toBe(encodeURI('(START NOT (type = "premium" NOT region = "US"))'));
    });

    test('should chain AND, OR, and NOT correctly', () => {
        const result = queryBuilder
            .and('color = "blue"', 'size = "medium"')
            .or('category = "electronics"')
            .not('status = "inactive"')
            .getFinalQuery();
        expect(result).toBe(
            encodeURI('(((START AND (color = "blue" AND size = "medium")) OR (category = "electronics")) NOT (status = "inactive"))')
        );
    });

    test('should return literal values with quotes', () => {
        const result = QueryBuilder.literal('name');
        expect(result).toBe('"name"');
    });

    test('should apply stemming correctly', () => {
        const result = QueryBuilder.stemming('name$');
        expect(result).toBe('name*');
    });

    test('should disable stemming correctly', () => {
        const result = QueryBuilder.disableStemming('name*');
        expect(result).toBe('name$');
    });

    test('should build query with multiple ANDs and ORs', () => {
        const result = queryBuilder
            .and('age > 30', 'status = "active"')
            .or('region = "EU"')
            .and('role = "admin"')
            .getFinalQuery();
        expect(result).toBe(
            encodeURI('(((START AND (age > 30 AND status = "active")) OR (region = "EU")) AND (role = "admin"))')
        );
    });

    test('should return query with multiple NOT operators correctly', () => {
        const result = queryBuilder
            .not('status = "inactive"', 'priority = "low"')
            .not('region = "APAC"')
            .getFinalQuery();
        expect(result).toBe(
            encodeURI('((START NOT (status = "inactive" NOT priority = "low")) NOT (region = "APAC"))')
        );
    });
});
