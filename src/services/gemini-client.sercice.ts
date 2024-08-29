import path from 'path';

import { GenerateContentResult, GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, UploadFileResponse } from '@google/generative-ai/server';

export const GeminiClientService = {
  googleFileManager: new GoogleAIFileManager(process.env.GEMINI_API_KEY),
  genAI: new GoogleGenerativeAI(process.env.GEMINI_API_KEY),

  uploadResponse(src: string): Promise<UploadFileResponse> {
    const uploadResponse = GeminiClientService.googleFileManager.uploadFile(
      path.resolve(__dirname, src),
      {
        mimeType: 'image/jpeg',
        displayName: 'Jetpack drawing',
      },
    );
    return uploadResponse;
  },

  model(mimeType: string, fileUri: string): Promise<GenerateContentResult> {
    const model = GeminiClientService.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
    const result = model.generateContent([
      {
        fileData: {
          mimeType,
          fileUri,
        },
      },
      { text: 'Descreva o valor contido na imagem apenas com o número.' },
    ]);

    return result;
  },
};
