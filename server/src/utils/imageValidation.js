// Lightweight image-header validator (no external image-processing dependency).
// Confirms the uploaded file is a genuine, non-corrupted PNG/JPEG and reads its
// real pixel dimensions straight from the file's own header bytes, rather than
// trusting the client-supplied MIME type and file size alone.
import { AppError } from './AppError.js';

const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;

function readPngDimensions(buffer) {
  const isPng =
    buffer.length >= 24 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a;
  if (!isPng) return null;
  // IHDR chunk always immediately follows the signature: length(4) + 'IHDR'(4) + width(4) + height(4)
  const isIhdr = buffer[12] === 0x49 && buffer[13] === 0x48 && buffer[14] === 0x44 && buffer[15] === 0x52;
  if (!isIhdr) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readJpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    // SOF0-SOF3, SOF5-SOF7, SOF9-SOF11, SOF13-SOF15 carry the frame dimensions
    const isSof = (marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf);
    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (isSof) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }
    if (marker === 0xd8 || marker === 0xd9) return null;
    offset += 2 + segmentLength;
  }
  return null;
}

// Throws if the file is not a parseable PNG/JPEG, or is smaller than the
// platform's minimum acceptable dimensions. Returns { width, height } on success.
export function validateImageDimensions(buffer, { minWidth = MIN_WIDTH, minHeight = MIN_HEIGHT } = {}) {
  const dimensions = readPngDimensions(buffer) ?? readJpegDimensions(buffer);
  if (!dimensions || !dimensions.width || !dimensions.height) {
    throw new AppError('The uploaded file is not a valid or is a corrupted image.', 422);
  }
  if (dimensions.width < minWidth || dimensions.height < minHeight) {
    throw new AppError(`Image is too small. Minimum size is ${minWidth}x${minHeight}px.`, 422);
  }
  return dimensions;
}
