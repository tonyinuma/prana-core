import { DomainError } from '../errors/DomainError';

export function validateInsuredId(insuredId: string): void {
    if (typeof insuredId !== 'string' || !/^\d{5}$/.test(insuredId)) {
        throw new DomainError('insuredId must contain exactly 5 digits');
    }
}
