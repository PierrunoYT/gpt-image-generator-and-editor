import os
import base64
import time
from flask import Flask, render_template, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
import tempfile

load_dotenv()

app = Flask(__name__)

# Initialize OpenAI client
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except TypeError:
    # Handle older versions of the OpenAI library that might require different initialization
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url="https://api.openai.com/v1"
    )

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate_image():
    data = request.json
    prompt = data.get("prompt")
    model = data.get("model", "gpt-image-1")
    size = data.get("size", "1024x1024")
    quality = data.get("quality", "auto")
    background = data.get("background", "opaque")
    
    try:
        result = client.images.generate(
            model=model,
            prompt=prompt,
            size=size,
            quality=quality,
            background=background
        )
        
        # Extract image data - the response structure may differ based on API version
        image_b64 = getattr(result.data[0], "b64_json", None)
        if not image_b64 and hasattr(result.data[0], "url"):
            # If b64_json is not available, download the image from URL
            import requests
            response = requests.get(result.data[0].url)
            if response.status_code == 200:
                import base64
                image_b64 = base64.b64encode(response.content).decode('utf-8')
        
        if not image_b64:
            return jsonify({"success": False, "error": "Failed to get image data from API response"})
            
        return jsonify({"success": True, "image": image_b64})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route("/edit", methods=["POST"])
def edit_image():
    # Temporary file paths to clean up at the end
    temp_files = []
    
    try:
        prompt = request.form["prompt"]
        model = request.form.get("model", "gpt-image-1")
        size = request.form.get("size", "1024x1024")
        quality = request.form.get("quality", "auto")
        
        image_file = request.files["image"]
        mask_file = request.files.get("mask")
        
        # Create directory for temporary files if it doesn't exist
        temp_dir = os.path.join(tempfile.gettempdir(), "openai_image_app")
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save main image to a temporary file
        image_path = os.path.join(temp_dir, f"image_{int(time.time())}.png")
        image_file.save(image_path)
        temp_files.append(image_path)
        
        if mask_file:
            # Single image with mask (inpainting)
            mask_path = os.path.join(temp_dir, f"mask_{int(time.time())}.png")
            mask_file.save(mask_path)
            temp_files.append(mask_path)
            
            # Make sure both files exist
            if not os.path.exists(image_path) or not os.path.exists(mask_path):
                return jsonify({"success": False, "error": "Failed to save temporary files"})
            
            with open(image_path, "rb") as img_file, open(mask_path, "rb") as mask_file_obj:
                result = client.images.edit(
                    model=model,
                    image=img_file,
                    mask=mask_file_obj,
                    prompt=prompt,
                    size=size,
                    quality=quality
                )
                
                # Extract image data - the response structure may differ based on API version
                image_b64 = getattr(result.data[0], "b64_json", None)
                if not image_b64 and hasattr(result.data[0], "url"):
                    # If b64_json is not available, download the image from URL
                    import requests
                    response = requests.get(result.data[0].url)
                    if response.status_code == 200:
                        import base64
                        image_b64 = base64.b64encode(response.content).decode('utf-8')
        else:
            # Multiple reference images
            additional_images = request.files.getlist("additional_images")
            image_paths = [image_path]
            
            # Save additional images to temporary files
            for i, add_img in enumerate(additional_images):
                add_img_path = os.path.join(temp_dir, f"ref_image_{i}_{int(time.time())}.png")
                add_img.save(add_img_path)
                image_paths.append(add_img_path)
                temp_files.append(add_img_path)
            
            # Verify all files exist
            for path in image_paths:
                if not os.path.exists(path):
                    return jsonify({"success": False, "error": f"Failed to save temporary file: {path}"})
            
            # Open all images as file objects
            image_files = []
            try:
                image_files = [open(path, "rb") for path in image_paths]
                
                result = client.images.edit(
                    model=model,
                    image=image_files,
                    prompt=prompt,
                    size=size,
                    quality=quality
                )
                
                # Extract image data - the response structure may differ based on API version
                image_b64 = getattr(result.data[0], "b64_json", None)
                if not image_b64 and hasattr(result.data[0], "url"):
                    # If b64_json is not available, download the image from URL
                    import requests
                    response = requests.get(result.data[0].url)
                    if response.status_code == 200:
                        import base64
                        image_b64 = base64.b64encode(response.content).decode('utf-8')
            finally:
                # Close all file objects
                for file in image_files:
                    file.close()
        
        # At this point image_b64 should be populated by one of the methods above
        if not image_b64:
            return jsonify({"success": False, "error": "Failed to get image data from API response"})
            
        return jsonify({"success": True, "image": image_b64})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        # Clean up all temporary files
        for path in temp_files:
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass  # Ignore errors during cleanup

if __name__ == "__main__":
    app.run(debug=True)