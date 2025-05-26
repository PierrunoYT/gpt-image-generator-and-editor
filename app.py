import os
import time
import logging
import secrets
from werkzeug.utils import secure_filename
from flask import Flask, render_template, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
import tempfile
from PIL import Image

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Security configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
ALLOWED_MIME_TYPES = {'image/png', 'image/jpeg', 'image/webp'}

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
if not api_key or api_key == "your_openai_api_key_here":
    logger.error("OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.")
    raise ValueError("OpenAI API key not configured")

try:
    client = OpenAI(api_key=api_key)
    # Test the connection
    client.models.list()
    logger.info("OpenAI client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    raise

# Helper functions
def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image_file(file):
    """Validate uploaded image file"""
    if not file or file.filename == '':
        return False, "No file selected"

    if not allowed_file(file.filename):
        return False, f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"

    # Check file size (Flask already handles MAX_CONTENT_LENGTH, but we can add custom logic)
    file.seek(0, 2)  # Seek to end
    size = file.tell()
    file.seek(0)  # Reset to beginning

    if size > app.config['MAX_CONTENT_LENGTH']:
        return False, "File too large"

    # Validate it's actually an image using PIL
    try:
        with Image.open(file) as img:
            img.verify()
        file.seek(0)  # Reset file pointer after verification
        return True, "Valid image"
    except Exception:
        return False, "Invalid image file"

def sanitize_prompt(prompt):
    """Sanitize user prompt"""
    if not prompt or not isinstance(prompt, str):
        return None

    # Remove excessive whitespace and limit length
    prompt = prompt.strip()
    if len(prompt) > 4000:  # OpenAI has a limit
        prompt = prompt[:4000]

    return prompt

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate_image():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No JSON data provided"})

        prompt = sanitize_prompt(data.get("prompt"))
        if not prompt:
            return jsonify({"success": False, "error": "Valid prompt is required"})

        # Use GPT-image-1 model
        model = "gpt-image-1"
        size = data.get("size", "1024x1024")
        quality = data.get("quality", "high")

        # Validate size for GPT-image-1
        valid_sizes = ["1024x1024", "1024x1536", "1536x1024", "auto"]
        if size not in valid_sizes:
            size = "1024x1024"

        # Validate quality for GPT-image-1
        valid_qualities = ["low", "medium", "high", "auto"]
        if quality not in valid_qualities:
            quality = "high"

        logger.info(f"Generating image with GPT-image-1, prompt: {prompt[:100]}...")

        # Log the exact parameters being sent to the API
        logger.info("Sending parameters to API: %s", {
            "model": model,
            "prompt": prompt,
            "size": size,
            "quality": quality,
            "n": 1
        })

        # Generate image using GPT-image-1
        result = client.images.generate(
            model=model,
            prompt=prompt,
            size=size,
            quality=quality,
            n=1
        )

        # Extract URL from response (GPT-image-1 returns URL by default)
        if result.data and len(result.data) > 0:
            image_url = result.data[0].url
            if image_url:
                logger.info("Image generated successfully")
                return jsonify({"success": True, "image_url": image_url})

        logger.error("No image data in API response")
        return jsonify({"success": False, "error": "Failed to get image data from API response"})

    except Exception as e:
        logger.error(f"Error generating image: {e}")
        return jsonify({"success": False, "error": f"Generation failed: {str(e)}"})

@app.route("/edit", methods=["POST"])
def edit_image():
    """Handle image editing requests"""
    temp_files = []

    try:
        # Validate and sanitize prompt
        prompt = sanitize_prompt(request.form.get("prompt"))
        if not prompt:
            return jsonify({"success": False, "error": "Valid prompt is required"})

        # Validate parameters
        size = request.form.get("size", "1024x1024")

        # Validate size for GPT-image-1 editing
        valid_sizes = ["1024x1024", "1024x1536", "1536x1024"]
        if size not in valid_sizes:
            size = "1024x1024"

        # Get uploaded files
        image_file = request.files.get("image")
        mask_file = request.files.get("mask")

        # Validate main image
        if not image_file:
            return jsonify({"success": False, "error": "Image file is required"})

        is_valid, error_msg = validate_image_file(image_file)
        if not is_valid:
            return jsonify({"success": False, "error": f"Invalid image: {error_msg}"})

        # Create secure temporary directory
        temp_dir = os.path.join(tempfile.gettempdir(), "openai_image_app", secrets.token_hex(8))
        os.makedirs(temp_dir, exist_ok=True)

        # Save main image with secure filename
        image_filename = secure_filename(f"image_{int(time.time())}_{secrets.token_hex(4)}.png")
        image_path = os.path.join(temp_dir, image_filename)
        image_file.save(image_path)
        temp_files.append(image_path)

        if mask_file:
            # Single image with mask (inpainting)
            is_valid_mask, mask_error = validate_image_file(mask_file)
            if not is_valid_mask:
                return jsonify({"success": False, "error": f"Invalid mask: {mask_error}"})

            mask_filename = secure_filename(f"mask_{int(time.time())}_{secrets.token_hex(4)}.png")
            mask_path = os.path.join(temp_dir, mask_filename)
            mask_file.save(mask_path)
            temp_files.append(mask_path)

            # Verify files exist
            if not os.path.exists(image_path) or not os.path.exists(mask_path):
                return jsonify({"success": False, "error": "Failed to save temporary files"})

            logger.info(f"Editing image with GPT-image-1 and mask, prompt: {prompt[:100]}...")

            with open(image_path, "rb") as img_file, open(mask_path, "rb") as mask_file_obj:
                # Use GPT-image-1 for editing
                result = client.images.edit(
                    model="gpt-image-1",
                    image=img_file,
                    mask=mask_file_obj,
                    prompt=prompt,
                    n=1,
                    size=size
                )

                # Extract URL from response
                if result.data and len(result.data) > 0:
                    image_url = result.data[0].url
                    if image_url:
                        logger.info("Image edited successfully with mask")
                        return jsonify({"success": True, "image_url": image_url})
        else:
            # Multiple reference images - Note: GPT-image-1 supports better image understanding
            # We'll use image variations with GPT-image-1
            additional_images = request.files.getlist("additional_images")

            if not additional_images:
                return jsonify({"success": False, "error": "No additional images provided for reference mode"})

            # Use image variations with GPT-image-1
            logger.info(f"Creating variation with GPT-image-1, prompt: {prompt[:100]}...")

            with open(image_path, "rb") as img_file:
                # Use GPT-image-1 for image variations
                result = client.images.create_variation(
                    model="gpt-image-1",
                    image=img_file,
                    n=1,
                    size=size
                )

                # Extract URL from response
                if result.data and len(result.data) > 0:
                    image_url = result.data[0].url
                    if image_url:
                        logger.info("Image variation created successfully")
                        return jsonify({"success": True, "image_url": image_url})

        # If we reach here, something went wrong
        logger.error("Failed to get image data from API response")
        return jsonify({"success": False, "error": "Failed to get image data from API response"})

    except Exception as e:
        logger.error(f"Error editing image: {e}")
        return jsonify({"success": False, "error": f"Edit failed: {str(e)}"})
    finally:
        # Clean up all temporary files
        for path in temp_files:
            try:
                if os.path.exists(path):
                    os.remove(path)
                    logger.debug(f"Cleaned up temporary file: {path}")
            except Exception as cleanup_error:
                logger.warning(f"Failed to cleanup file {path}: {cleanup_error}")

        # Clean up temporary directory if empty
        try:
            if temp_files and os.path.exists(temp_dir):
                os.rmdir(temp_dir)
                logger.debug(f"Cleaned up temporary directory: {temp_dir}")
        except Exception:
            pass  # Directory might not be empty or might not exist

# Error handlers
@app.errorhandler(413)
def too_large(_):
    return jsonify({"success": False, "error": "File too large. Maximum size is 16MB."}), 413

@app.errorhandler(400)
def bad_request(_):
    return jsonify({"success": False, "error": "Bad request"}), 400

@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Internal server error: {e}")
    return jsonify({"success": False, "error": "Internal server error"}), 500

# Security headers
@app.after_request
def after_request(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

if __name__ == "__main__":
    # Only run in debug mode if explicitly set
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='127.0.0.1', port=5000)