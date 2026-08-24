import { DomainError } from '../../../../src/domain/errors/DomainError';
import { validateInsuredId } from '../../../../src/domain/validators/validateInsuredId';

describe('validateInsuredId', () => {
    test.each(['00000', '00123', '99999'])('accepts the five-digit identifier %s', (insuredId) => {
        expect(() => validateInsuredId(insuredId)).not.toThrow();
    });

    test.each([
        ['fewer than five digits', '1234'],
        ['more than five digits', '123456'],
        ['letters', '12A45'],
        ['spaces', ' 0123'],
        ['an empty string', ''],
        ['a number', 12345 as unknown as string],
        ['an undefined value', undefined as unknown as string],
    ])('rejects %s', (_scenario, insuredId) => {
        expect(() => validateInsuredId(insuredId)).toThrow(
            new DomainError('insuredId must contain exactly 5 digits'),
        );
    });
});
