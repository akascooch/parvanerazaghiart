import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateArtworkDto } from './create-artwork.dto';

describe('CreateArtworkDto', () => {
  async function run(payload: Record<string, unknown>) {
    const dto = plainToInstance(CreateArtworkDto, payload);
    return validate(dto);
  }

  it('accepts a valid title-only payload', async () => {
    const errors = await run({ title: 'Blue Silence' });
    expect(errors).toHaveLength(0);
  });

  it('rejects a title that is too short', async () => {
    const errors = await run({ title: 'A' });
    expect(errors.some((error) => error.property === 'title')).toBe(true);
  });

  it('rejects a negative price', async () => {
    const errors = await run({ title: 'Blue Silence', price: -12 });
    expect(errors.some((error) => error.property === 'price')).toBe(true);
  });

  it('rejects an unknown status', async () => {
    const errors = await run({ title: 'Blue Silence', status: 'ARCHIVED' });
    expect(errors.some((error) => error.property === 'status')).toBe(true);
  });

  it('accepts collection as optional metadata', async () => {
    const errors = await run({ title: 'Blue Silence', collection: 'Studio Studies' });
    expect(errors).toHaveLength(0);
  });
});
