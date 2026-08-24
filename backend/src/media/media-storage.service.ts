import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, existsSync } from 'fs';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import path from 'path';

@Injectable()
export class MediaStorageService {
  constructor(private readonly config: ConfigService) {}

  root() {
    return path.resolve(
      this.config.get<string>('MEDIA_ROOT') ??
        path.join(process.cwd(), 'storage', 'media'),
    );
  }

  absolute(storageKey: string) {
    const resolved = path.resolve(this.root(), storageKey);
    this.assertInsideRoot(resolved);
    return resolved;
  }

  async save(storageKey: string, buffer: Buffer, overwrite = false) {
    const target = this.absolute(storageKey);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, buffer, { flag: overwrite ? 'w' : 'wx' });
    return target;
  }

  async read(storageKey: string): Promise<Buffer | null> {
    try {
      return await readFile(this.absolute(storageKey));
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  exists(storageKey: string) {
    return existsSync(this.absolute(storageKey));
  }

  async remove(storageKey: string) {
    const target = this.absolute(storageKey);
    try {
      await unlink(target);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') {
        throw error;
      }
    }
  }

  openReadStream(storageKey: string) {
    const target = this.absolute(storageKey);
    if (!existsSync(target)) {
      return null;
    }
    return createReadStream(target);
  }

  private assertInsideRoot(target: string) {
    const root = this.root();
    const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
    if (target !== root && !target.startsWith(prefix)) {
      throw new Error('Invalid media storage path');
    }
  }
}
