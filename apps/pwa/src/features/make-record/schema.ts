import { z } from 'zod';
import {
  TYPE_OF_RECORD_PROPERTY_NAME,
  TAGS_LIST_PROPERTY_NAME,
  AMOUNT_PROPERTY_NAME,
  FUND_PROPERTY_NAME,
} from './constants';

export const formSchema = z.object({
  [TYPE_OF_RECORD_PROPERTY_NAME]: z.enum(['cost', 'income']),
  [TAGS_LIST_PROPERTY_NAME]: z
    .object({
      id: z.string(),
    })
    .array()
    .min(1),
  [AMOUNT_PROPERTY_NAME]: z.number().positive(),
  [FUND_PROPERTY_NAME]: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;