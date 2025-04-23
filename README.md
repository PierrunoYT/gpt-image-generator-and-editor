# OpenAI Image Generator

A web interface for OpenAI's image generation capabilities, including image generation and editing using GPT Image (gpt-image-1), DALL-E 3, and DALL-E 2 models.

## Features

- **Image Generation**: Create images from text prompts
- **Image Editing**: 
  - Use a mask to edit specific parts of an image (inpainting)
  - Generate new images using multiple reference images
- **Customization Options**:
  - Model selection (GPT Image, DALL-E 3, DALL-E 2)
  - Image size (square, portrait, landscape)
  - Quality settings (low, medium, high)
  - Background transparency support

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
- GPT Image and DALL-E models have different capabilities (see OpenAI documentation for details)
- API usage is subject to OpenAI's pricing and rate limits