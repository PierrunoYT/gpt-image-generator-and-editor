# GPT-image-1.5 Generator and Editor

A secure web interface for OpenAI's GPT-image-1.5 model - the latest and most advanced image generation model with superior instruction following, text rendering, and high-fidelity output.

## Features

- **Image Generation**: Create high-fidelity images from text prompts using GPT-image-1.5
- **Image Editing**:
  - Use a mask to edit specific parts of an image (inpainting) using GPT-image-1.5
  - Edit with multiple reference images (up to 16, with first 5 at high fidelity)
  - Superior text rendering within images
- **Security Features**:
  - Secure file handling with validation
  - Input sanitization and validation
  - Temporary file cleanup
  - Security headers
- **Customization Options**:
  - Image size selection for generation:
    - 1024x1024 (Square) - Standard format
    - 1024x1536 (Portrait) - Vertical format
    - 1536x1024 (Landscape) - Horizontal format
    - Auto - Model chooses best size based on prompt
  - Quality settings (low, medium, high, auto)
  - Edit sizes: 1024x1024, 1024x1536, 1536x1024
  - High resolution support up to 4096x4096 pixels
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
2. Select size and quality settings
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
   - The system will create variations of the image using GPT-image-1
   - Better understanding of image content and context

## Requirements

- Python 3.8+
- Flask 3.0+
- OpenAI Python Library 1.51+
- Python-dotenv
- Pillow (PIL)
- Werkzeug 3.0+

## Limitations

- Image generation can take up to 2 minutes for complex prompts
- API usage is subject to OpenAI's pricing and rate limits (token-based pricing)
- GPT-image-1.5 is the latest model (state of the art quality)
- Requires organization verification to access GPT Image models

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