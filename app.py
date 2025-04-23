import os
import base64
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
            background=background,
            response_format="b64_json"
        )
        
        image_b64 = result.data[0].b64_json
        return jsonify({"success": True, "image": image_b64})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route("/edit", methods=["POST"])
def edit_image():
    try:
        prompt = request.form["prompt"]
        model = request.form.get("model", "gpt-image-1")
        size = request.form.get("size", "1024x1024")
        quality = request.form.get("quality", "auto")
        
        image_file = request.files["image"]
        mask_file = request.files.get("mask")
        
        # Save uploaded files to temporary files
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_image:
            image_path = temp_image.name
            image_file.save(image_path)
        
        if mask_file:
            # Single image with mask (inpainting)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_mask:
                mask_path = temp_mask.name
                mask_file.save(mask_path)
            
            with open(image_path, "rb") as img_file, open(mask_path, "rb") as mask_file:
                result = client.images.edit(
                    model=model,
                    image=img_file,
                    mask=mask_file,
                    prompt=prompt,
                    size=size,
                    quality=quality,
                    response_format="b64_json"
                )
            
            # Clean up temporary files
            os.unlink(mask_path)
        else:
            # Multiple reference images
            additional_images = request.files.getlist("additional_images")
            image_paths = [image_path]
            
            # Save additional images to temporary files
            for add_img in additional_images:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_add_img:
                    add_img_path = temp_add_img.name
                    add_img.save(add_img_path)
                    image_paths.append(add_img_path)
            
            # Open all images as file objects
            image_files = [open(path, "rb") for path in image_paths]
            
            try:
                result = client.images.edit(
                    model=model,
                    image=image_files,
                    prompt=prompt,
                    size=size,
                    quality=quality,
                    response_format="b64_json"
                )
            finally:
                # Close all file objects
                for file in image_files:
                    file.close()
                
                # Clean up temporary files
                for path in image_paths:
                    os.unlink(path)
        
        # Clean up the main image temporary file
        if not mask_file and not additional_images:
            os.unlink(image_path)
        
        image_b64 = result.data[0].b64_json
        return jsonify({"success": True, "image": image_b64})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
