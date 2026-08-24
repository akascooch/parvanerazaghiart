import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';
import { MEDIA_MAX_PER_ARTWORK } from '../media.constants';

export class ReorderMediaDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MEDIA_MAX_PER_ARTWORK)
  @IsString({ each: true })
  ids: string[];
}
