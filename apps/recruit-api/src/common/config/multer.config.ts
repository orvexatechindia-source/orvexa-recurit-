import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

export const UPLOADS_DEST = join(process.cwd(), 'uploads');

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Create uploads folder if it doesn't exist
      if (!existsSync(UPLOADS_DEST)) {
        mkdirSync(UPLOADS_DEST, { recursive: true });
      }
      cb(null, UPLOADS_DEST);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)$/)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only PDF and Word documents (.doc/.docx) are allowed.'), false);
    }
  },
};
