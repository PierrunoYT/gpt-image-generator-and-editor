# GPT Image Generator and Editor

A web interface for OpenAI's image generation and editing capabilities using the GPT Image (gpt-image-1) model.

## Features

- **Image Generation**: Create images from text prompts
- **Image Editing**: 
  - Use a mask to edit specific parts of an image (inpainting)
  - Generate new images using multiple reference images
- **Customization Options**:
  - Image size selection: 
    - 1024x1024 (Square)
    - 1024x1536 (Portrait)
    - 1536x1024 (Landscape)
  - Quality settings (auto, low, medium, high)
  - Background transparency support
  - Drag-and-drop image upload
  - Clipboard paste support for images

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the application:
   ```
   python app.py
   ```
5. Open your browser and navigate to `http://127.0.0.1:5000`

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

2. **Multiple Reference Images**:
   - Upload multiple reference images (up to 4)
   - Enter a prompt describing how to combine the references
   - Click "Edit Image"

## Requirements

- Python 3.8+
- Flask
- OpenAI Python Library
- Python-dotenv

## Limitations

- Image generation can take up to 2 minutes for complex prompts
- API usage is subject to OpenAI's pricing and rate limits

## Additional Features

- Continue editing previously generated images
- Unique filename generation with timestamps and descriptive elements
- Cross-browser clipboard paste support
- Real-time image preview for uploads