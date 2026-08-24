export function getAppointmentsTableName(): string {
    return getRequiredEnvironmentVariable('APPOINTMENTS_TABLE_NAME');
}

export function getAppointmentTopicArn(): string {
    return getRequiredEnvironmentVariable('APPOINTMENT_TOPIC_ARN');
}

function getRequiredEnvironmentVariable(name: string): string {
    const value = process.env[name];

    if (value === undefined || value.length === 0) {
        throw new Error(`${name} environment variable is required`);
    }

    return value;
}
