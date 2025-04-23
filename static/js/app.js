document.addEventListener('DOMContentLoaded', function() {
    // Generate Image Form
    const generateForm = document.getElementById('generate-form');
    const generateBtn = document.getElementById('generate-btn');
    const generateResult = document.getElementById('generate-result');
    const loadingSpinner = generateResult.querySelector('.loading-spinner');
    const resultImageContainer = generateResult.querySelector('.result-image-container');
    const resultImage = document.getElementById('result-image');
    const downloadBtn = document.getElementById('download-btn');
    const errorMessage = generateResult.querySelector('.error-message');
    const errorAlert = errorMessage.querySelector('.alert');

    // Edit Image Form
    const editForm = document.getElementById('edit-form');
    const editBtn = document.getElementById('edit-btn');
    const editResult = document.getElementById('edit-result');
    const editLoadingSpinner = editResult.querySelector('.loading-spinner');
    const editResultImageContainer = editResult.querySelector('.result-image-container');
    const editResultImage = document.getElementById('edit-result-image');
    const editDownloadBtn = document.getElementById('edit-download-btn');
    const editErrorMessage = editResult.querySelector('.error-message');
    const editErrorAlert = editErrorMessage.querySelector('.alert');
    
    // Edit mode radio buttons
    const modeRadios = document.querySelectorAll('input[name="edit-mode"]');
    const singleImageSection = document.getElementById('single-image-section');
    const referenceImagesSection = document.getElementById('reference-images-section');
    
    // Image & mask preview elements
    const imageFile = document.getElementById('image-file');
    const imagePreview = document.getElementById('image-preview');
    const maskFile = document.getElementById('mask-file');
    const maskPreview = document.getElementById('mask-preview');
    const referenceImages = document.getElementById('reference-images');
    const referencePreviewContainer = document.getElementById('reference-preview-container');

    // Handle mode switching
    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'single') {
                singleImageSection.classList.remove('d-none');
                referenceImagesSection.classList.add('d-none');
            } else {
                singleImageSection.classList.add('d-none');
                referenceImagesSection.classList.remove('d-none');
            }
        });
    });

    // Image preview for main image
    imageFile.addEventListener('change', function() {
        previewImage(this, imagePreview);
    });

    // Image preview for mask
    maskFile.addEventListener('change', function() {
        previewImage(this, maskPreview);
    });

    // Image preview for reference images
    referenceImages.addEventListener('change', function() {
        previewReferenceImages(this);
    });

    // Generate Image Form Submission
    generateForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const prompt = document.getElementById('prompt').value;
        const model = document.getElementById('model').value;
        const size = document.getElementById('size').value;
        const quality = document.getElementById('quality').value;
        const background = document.getElementById('background').value;
        
        if (!prompt) {
            showError(errorAlert, errorMessage, 'Please enter a prompt');
            return;
        }
        
        // Reset UI
        hideElement(errorMessage);
        hideElement(resultImageContainer);
        showElement(loadingSpinner);
        generateBtn.disabled = true;
        
        // Send request to backend
        fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                model,
                size,
                quality,
                background
            })
        })
        .then(response => response.json())
        .then(data => {
            generateBtn.disabled = false;
            hideElement(loadingSpinner);
            
            if (data.success) {
                resultImage.src = 'data:image/png;base64,' + data.image;
                showElement(resultImageContainer);
            } else {
                showError(errorAlert, errorMessage, 'Error: ' + data.error);
            }
        })
        .catch(error => {
            generateBtn.disabled = false;
            hideElement(loadingSpinner);
            showError(errorAlert, errorMessage, 'Error: ' + error.message);
        });
    });

    // Edit Image Form Submission
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editMode = document.querySelector('input[name="edit-mode"]:checked').value;
        
        if (editMode === 'single' && !imageFile.files[0]) {
            showError(editErrorAlert, editErrorMessage, 'Please upload an image');
            return;
        }
        
        if (editMode === 'reference' && (!imageFile.files[0] || !referenceImages.files.length)) {
            showError(editErrorAlert, editErrorMessage, 'Please upload at least one reference image');
            return;
        }
        
        // Reset UI
        hideElement(editErrorMessage);
        hideElement(editResultImageContainer);
        showElement(editLoadingSpinner);
        editBtn.disabled = true;
        
        // Create FormData
        const formData = new FormData();
        formData.append('prompt', document.getElementById('edit-prompt').value);
        formData.append('model', document.getElementById('edit-model').value);
        
        if (editMode === 'single') {
            formData.append('image', imageFile.files[0]);
            if (maskFile.files[0]) {
                formData.append('mask', maskFile.files[0]);
            }
        } else {
            formData.append('image', imageFile.files[0]);
            
            for (let i = 0; i < referenceImages.files.length; i++) {
                formData.append('additional_images', referenceImages.files[i]);
            }
        }
        
        // Send request to backend
        fetch('/edit', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            editBtn.disabled = false;
            hideElement(editLoadingSpinner);
            
            if (data.success) {
                editResultImage.src = 'data:image/png;base64,' + data.image;
                showElement(editResultImageContainer);
            } else {
                showError(editErrorAlert, editErrorMessage, 'Error: ' + data.error);
            }
        })
        .catch(error => {
            editBtn.disabled = false;
            hideElement(editLoadingSpinner);
            showError(editErrorAlert, editErrorMessage, 'Error: ' + error.message);
        });
    });

    // Download buttons
    downloadBtn.addEventListener('click', function() {
        downloadImage(resultImage.src, 'generated-image.png');
    });
    
    editDownloadBtn.addEventListener('click', function() {
        downloadImage(editResultImage.src, 'edited-image.png');
    });

    // Helper Functions
    function showElement(element) {
        element.classList.remove('d-none');
    }
    
    function hideElement(element) {
        element.classList.add('d-none');
    }
    
    function showError(alertElement, container, message) {
        alertElement.textContent = message;
        showElement(container);
    }
    
    function previewImage(input, previewElement) {
        previewElement.innerHTML = '';
        
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('preview-image');
                previewElement.appendChild(img);
            }
            
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    function previewReferenceImages(input) {
        referencePreviewContainer.innerHTML = '';
        
        if (input.files) {
            for (let i = 0; i < input.files.length; i++) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const wrapper = document.createElement('div');
                    wrapper.classList.add('reference-image-wrapper');
                    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('reference-image');
                    
                    wrapper.appendChild(img);
                    referencePreviewContainer.appendChild(wrapper);
                }
                
                reader.readAsDataURL(input.files[i]);
            }
        }
    }
    
    function downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});