export function getAppointmentsTableName(): string {
    const tableName = process.env.APPOINTMENTS_TABLE_NAME;

    if (tableName === undefined || tableName.length === 0) {
        throw new Error('APPOINTMENTS_TABLE_NAME environment variable is required');
    }

    return tableName;
}
