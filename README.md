# DALL-E Image Generator and Editor

A secure web interface for OpenAI's DALL-E image generation and editing capabilities using DALL-E 3 for generation and DALL-E 2 for editing.

## Features

- **Image Generation**: Create images from text prompts using DALL-E 3
- **Image Editing**:
  - Use a mask to edit specific parts of an image (inpainting) using DALL-E 2
  - Create variations of existing images
- **Security Features**:
  - Secure file handling with validation
  - Input sanitization and validation
  - Temporary file cleanup
  - Security headers
- **Customization Options**:
  - Image size selection for generation:
    - 1024x1024 (Square)
    - 1024x1792 (Portrait)
    - 1792x1024 (Landscape)
  - Quality settings (standard, hd)
  - Edit sizes: 256x256, 512x512, 1024x1024
  - Drag-and-drop image upload
  - Clipboard paste support for images

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```
5. Run the application:
   ```bash
   python app.py
   ```
6. Open your browser and navigate to `http://127.0.0.1:5000`

## Security Notice

⚠️ **Important**: Never commit your actual API key to version control. The `.env` file is gitignored for security.

## Usage

### Generate Images
1. Enter a descriptive prompt
2. Select model, size, quality, and background settings
3. Click "Generate Image"
4. Download the resulting image

### Edit Images
Two editing modes are available:

1. **Single Image with Mask (Inpainting)**:
   - Upload an image to edit
   - Upload a mask where transparent areas will be edited
   - Enter a prompt describing the desired result
   - Click "Edit Image"

2. **Image Variations**:
   - Upload a reference image
   - The system will create variations of the image
   - Note: Multiple reference images are converted to variations due to API limitations

## Requirements

- Python 3.8+
- Flask 3.0+
- OpenAI Python Library 1.51+
- Python-dotenv
- Pillow (PIL)
- Werkzeug 3.0+

## Limitations

- Image generation can take up to 2 minutes for complex prompts
- API usage is subject to OpenAI's pricing and rate limits
- DALL-E 2 is used for editing (DALL-E 3 doesn't support editing yet)
- Multiple reference images are converted to variations due to API limitations

## Security Features

- Input validation and sanitization
- Secure file handling with type validation
- Temporary file cleanup
- Security headers (XSS protection, content type options, etc.)
- File size limits (16MB max)
- Secure filename generation

## Additional Features

- Continue editing previously generated images
- Unique filename generation with timestamps and descriptive elements
- Cross-browser clipboard paste support
- Real-time image preview for uploads
- Comprehensive error handling and logging