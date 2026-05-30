import { PartialType } from '@nestjs/swagger';
import { CreateKnowledgePointDto } from './create-knowledge-point.dto';

export class UpdateKnowledgePointDto extends PartialType(
  CreateKnowledgePointDto,
) {}
