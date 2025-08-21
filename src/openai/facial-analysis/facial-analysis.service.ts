import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class FacialAnalysisService {
  private apiKey = process.env.FACEPP_API_KEY;
  private apiSecret = process.env.FACEPP_API_SECRET;

  async analyzeFace(base64Image: string) {
    if (!base64Image) {
      throw new BadRequestException('Image data is empty');
    }

    const url = 'https://api-us.faceplusplus.com/facepp/v3/detect';

    const formData = new FormData();
    formData.append('api_key', this.apiKey);
    formData.append('api_secret', this.apiSecret);
    formData.append('image_base64', base64Image); // pass base64 in form-data
    formData.append('return_attributes', 'gender,age,smiling,emotion,beauty,skinstatus');

    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity, // allow large image data
      maxBodyLength: Infinity,
    });

    return response.data;
  }
}
